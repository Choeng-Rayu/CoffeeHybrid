import { Markup } from 'telegraf';
import sessionService from '../services/sessionService.js';
import apiService from '../services/apiService.js';
import { formatPrice, calculateItemPrice, generateOrderSummary, logError } from '../utils/helpers.js';
import { getMainMenuKeyboard } from './startHandler.js';
import qr from 'qr-image';

export async function handleAddToCart(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  
  if (!session.currentProduct || !session.customization) {
    await ctx.reply('No item selected for customization.');
    return;
  }

  try {
    const cartItem = {
      productId: session.currentProduct._id,
      name: session.currentProduct.name,
      shopName: session.currentProduct.shopName,
      ...session.customization,
      totalPrice: calculateItemPrice(session.currentProduct, session.customization)
    };

    sessionService.addToCart(ctx.from.id, cartItem);
    
    await ctx.reply(
      `✅ ${cartItem.name} added to cart!\n\nTotal price: ${formatPrice(cartItem.totalPrice)}`, 
      getMainMenuKeyboard()
    );

    // Clear current selection
    sessionService.clearCustomization(ctx.from.id);

  } catch (error) {
    logError('ADD_TO_CART', error, { userId: ctx.from.id });
    await ctx.reply('Error adding item to cart. Please try again.');
  }
}

export async function handleViewCart(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  
  if (session.cart.length === 0) {
    await ctx.reply(
      'Your cart is empty. Browse the menu to add items!', 
      Markup.keyboard([
        ['🍵 Browse Menu', '🏠 Main Menu']
      ]).resize()
    );
    return;
  }

  try {
    const cartSummary = generateOrderSummary(session.cart);
    const total = sessionService.getCartTotal(ctx.from.id);

    const message = `${cartSummary}\n\n💰 Total: ${formatPrice(total)}`;

    const buttons = [
      ['🚀 Place Order', '🗑️ Clear Cart'],
      ['🍵 Browse Menu', '🏠 Main Menu']
    ];

    await ctx.reply(message, Markup.keyboard(buttons).resize());

  } catch (error) {
    logError('VIEW_CART', error, { userId: ctx.from.id });
    await ctx.reply('Error loading cart. Please try again.');
  }
}

export async function handlePlaceOrder(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  
  if (!session.user) {
    await ctx.reply('Please start the bot first with /start');
    return;
  }

  if (session.cart.length === 0) {
    await ctx.reply('Your cart is empty!');
    return;
  }

  try {
    await ctx.reply('🔄 Processing your order...');

    const orderData = {
      userId: session.user.id,
      items: session.cart.map(item => ({
        productId: item.productId,
        size: item.size,
        sugarLevel: item.sugarLevel,
        iceLevel: item.iceLevel,
        addOns: item.addOns,
        quantity: item.quantity
      })),
      orderSource: 'telegram',
      customerInfo: {
        name: ctx.from.first_name || session.user.username,
        telegramUsername: ctx.from.username
      }
    };

    const response = await apiService.createOrder(orderData);
    const order = response.order;

    // Generate QR code
    const qrBuffer = qr.imageSync(order.qrToken, { type: 'png', size: 10 });
    
    // Clear cart
    sessionService.clearCart(ctx.from.id);

    let message = `🎉 Order Confirmed!\n\n`;
    message += `📋 Order ID: ${order.id}\n`;
    message += `💰 Total: ${formatPrice(order.total)}\n`;
    message += `📍 Status: ${order.status}\n\n`;
    message += `⚠️ Important:\n`;
    message += `• Your order expires in 30 minutes\n`;
    message += `• Show the QR code below when picking up\n`;
    message += `• Please arrive on time to avoid penalties\n\n`;
    message += `Thank you for your order! ☕`;

    await ctx.reply(message);
    await ctx.replyWithPhoto(
      { source: qrBuffer }, 
      {
        caption: '📱 Show this QR code when picking up your order',
        ...getMainMenuKeyboard()
      }
    );

  } catch (error) {
    logError('PLACE_ORDER', error, { 
      userId: ctx.from.id,
      cartItems: session.cart.length 
    });
    await ctx.reply('Sorry, there was an error placing your order. Please try again.');
  }
}

export async function handleClearCart(ctx) {
  try {
    sessionService.clearCart(ctx.from.id);
    await ctx.reply('🗑️ Cart cleared!', getMainMenuKeyboard());
  } catch (error) {
    logError('CLEAR_CART', error, { userId: ctx.from.id });
    await ctx.reply('Error clearing cart.');
  }
}

export async function handleCancel(ctx) {
  try {
    sessionService.clearCustomization(ctx.from.id);
    await ctx.reply('❌ Customization cancelled.', getMainMenuKeyboard());
  } catch (error) {
    logError('CANCEL', error, { userId: ctx.from.id });
    await ctx.reply('Error cancelling operation.');
  }
}
