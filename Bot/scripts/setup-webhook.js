#!/usr/bin/env node

import axios from 'axios';
import config from '../src/config/config.js';

const BOT_TOKEN = config.BOT_TOKEN;
const WEBHOOK_URL = config.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ WEBHOOK_URL is required');
  process.exit(1);
}

async function setupWebhook() {
  try {
    console.log('🔧 Setting up Telegram webhook...');
    console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
    console.log(`🌐 Webhook URL: ${WEBHOOK_URL}`);

    // Delete existing webhook
    console.log('\n🗑️ Removing existing webhook...');
    const deleteResponse = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );
    
    if (deleteResponse.data.ok) {
      console.log('✅ Existing webhook removed');
    } else {
      console.log('ℹ️ No existing webhook to remove');
    }

    // Set new webhook
    console.log('\n📡 Setting new webhook...');
    const webhookEndpoint = `${WEBHOOK_URL}/webhook`;
    
    const setResponse = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: webhookEndpoint,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      }
    );

    if (setResponse.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`📍 Webhook URL: ${webhookEndpoint}`);
    } else {
      console.error('❌ Failed to set webhook:', setResponse.data);
      process.exit(1);
    }

    // Get webhook info
    console.log('\n📋 Webhook information:');
    const infoResponse = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );

    if (infoResponse.data.ok) {
      const info = infoResponse.data.result;
      console.log(`   URL: ${info.url}`);
      console.log(`   Has custom certificate: ${info.has_custom_certificate}`);
      console.log(`   Pending update count: ${info.pending_update_count}`);
      console.log(`   Last error date: ${info.last_error_date || 'None'}`);
      console.log(`   Last error message: ${info.last_error_message || 'None'}`);
      console.log(`   Max connections: ${info.max_connections || 'Default'}`);
      console.log(`   Allowed updates: ${info.allowed_updates?.join(', ') || 'All'}`);
    }

    // Test webhook
    console.log('\n🧪 Testing webhook...');
    try {
      const testResponse = await axios.get(webhookEndpoint, { timeout: 5000 });
      console.log('✅ Webhook endpoint is accessible');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Webhook endpoint not accessible (bot not running?)');
      } else if (error.response?.status === 404) {
        console.log('⚠️ Webhook endpoint returns 404 (normal if bot not running)');
      } else {
        console.log(`⚠️ Webhook test failed: ${error.message}`);
      }
    }

    console.log('\n🎉 Webhook setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy your bot to the webhook URL');
    console.log('2. Start the bot with NODE_ENV=production');
    console.log('3. Test by sending a message to your bot');

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }
    
    process.exit(1);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Deleting webhook...');
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );
    
    if (response.data.ok) {
      console.log('✅ Webhook deleted successfully');
    } else {
      console.error('❌ Failed to delete webhook:', response.data);
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
  }
}

async function getWebhookInfo() {
  try {
    console.log('📋 Getting webhook information...');
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    
    if (response.data.ok) {
      const info = response.data.result;
      console.log('\n📡 Current webhook info:');
      console.log(`   URL: ${info.url || 'Not set'}`);
      console.log(`   Has custom certificate: ${info.has_custom_certificate}`);
      console.log(`   Pending update count: ${info.pending_update_count}`);
      console.log(`   Last error date: ${info.last_error_date || 'None'}`);
      console.log(`   Last error message: ${info.last_error_message || 'None'}`);
      console.log(`   Max connections: ${info.max_connections || 'Default'}`);
      console.log(`   Allowed updates: ${info.allowed_updates?.join(', ') || 'All'}`);
    } else {
      console.error('❌ Failed to get webhook info:', response.data);
    }
  } catch (error) {
    console.error('❌ Error getting webhook info:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'set':
  case 'setup':
    setupWebhook();
    break;
  case 'delete':
  case 'remove':
    deleteWebhook();
    break;
  case 'info':
  case 'status':
    getWebhookInfo();
    break;
  default:
    console.log('🔧 Telegram Webhook Setup Tool');
    console.log('\nUsage:');
    console.log('  node scripts/setup-webhook.js set     # Set up webhook');
    console.log('  node scripts/setup-webhook.js delete  # Delete webhook');
    console.log('  node scripts/setup-webhook.js info    # Get webhook info');
    console.log('\nEnvironment variables required:');
    console.log('  BOT_TOKEN    - Your Telegram bot token');
    console.log('  WEBHOOK_URL  - Your webhook URL (without /webhook path)');
    break;
}
