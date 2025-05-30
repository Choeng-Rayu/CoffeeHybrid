// Utility functions for the bot

export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

export function calculateItemPrice(product, customizations) {
  let price = product.basePrice;

  // Add size modifier
  if (customizations.size && product.sizes) {
    const sizeOption = product.sizes.find(s => s.name === customizations.size);
    if (sizeOption) {
      price += sizeOption.priceModifier;
    }
  }

  // Add add-ons price
  if (customizations.addOns && customizations.addOns.length > 0) {
    const addOnsPrice = customizations.addOns.reduce((total, addOn) => total + addOn.price, 0);
    price += addOnsPrice;
  }

  return price * (customizations.quantity || 1);
}

export function getCategoryIcon(category) {
  switch (category) {
    case 'hot': return '☕';
    case 'iced': return '🧊';
    case 'frappe': return '🥤';
    default: return '☕';
  }
}

export function getStatusIcon(status) {
  switch (status) {
    case 'pending': return '⏳';
    case 'completed': return '✅';
    case 'no-show': return '❌';
    case 'cancelled': return '🚫';
    default: return '❓';
  }
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString();
}

export function validateCustomization(product, customizations) {
  const errors = [];

  // Validate size
  if (product.sizes && product.sizes.length > 0) {
    const validSizes = product.sizes.map(s => s.name);
    if (!validSizes.includes(customizations.size)) {
      errors.push('Invalid size selected');
    }
  }

  // Validate sugar level
  const validLevels = ['none', 'low', 'medium', 'high'];
  if (!validLevels.includes(customizations.sugarLevel)) {
    errors.push('Invalid sugar level');
  }

  // Validate ice level for iced drinks
  if (product.category === 'iced' || product.category === 'frappe') {
    if (!validLevels.includes(customizations.iceLevel)) {
      errors.push('Invalid ice level');
    }
  }

  // Validate add-ons
  if (customizations.addOns && customizations.addOns.length > 0) {
    const validAddOns = product.addOns ? product.addOns.map(a => a.name) : [];
    for (const addOn of customizations.addOns) {
      if (!validAddOns.includes(addOn.name)) {
        errors.push(`Invalid add-on: ${addOn.name}`);
      }
    }
  }

  // Validate quantity
  if (customizations.quantity < 1 || customizations.quantity > 10) {
    errors.push('Quantity must be between 1 and 10');
  }

  return errors;
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

export function generateOrderSummary(cartItems) {
  if (cartItems.length === 0) return 'Your cart is empty';

  let summary = '🛒 Order Summary:\n\n';
  let total = 0;

  cartItems.forEach((item, index) => {
    summary += `${index + 1}. ${item.name}\n`;
    summary += `   Size: ${item.size}, Sugar: ${item.sugarLevel}\n`;
    
    if (item.iceLevel && item.iceLevel !== 'medium') {
      summary += `   Ice: ${item.iceLevel}\n`;
    }
    
    if (item.addOns && item.addOns.length > 0) {
      summary += `   Add-ons: ${item.addOns.map(a => a.name).join(', ')}\n`;
    }
    
    summary += `   Qty: ${item.quantity} × ${formatPrice(item.totalPrice / item.quantity)}\n`;
    summary += `   Subtotal: ${formatPrice(item.totalPrice)}\n\n`;
    
    total += item.totalPrice;
  });

  summary += `💰 Total: ${formatPrice(total)}`;
  return summary;
}

export function createDefaultCustomization(product) {
  return {
    size: product.sizes?.[0]?.name || 'medium',
    sugarLevel: 'medium',
    iceLevel: product.category === 'hot' ? 'none' : 'medium',
    addOns: [],
    quantity: 1
  };
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function logError(context, error, additionalInfo = {}) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    ...additionalInfo,
    timestamp: new Date().toISOString()
  });
}
