import bot from './src/bot.js';
import config from './src/config/config.js';
import sessionService from './src/services/sessionService.js';
import apiService from './src/services/apiService.js';

// Startup checks
async function startupChecks() {
  console.log('🚀 Starting CoffeeHybrid Telegram Bot...');

  try {
    // Check API connectivity
    console.log('🔍 Checking API connectivity...');
    await apiService.healthCheck();
    console.log('✅ API connection successful');

    // Get bot info
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Bot connected: @${botInfo.username} (${botInfo.first_name})`);

    // Log session service status
    const stats = sessionService.getSessionStats();
    console.log(`📊 Session service initialized (${stats.totalSessions} sessions)`);

    return true;
  } catch (error) {
    console.error('❌ Startup check failed:', error.message);
    return false;
  }
}

// Start the bot
async function startBot() {
  const checksPass = await startupChecks();

  if (!checksPass) {
    console.error('❌ Startup checks failed. Exiting...');
    process.exit(1);
  }

  try {
    if (config.NODE_ENV === 'production' && config.WEBHOOK_URL) {
      // Use webhook for production
      console.log('🌐 Starting bot with webhook...');

      const PORT = config.PORT;
      const webhookUrl = config.WEBHOOK_URL;

      // Remove any existing webhook first
      await bot.telegram.deleteWebhook();
      console.log('🗑️ Cleared existing webhook');

      // Set new webhook
      const webhookPath = '/webhook';
      const fullWebhookUrl = `${webhookUrl}${webhookPath}`;

      await bot.telegram.setWebhook(fullWebhookUrl);
      console.log(`✅ Webhook set: ${fullWebhookUrl}`);

      // Start webhook server
      bot.launch({
        webhook: {
          domain: webhookUrl,
          port: PORT,
          path: webhookPath,
          hookPath: webhookPath
        }
      });

      console.log(`🚀 Bot running on port ${PORT} with webhook`);
      console.log(`📡 Listening for webhooks at: ${fullWebhookUrl}`);

    } else {
      // Use polling for development or when webhook not configured
      console.log('🔄 Starting bot with polling...');

      // Remove webhook if exists
      try {
        await bot.telegram.deleteWebhook();
        console.log('🗑️ Cleared existing webhook');
      } catch (error) {
        console.log('ℹ️ No webhook to clear');
      }

      // Start polling
      bot.launch();
      console.log('🚀 Bot running with polling');
    }

    // Log startup success
    console.log('✅ CoffeeHybrid Telegram Bot is running successfully!');
    console.log(`📋 Environment: ${config.NODE_ENV}`);
    console.log(`🔗 API URL: ${config.API_BASE_URL}`);

    // Log session cleanup schedule
    console.log('🧹 Session cleanup scheduled every 10 minutes');

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Graceful shutdown
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);

    // Stop the bot
    bot.stop(signal);

    // Log session statistics before shutdown
    const stats = sessionService.getSessionStats();
    console.log(`📊 Final session stats: ${stats.totalSessions} total, ${stats.activeSessions} active`);

    console.log('✅ Bot stopped successfully');
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Setup and start
setupGracefulShutdown();
startBot();

export default bot;
