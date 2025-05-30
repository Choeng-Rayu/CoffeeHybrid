import { Telegraf } from 'telegraf';
import config from './config/config.js';
import sessionService from './services/sessionService.js';
import { logError } from './utils/helpers.js';

// Import handlers
import { handleStart, handleHelp, handleMainMenu } from './handlers/startHandler.js';
import {
  handleBrowseMenu,
  handleCategorySelection,
  handleProductSelection,
  handleSizeSelection
} from './handlers/menuHandler.js';
import {
  handleSugarLevel,
  handleIceLevel,
  handleLevelSelection,
  handleAddOns,
  handleAddOnToggle,
  handleQuantity,
  handleQuantitySelection,
  handleBackToCustomization
} from './handlers/customizationHandler.js';
import {
  handleAddToCart,
  handleViewCart,
  handlePlaceOrder,
  handleClearCart,
  handleCancel
} from './handlers/cartHandler.js';
import {
  handleMyOrders,
  handleOrderDetails,
  handleShowQRCode,
  handleBackToOrders
} from './handlers/orderHandler.js';

// Initialize bot
const bot = new Telegraf(config.BOT_TOKEN);

// Middleware for session management
bot.use((ctx, next) => {
  if (ctx.from) {
    // Ensure session exists
    sessionService.getUserSession(ctx.from.id);
  }
  return next();
});

// Command handlers
bot.start(handleStart);
bot.help(handleHelp);

// Main menu handlers
bot.hears('🍵 Browse Menu', handleBrowseMenu);
bot.hears('🛒 View Cart', handleViewCart);
bot.hears('📋 My Orders', handleMyOrders);
bot.hears('❓ Help', handleHelp);
bot.hears('🏠 Main Menu', handleMainMenu);

// Menu category handlers
bot.hears(['☕ Hot Coffee', '🧊 Iced Coffee', '🥤 Frappes', '📋 All Items'], handleCategorySelection);

// Product selection (numbered items)
bot.hears(/^\d+\.\s/, handleProductSelection);

// Size selection
bot.hears(/^Size:\s/, handleSizeSelection);
bot.hears('Continue with Medium', async (ctx) => {
  const session = sessionService.getUserSession(ctx.from.id);
  if (session.currentProduct) {
    session.customization.size = 'medium';
    const { showCustomizationOptions } = await import('./handlers/menuHandler.js');
    await showCustomizationOptions(ctx, session.currentProduct);
  }
});

// Customization handlers
bot.hears('🍯 Sugar Level', handleSugarLevel);
bot.hears('🧊 Ice Level', handleIceLevel);
bot.hears('➕ Add-ons', handleAddOns);
bot.hears('🔢 Quantity', handleQuantity);

// Level selection (sugar/ice)
bot.hears(['None', 'Low', 'Medium', 'High'], handleLevelSelection);

// Quantity selection
bot.hears(/^[1-6]$/, handleQuantitySelection);

// Add-on toggle
bot.hears(/^[✅➕]\s/, handleAddOnToggle);

// Navigation handlers
bot.hears('⬅️ Back to Customization', handleBackToCustomization);
bot.hears('📋 Back to Orders', handleBackToOrders);

// Cart and order handlers
bot.hears('✅ Add to Cart', handleAddToCart);
bot.hears('🚀 Place Order', handlePlaceOrder);
bot.hears('🗑️ Clear Cart', handleClearCart);
bot.hears('❌ Cancel', handleCancel);

// Order detail handlers
bot.hears(/📋 Order #\w+/, handleOrderDetails);
bot.hears('📱 Show QR Code', handleShowQRCode);

// Error handling middleware
bot.catch((err, ctx) => {
  logError('BOT_ERROR', err, {
    userId: ctx.from?.id,
    messageText: ctx.message?.text,
    updateType: ctx.updateType
  });

  // Send user-friendly error message
  ctx.reply('Sorry, something went wrong. Please try again or use /start to restart.');
});

// Cleanup expired sessions periodically
setInterval(() => {
  sessionService.cleanupExpiredSessions();
}, 10 * 60 * 1000); // Every 10 minutes

// Add webhook endpoint for production
if (config.NODE_ENV === 'production') {
  // Webhook endpoint
  bot.on('webhook', (ctx) => {
    console.log('📨 Webhook received:', ctx.update);
  });
}

export default bot;
