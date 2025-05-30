import { Markup } from 'telegraf';
import sessionService from '../services/sessionService.js';
import { formatPrice, logError } from '../utils/helpers.js';
import { showCustomizationOptions } from './menuHandler.js';

export async function handleSugarLevel(ctx) {
  const buttons = [
    ['None', 'Low'],
    ['Medium', 'High'],
    ['⬅️ Back to Customization']
  ];

  sessionService.setState(ctx.from.id, 'selecting_sugar');
  await ctx.reply('Choose your sugar level:', Markup.keyboard(buttons).resize());
}

export async function handleIceLevel(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);

  if (!session.currentProduct) {
    await ctx.reply('Please select a product first.');
    return;
  }

  if (session.currentProduct.category === 'iced' || session.currentProduct.category === 'frappe') {
    const buttons = [
      ['None', 'Low'],
      ['Medium', 'High'],
      ['⬅️ Back to Customization']
    ];

    sessionService.setState(ctx.from.id, 'selecting_ice');
    await ctx.reply('Choose your ice level:', Markup.keyboard(buttons).resize());
  } else {
    await ctx.reply('Ice level is only available for iced drinks and frappes.');
    await showCustomizationOptions(ctx, session.currentProduct);
  }
}

export async function handleLevelSelection(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const level = ctx.message.text.toLowerCase();
  const state = sessionService.getState(ctx.from.id);

  if (!session.currentProduct || !session.customization) {
    await ctx.reply('Please select a product first.');
    return;
  }

  const validLevels = ['none', 'low', 'medium', 'high'];
  if (!validLevels.includes(level)) {
    await ctx.reply('Invalid level. Please choose from the options.');
    return;
  }

  try {
    // Update the appropriate level based on current state
    if (state.state === 'selecting_sugar') {
      session.customization.sugarLevel = level;
      await ctx.reply(`Sugar level set to: ${level}`);
    } else if (state.state === 'selecting_ice') {
      session.customization.iceLevel = level;
      await ctx.reply(`Ice level set to: ${level}`);
    }

    // Return to customization menu
    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);

  } catch (error) {
    logError('LEVEL_SELECTION', error, {
      userId: ctx.from.id,
      level: level,
      state: state.state
    });
    await ctx.reply('Error updating selection. Please try again.');
  }
}

export async function handleAddOns(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const product = session.currentProduct;

  if (!product) {
    await ctx.reply('Please select a product first.');
    return;
  }

  if (!product.addOns || product.addOns.length === 0) {
    await ctx.reply('No add-ons available for this item.');
    await showCustomizationOptions(ctx, product);
    return;
  }

  let message = 'Available add-ons:\n\n';
  const buttons = [];

  product.addOns.forEach(addOn => {
    const isSelected = session.customization.addOns.some(selected => selected.name === addOn.name);
    const prefix = isSelected ? '✅' : '➕';
    message += `${prefix} ${addOn.name} - ${formatPrice(addOn.price)}\n`;
    buttons.push([`${prefix} ${addOn.name}`]);
  });

  buttons.push(['⬅️ Back to Customization']);

  sessionService.setState(ctx.from.id, 'selecting_addons');
  await ctx.reply(message, Markup.keyboard(buttons).resize());
}

export async function handleAddOnToggle(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const addOnName = ctx.message.text.replace(/^[✅➕]\s/, '');
  const product = session.currentProduct;

  if (!product || !product.addOns) {
    await ctx.reply('Error processing add-on selection.');
    return;
  }

  const addOn = product.addOns.find(a => a.name === addOnName);
  if (!addOn) {
    await ctx.reply('Invalid add-on selection.');
    return;
  }

  try {
    const isSelected = session.customization.addOns.some(selected => selected.name === addOn.name);

    if (isSelected) {
      // Remove add-on
      session.customization.addOns = session.customization.addOns.filter(
        selected => selected.name !== addOn.name
      );
      await ctx.reply(`Removed: ${addOn.name}`);
    } else {
      // Add add-on
      session.customization.addOns.push(addOn);
      await ctx.reply(`Added: ${addOn.name} (+${formatPrice(addOn.price)})`);
    }

    // Set state to show updated add-ons menu immediately
    sessionService.setState(ctx.from.id, 'selecting_addons');

    // Show updated add-ons menu immediately (no setTimeout!)
    await handleAddOns(ctx);

  } catch (error) {
    logError('ADDON_TOGGLE', error, {
      userId: ctx.from.id,
      addOnName: addOnName
    });
    await ctx.reply('Error updating add-on. Please try again.');
  }
}

export async function handleQuantity(ctx) {
  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['⬅️ Back to Customization']
  ];

  sessionService.setState(ctx.from.id, 'selecting_quantity');
  await ctx.reply('How many would you like?', Markup.keyboard(buttons).resize());
}

export async function handleQuantitySelection(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);
  const quantity = parseInt(ctx.message.text);

  if (!session.currentProduct || !session.customization) {
    await ctx.reply('Please select a product first.');
    return;
  }

  if (isNaN(quantity) || quantity < 1 || quantity > 6) {
    await ctx.reply('Please select a valid quantity (1-6).');
    return;
  }

  try {
    session.customization.quantity = quantity;
    await ctx.reply(`Quantity set to: ${quantity}`);

    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);

  } catch (error) {
    logError('QUANTITY_SELECTION', error, {
      userId: ctx.from.id,
      quantity: quantity
    });
    await ctx.reply('Error updating quantity. Please try again.');
  }
}

export async function handleBackToCustomization(ctx) {
  const session = sessionService.getUserSession(ctx.from.id);

  if (session.currentProduct) {
    sessionService.setState(ctx.from.id, 'customizing');
    await showCustomizationOptions(ctx, session.currentProduct);
  } else {
    await ctx.reply('No product being customized.');
  }
}
