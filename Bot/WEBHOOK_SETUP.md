# 🌐 Webhook Setup Guide

Complete guide for setting up webhooks instead of polling for the CoffeeHybrid Telegram Bot.

## ✅ **Issues Fixed**

### **🐛 Problems Resolved:**
1. **Add-on Session Issue**: Removed problematic `setTimeout` in `handleAddOnToggle` ✅ **FIXED**
2. **Webhook vs Polling**: Added proper webhook support for production ✅ **FIXED**

## 🔧 **Webhook vs Polling**

### **Polling (Development)**
- ✅ Easy to set up
- ✅ Works behind firewalls
- ❌ Higher latency
- ❌ More resource intensive
- ❌ Not suitable for production

### **Webhook (Production)**
- ✅ Lower latency
- ✅ More efficient
- ✅ Better for production
- ❌ Requires public URL
- ❌ Needs HTTPS

## 🚀 **Quick Setup**

### **1. Development (Polling)**
```bash
cd Bot
npm run dev        # Uses polling automatically
```

### **2. Production (Webhook)**
```bash
# Set environment variables
export NODE_ENV=production
export WEBHOOK_URL=https://your-app.onrender.com
export BOT_TOKEN=your_bot_token

# Set up webhook
npm run webhook:set

# Deploy bot
npm run deploy
```

## 📋 **Environment Configuration**

### **Development (.env)**
```env
NODE_ENV=development
BOT_TOKEN=your_bot_token
API_BASE_URL=http://localhost:5000/api
# No WEBHOOK_URL needed for development
```

### **Production (.env)**
```env
NODE_ENV=production
BOT_TOKEN=your_bot_token
API_BASE_URL=https://your-api.onrender.com/api
WEBHOOK_URL=https://your-bot.onrender.com
PORT=3000
```

## 🛠 **Webhook Management Commands**

### **Set Up Webhook**
```bash
npm run webhook:set
```
- Deletes existing webhook
- Sets new webhook URL
- Configures allowed updates
- Tests webhook endpoint

### **Check Webhook Status**
```bash
npm run webhook:info
```
- Shows current webhook URL
- Displays pending updates
- Shows last error (if any)
- Lists allowed update types

### **Delete Webhook**
```bash
npm run webhook:delete
```
- Removes webhook configuration
- Switches back to polling mode

## 🔄 **Bot Startup Logic**

The bot automatically chooses the right mode:

```javascript
if (config.NODE_ENV === 'production' && config.WEBHOOK_URL) {
  // Use webhook for production
  console.log('🌐 Starting bot with webhook...');
  
  // Clear existing webhook
  await bot.telegram.deleteWebhook();
  
  // Set new webhook
  await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook`);
  
  // Start webhook server
  bot.launch({
    webhook: {
      domain: WEBHOOK_URL,
      port: PORT,
      path: '/webhook'
    }
  });
} else {
  // Use polling for development
  console.log('🔄 Starting bot with polling...');
  
  // Clear webhook if exists
  await bot.telegram.deleteWebhook();
  
  // Start polling
  bot.launch();
}
```

## 🌐 **Deployment Examples**

### **Render.com Deployment**

1. **Create Render Service**
   - Connect your GitHub repo
   - Choose "Web Service"
   - Set build command: `npm install`
   - Set start command: `npm run deploy`

2. **Environment Variables**
   ```
   NODE_ENV=production
   BOT_TOKEN=your_telegram_bot_token
   WEBHOOK_URL=https://your-app-name.onrender.com
   API_BASE_URL=https://your-api.onrender.com/api
   PORT=3000
   ```

3. **Set Webhook**
   ```bash
   # After deployment
   npm run webhook:set
   ```

### **Heroku Deployment**

1. **Create Heroku App**
   ```bash
   heroku create your-bot-name
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set BOT_TOKEN=your_token
   heroku config:set WEBHOOK_URL=https://your-bot-name.herokuapp.com
   heroku config:set API_BASE_URL=https://your-api.herokuapp.com/api
   ```

3. **Deploy**
   ```bash
   git push heroku main
   npm run webhook:set
   ```

## 🧪 **Testing Webhook Setup**

### **1. Check Webhook Status**
```bash
npm run webhook:info
```

Expected output:
```
📡 Current webhook info:
   URL: https://your-app.onrender.com/webhook
   Has custom certificate: false
   Pending update count: 0
   Last error date: None
   Last error message: None
```

### **2. Test Bot Response**
1. Send `/start` to your bot
2. Check server logs for webhook activity
3. Verify bot responds correctly

### **3. Monitor Logs**
```bash
# Development
npm run dev

# Production
npm run deploy
```

Look for:
```
🌐 Starting bot with webhook...
✅ Webhook set: https://your-app.onrender.com/webhook
🚀 Bot running on port 3000 with webhook
📡 Listening for webhooks at: https://your-app.onrender.com/webhook
```

## 🚨 **Troubleshooting**

### **Webhook Not Working**

1. **Check URL Accessibility**
   ```bash
   curl https://your-app.onrender.com/webhook
   ```

2. **Verify Environment Variables**
   ```bash
   echo $WEBHOOK_URL
   echo $NODE_ENV
   ```

3. **Check Webhook Status**
   ```bash
   npm run webhook:info
   ```

4. **Reset Webhook**
   ```bash
   npm run webhook:delete
   npm run webhook:set
   ```

### **Common Issues**

**Issue**: Bot not responding
**Solution**: Check webhook URL is accessible and HTTPS

**Issue**: "Webhook not set" error
**Solution**: Run `npm run webhook:set` after deployment

**Issue**: Bot works locally but not in production
**Solution**: Verify `NODE_ENV=production` and `WEBHOOK_URL` are set

**Issue**: High latency
**Solution**: Ensure webhook is properly configured (not falling back to polling)

## 📊 **Performance Comparison**

### **Polling Mode**
- Response time: 1-3 seconds
- Resource usage: High (constant API calls)
- Reliability: Good
- Setup: Easy

### **Webhook Mode**
- Response time: 100-500ms
- Resource usage: Low (event-driven)
- Reliability: Excellent
- Setup: Requires configuration

## 🔒 **Security Considerations**

### **Webhook Security**
- Always use HTTPS for webhooks
- Validate incoming requests
- Use secret tokens if needed
- Monitor for suspicious activity

### **Environment Variables**
- Never commit tokens to git
- Use secure environment variable storage
- Rotate tokens regularly
- Limit token permissions

## ✅ **Setup Complete!**

Your bot now supports both modes:

### **Development** 🔄
- Automatic polling mode
- Easy local testing
- No webhook configuration needed

### **Production** 🌐
- Efficient webhook mode
- Low latency responses
- Production-ready deployment

**Commands Summary:**
```bash
# Development
npm run dev

# Production setup
npm run webhook:set
npm run deploy

# Webhook management
npm run webhook:info
npm run webhook:delete
```

**Your bot is now ready for production deployment with webhook support!** 🚀
