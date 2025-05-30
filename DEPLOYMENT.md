# 🚀 CoffeeHybrid Deployment Guide

This guide covers deploying the CoffeeHybrid system to Render.com with MongoDB Atlas.

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render.com Account**: Sign up at render.com
3. **MongoDB Atlas Account**: Sign up at mongodb.com
4. **Telegram Bot Token**: Get from @BotFather (optional)

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new project: "CoffeeHybrid"
3. Build a cluster (choose free tier)
4. Select cloud provider and region
5. Create cluster (takes 1-3 minutes)

### 2. Configure Database Access
1. **Database Access** → **Add New Database User**
   - Username: `coffee-admin`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

2. **Network Access** → **Add IP Address**
   - Add `0.0.0.0/0` (allow access from anywhere)
   - Or add specific Render.com IP ranges

### 3. Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `coffee-ordering`

Example: `mongodb+srv://coffee-admin:yourpassword@cluster0.xxxxx.mongodb.net/coffee-ordering?retryWrites=true&w=majority`

## 🌐 Backend Deployment (Render.com)

### 1. Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `coffeehybrid-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && npm start`
   - **Instance Type**: Free

### 2. Environment Variables
Add these environment variables:
```env
PORT=10000
MONGODB_URI=mongodb+srv://ChoengRayu:C9r6nhxOVLCUkkGd@cluster0.2ott03t.mongodb.net/coffee-ordering?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
```

### 3. Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note the service URL: `https://coffeehybrid-backend.onrender.com`

### 4. Initialize Menu
After deployment, initialize the menu:
```bash
curl -X POST https://coffeehybrid-backend.onrender.com/api/menu/initialize
```

## 🖥️ Frontend Deployment (Render.com)

### 1. Create Static Site
1. **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `coffeehybrid-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 2. Environment Variables
```env
VITE_API_URL=https://coffeehybrid-backend.onrender.com/api
```

### 3. Deploy
1. Click **Create Static Site**
2. Wait for deployment
3. Note the URL: `https://coffeehybrid-frontend.onrender.com`

## 🤖 Telegram Bot Deployment (Render.com)

### 1. Get Bot Token
1. Message @BotFather on Telegram
2. Use `/newbot` command
3. Follow instructions
4. Save the bot token

### 2. Create Web Service
1. **New** → **Web Service**
2. Connect repository
3. Configure:
   - **Name**: `coffeehybrid-bot`
   - **Environment**: `Node`
   - **Build Command**: `cd Bot && npm install`
   - **Start Command**: `cd Bot && npm start`

### 3. Environment Variables
```env
BOT_TOKEN=8144687170:AAHU7AO6HlZzOjupizuS5Ry4GBJtj_8lDjg
API_BASE_URL=https://coffeehybrid-backend.onrender.com/api
WEBHOOK_URL=https://alarmbot-d1r4.onrender.com/webhook
PORT=10000
NODE_ENV=production
```

### 4. Set Webhook
After deployment, set the webhook:
```bash
curl -X POST "https://api.telegram.org/bot8144687170:AAHU7AO6HlZzOjupizuS5Ry4GBJtj_8lDjg/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://alarmbot-d1r4.onrender.com/webhook"}'
```

## 🔧 Post-Deployment Configuration

### 1. Update Frontend API URL
Ensure your frontend `.env` points to the deployed backend:
```env
VITE_API_URL=https://coffeehybrid-backend.onrender.com/api
```

### 2. Test All Services
1. **Backend**: Visit `https://coffeehybrid-backend.onrender.com/api/health`
2. **Frontend**: Visit `https://coffeehybrid-frontend.onrender.com`
3. **Bot**: Send `/start` to your Telegram bot

### 3. Initialize Menu Data
```bash
curl -X POST https://coffeehybrid-backend.onrender.com/api/menu/initialize
```

## 📱 Custom Domain (Optional)

### 1. Frontend Domain
1. Go to your static site settings
2. **Custom Domains** → **Add Custom Domain**
3. Enter your domain (e.g., `coffeehybrid.com`)
4. Update DNS records as instructed

### 2. Backend Domain
1. Go to your web service settings
2. **Custom Domains** → **Add Custom Domain**
3. Enter subdomain (e.g., `api.coffeehybrid.com`)
4. Update DNS records

## 🔍 Monitoring & Logs

### 1. View Logs
- Go to your service dashboard
- Click **Logs** tab
- Monitor for errors and performance

### 2. Health Checks
Set up monitoring for:
- `https://coffeehybrid-backend.onrender.com/api/health`
- `https://coffeehybrid-frontend.onrender.com`

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify environment variables
- Check build logs

**Frontend can't connect to API:**
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running

**Bot not responding:**
- Verify bot token
- Check webhook URL
- Ensure backend API is accessible

**Database connection failed:**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check database user permissions

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- 750 hours/month limit
- Cold start delays (10-30 seconds)

## 🔄 Continuous Deployment

### Auto-Deploy Setup
1. Connect GitHub repository
2. Enable **Auto-Deploy**
3. Choose branch (usually `main`)
4. Pushes to branch trigger automatic deployment

### Environment-Specific Branches
- `main` → Production
- `staging` → Staging environment
- `development` → Development environment

## 📊 Performance Optimization

### 1. Database Indexing
Add indexes for frequently queried fields:
```javascript
// In MongoDB Atlas or via code
db.orders.createIndex({ "userId": 1, "status": 1 })
db.orders.createIndex({ "qrToken": 1 })
db.users.createIndex({ "email": 1 })
```

### 2. Caching
Consider adding Redis for session storage and caching.

### 3. CDN
Use Render's CDN for static assets.

## 🔐 Security Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong database passwords
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Bot token secured
- [ ] No sensitive data in logs

## 📈 Scaling

### Paid Plans
- **Starter**: $7/month per service
- **Standard**: $25/month per service
- **Pro**: $85/month per service

### Features
- No sleep mode
- More CPU/RAM
- Custom domains
- Priority support

---

🎉 **Congratulations!** Your CoffeeHybrid system is now deployed and ready for coffee lovers worldwide!
