import { Markup } from 'telegraf';
import apiService from '../services/apiService.js';
import sessionService from '../services/sessionService.js';
import { logError } from '../utils/helpers.js';

export async function handleStart(ctx) {
  const telegramUser = ctx.from;
  
  try {
    // Register or get existing user
    const userData = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || `user_${telegramUser.id}`,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name
    };

    const response = await apiService.registerUser(userData);
    
    // Update session with user data
    sessionService.updateSession(telegramUser.id, {
      user: response.user,
      state: 'idle'
    });

    const welcomeMessage = `
☕ Welcome to CoffeeHybrid Bot! ☕

Hello ${telegramUser.first_name || 'there'}! 

I'm here to help you order delicious coffee with ease. Here's what you can do:

🍵 Browse our menu from multiple coffee shops
🛒 Add items to cart with full customization
📱 Get QR codes for easy pickup
📋 View your order history

Use the menu below to get started!
    `;

    await ctx.reply(welcomeMessage, getMainMenuKeyboard());

  } catch (error) {
    logError('START_HANDLER', error, { userId: telegramUser.id });
    await ctx.reply('Sorry, there was an error setting up your account. Please try again later.');
  }
}

export function getMainMenuKeyboard() {
  return Markup.keyboard([
    ['🍵 Browse Menu', '🛒 View Cart'],
    ['📋 My Orders', '❓ Help']
  ]).resize();
}

export async function handleHelp(ctx) {
  const helpMessage = `
❓ Help & Instructions

🍵 Browse Menu - View coffee from different shops
🛒 View Cart - See items you've added
📋 My Orders - Check your order history
🚀 Place Order - Complete your purchase

📱 How to order:
1. Browse the menu and select items
2. Customize size, sugar, ice, and add-ons
3. Add items to your cart
4. Place your order
5. Show the QR code when picking up

⚠️ Important Notes:
• Orders expire in 30 minutes
• Please arrive on time for pickup
• Multiple no-shows may result in restrictions

Need more help? Contact our support team!
  `;

  await ctx.reply(helpMessage, getMainMenuKeyboard());
}

export async function handleMainMenu(ctx) {
  await ctx.reply('What would you like to do?', getMainMenuKeyboard());
}
