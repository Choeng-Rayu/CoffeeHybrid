import { Markup } from 'telegraf';
import sessionService from '../services/sessionService.js';
import apiService from '../services/apiService.js';
import { formatPrice, formatDate, getStatusIcon, logError } from '../utils/helpers.js';
import { getMainMenuKeyboard } from './startHandler.js';

export async function handleMyOrders(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  
  if (!session.user) {
    await ctx.reply('Please start the bot first with /start');
    return;
  }

  try {
    await ctx.reply('🔄 Loading your orders...');

    const response = await apiService.getUserOrders(session.user.id, 10);
    const orders = response.orders;

    if (orders.length === 0) {
      await ctx.reply(
        'You have no orders yet. Start by browsing the menu!',
        Markup.keyboard([
          ['🍵 Browse Menu', '🏠 Main Menu']
        ]).resize()
      );
      return;
    }

    let message = '📋 Your Recent Orders:\n\n';

    orders.slice(0, 5).forEach((order, index) => {
      const date = formatDate(order.createdAt);
      const statusIcon = getStatusIcon(order.status);
      
      message += `${index + 1}. Order #${order._id.slice(-8)}\n`;
      message += `   📅 Date: ${date}\n`;
      message += `   ${statusIcon} Status: ${order.status}\n`;
      message += `   💰 Total: ${formatPrice(order.total)}\n`;
      message += `   📦 Items: ${order.items.length}\n`;
      
      // Show shop names for items
      const shops = [...new Set(order.items.map(item => item.shopName).filter(Boolean))];
      if (shops.length > 0) {
        message += `   🏪 Shops: ${shops.join(', ')}\n`;
      }
      
      message += '\n';
    });

    if (orders.length > 5) {
      message += `... and ${orders.length - 5} more orders\n\n`;
    }

    message += 'Select an order number to view details, or use the menu below:';

    // Create buttons for recent orders
    const orderButtons = orders.slice(0, 3).map((order, index) => 
      [`📋 Order #${order._id.slice(-8)}`]
    );

    const buttons = [
      ...orderButtons,
      ['🍵 Browse Menu', '🏠 Main Menu']
    ];

    // Store orders in session for detail viewing
    sessionService.updateSession(ctx.from.id, {
      recentOrders: orders,
      state: 'viewing_orders'
    });

    await ctx.reply(message, Markup.keyboard(buttons).resize());

  } catch (error) {
    logError('MY_ORDERS', error, { userId: ctx.from.id });
    await ctx.reply('Sorry, I couldn\'t load your orders right now. Please try again later.');
  }
}

export async function handleOrderDetails(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const orderIdMatch = ctx.message.text.match(/Order #(\w+)/);
  
  if (!orderIdMatch || !session.recentOrders) {
    await ctx.reply('Please select a valid order from the list.');
    return;
  }

  const shortOrderId = orderIdMatch[1];
  const order = session.recentOrders.find(o => o._id.slice(-8) === shortOrderId);

  if (!order) {
    await ctx.reply('Order not found. Please try again.');
    return;
  }

  try {
    let message = `📋 Order Details\n\n`;
    message += `🆔 Order ID: ${order._id}\n`;
    message += `📅 Date: ${formatDate(order.createdAt)}\n`;
    message += `${getStatusIcon(order.status)} Status: ${order.status}\n`;
    message += `💰 Total: ${formatPrice(order.total)}\n`;
    message += `📱 Source: ${order.orderSource}\n\n`;

    if (order.expiresAt) {
      const expiryDate = new Date(order.expiresAt);
      const now = new Date();
      
      if (order.status === 'pending') {
        if (expiryDate > now) {
          message += `⏰ Expires: ${formatDate(order.expiresAt)}\n`;
        } else {
          message += `⚠️ This order has expired\n`;
        }
      }
    }

    if (order.pickupTime) {
      message += `✅ Picked up: ${formatDate(order.pickupTime)}\n`;
    }

    message += `\n📦 Order Items:\n`;
    
    order.items.forEach((item, index) => {
      message += `\n${index + 1}. ${item.name}\n`;
      
      if (item.shopName) {
        message += `   🏪 ${item.shopName}\n`;
      }
      
      message += `   📏 Size: ${item.size}\n`;
      message += `   🍯 Sugar: ${item.sugarLevel}\n`;
      
      if (item.iceLevel && item.iceLevel !== 'medium') {
        message += `   🧊 Ice: ${item.iceLevel}\n`;
      }
      
      if (item.addOns && item.addOns.length > 0) {
        message += `   ➕ Add-ons: ${item.addOns.map(a => a.name).join(', ')}\n`;
      }
      
      message += `   🔢 Quantity: ${item.quantity}\n`;
      message += `   💵 Price: ${formatPrice(item.price)}\n`;
    });

    const buttons = [];
    
    // Add QR code button for pending orders
    if (order.status === 'pending' && order.qrToken) {
      buttons.push(['📱 Show QR Code']);
    }
    
    buttons.push(['📋 Back to Orders', '🏠 Main Menu']);

    // Store current order for QR display
    sessionService.updateSession(ctx.from.id, {
      currentOrderForQR: order
    });

    await ctx.reply(message, Markup.keyboard(buttons).resize());

  } catch (error) {
    logError('ORDER_DETAILS', error, { 
      userId: ctx.from.id, 
      orderId: order._id 
    });
    await ctx.reply('Error loading order details. Please try again.');
  }
}

export async function handleShowQRCode(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const order = session.currentOrderForQR;

  if (!order || !order.qrToken) {
    await ctx.reply('No QR code available for this order.');
    return;
  }

  if (order.status !== 'pending') {
    await ctx.reply('QR code is only available for pending orders.');
    return;
  }

  try {
    // Generate QR code
    const qr = await import('qr-image');
    const qrBuffer = qr.default.imageSync(order.qrToken, { type: 'png', size: 10 });

    let caption = `📱 QR Code for Order #${order._id.slice(-8)}\n\n`;
    caption += `💰 Total: ${formatPrice(order.total)}\n`;
    
    if (order.expiresAt) {
      caption += `⏰ Expires: ${formatDate(order.expiresAt)}\n`;
    }
    
    caption += `\n📍 Show this QR code when picking up your order`;

    await ctx.replyWithPhoto(
      { source: qrBuffer },
      { 
        caption: caption,
        ...Markup.keyboard([
          ['📋 Back to Orders', '🏠 Main Menu']
        ]).resize()
      }
    );

  } catch (error) {
    logError('SHOW_QR_CODE', error, { 
      userId: ctx.from.id, 
      orderId: order._id 
    });
    await ctx.reply('Error generating QR code. Please try again.');
  }
}

export async function handleBackToOrders(ctx) {
  // Clear current order and return to orders list
  sessionService.updateSession(ctx.from.id, {
    currentOrderForQR: null
  });
  
  await handleMyOrders(ctx);
}
