// Session management service
// In production, this should use Redis or a database

class SessionService {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
  }

  getUserSession(userId) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, this.createNewSession());
    }
    
    const session = this.sessions.get(userId);
    session.lastActivity = Date.now();
    return session;
  }

  createNewSession() {
    return {
      user: null,
      cart: [],
      currentProduct: null,
      customization: {},
      currentProducts: null,
      state: 'idle', // idle, browsing, customizing, ordering
      lastActivity: Date.now(),
      context: {} // For storing temporary context data
    };
  }

  updateSession(userId, updates) {
    const session = this.getUserSession(userId);
    Object.assign(session, updates);
    session.lastActivity = Date.now();
    return session;
  }

  clearCart(userId) {
    const session = this.getUserSession(userId);
    session.cart = [];
    session.lastActivity = Date.now();
  }

  addToCart(userId, item) {
    const session = this.getUserSession(userId);
    session.cart.push({
      id: Date.now() + Math.random(),
      ...item,
      addedAt: Date.now()
    });
    session.lastActivity = Date.now();
  }

  removeFromCart(userId, itemId) {
    const session = this.getUserSession(userId);
    session.cart = session.cart.filter(item => item.id !== itemId);
    session.lastActivity = Date.now();
  }

  getCartTotal(userId) {
    const session = this.getUserSession(userId);
    return session.cart.reduce((total, item) => total + item.totalPrice, 0);
  }

  clearCustomization(userId) {
    const session = this.getUserSession(userId);
    session.currentProduct = null;
    session.customization = {};
    session.state = 'idle';
    session.lastActivity = Date.now();
  }

  setState(userId, state, context = {}) {
    const session = this.getUserSession(userId);
    session.state = state;
    session.context = { ...session.context, ...context };
    session.lastActivity = Date.now();
  }

  getState(userId) {
    const session = this.getUserSession(userId);
    return {
      state: session.state,
      context: session.context
    };
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.sessions.delete(userId);
      }
    }
  }

  // Get session statistics
  getSessionStats() {
    return {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(
        session => Date.now() - session.lastActivity < 5 * 60 * 1000 // 5 minutes
      ).length
    };
  }
}

export default new SessionService();
