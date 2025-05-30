# 🧪 CoffeeHybrid Testing Guide

This guide helps you test all components of the CoffeeHybrid system locally and in production.

## 🚀 Quick Local Setup

### 1. Start All Services

**Terminal 1 - Backend:**
```bash
cd Backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Telegram Bot:**
```bash
cd Bot
node bot.js
```

### 2. Initialize Menu Data

Open the test file in your browser:
```
file:///d:/CoffeeHybrid/test-api.html
```

Click "Initialize Menu Data" to populate the database.

## 🌐 Web Application Testing

### 1. Access the Application
- **URL**: http://localhost:5173
- **API**: http://localhost:5000/api

### 2. Test User Registration
1. Click "Register" 
2. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Should auto-login after registration

### 3. Test Menu Browsing
1. Click "Menu" in navigation
2. Test category filters (All, Hot Coffee, Iced Coffee, Frappes)
3. Click on a product to open customization modal

### 4. Test Order Flow
1. Customize a coffee (size, sugar, ice, add-ons)
2. Add to cart
3. View cart
4. Place order
5. Verify QR code is generated
6. Check order history

### 5. Test Staff Verification
1. Go to http://localhost:5173/verify
2. Enter the QR token from your order
3. Click "Verify Order"
4. Should mark order as completed

## 🤖 Telegram Bot Testing

### 1. Find Your Bot
- Search for your bot on Telegram using the bot username
- Or use this link: `https://t.me/YourBotUsername`

### 2. Test Bot Commands
1. Send `/start` to begin
2. Click "🍵 Browse Menu"
3. Select a category (e.g., "☕ Hot Coffee")
4. Choose a product (e.g., "1. Americano")
5. Customize the order:
   - Size selection
   - Sugar level
   - Ice level (for iced drinks)
   - Add-ons
   - Quantity
6. Click "✅ Add to Cart"
7. Click "🚀 Place Order"
8. Verify QR code image is sent

### 3. Test Order History
1. Click "📋 My Orders"
2. Should show recent orders with status

## 🔧 API Testing

### 1. Health Check
```bash
GET http://localhost:5000/api/health
```

### 2. Menu Endpoints
```bash
# Get all menu items
GET http://localhost:5000/api/menu

# Get hot coffee items
GET http://localhost:5000/api/menu/category/hot

# Initialize menu (POST)
POST http://localhost:5000/api/menu/initialize
```

### 3. Authentication
```bash
# Register user
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "password123"
}

# Login user
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "test@example.com",
  "password": "password123"
}
```

### 4. Orders
```bash
# Create order
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "userId": "USER_ID_HERE",
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "size": "medium",
      "sugarLevel": "medium",
      "iceLevel": "medium",
      "addOns": [],
      "quantity": 1
    }
  ],
  "orderSource": "web",
  "customerInfo": {
    "name": "Test User",
    "email": "test@example.com"
  }
}

# Verify QR
POST http://localhost:5000/api/orders/verify-qr
Content-Type: application/json

{
  "qrToken": "QR_TOKEN_HERE"
}
```

## 📱 Database Testing

### 1. Check MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click "Browse Collections"
4. Verify these collections exist:
   - `users`
   - `products` 
   - `orders`

### 2. Sample Data Verification
After initializing menu, you should see:
- **Products**: 7 coffee items across 3 categories
- **Users**: Any registered users
- **Orders**: Any placed orders

## 🐛 Common Issues & Solutions

### Backend Issues

**"Cannot connect to MongoDB"**
- Check internet connection
- Verify MongoDB URI in `.env`
- Check MongoDB Atlas IP whitelist

**"Port 5000 already in use"**
- Kill existing process: `taskkill /f /im node.exe`
- Or change port in `.env`

**"CORS errors"**
- Ensure CORS is enabled in backend
- Check frontend API URL in `.env`

### Frontend Issues

**"Network Error"**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Verify no firewall blocking

**"QR code not displaying"**
- Check order was created successfully
- Verify QR token exists in database
- Check browser console for errors

### Bot Issues

**"Bot not responding"**
- Verify bot token is correct
- Check bot is running locally
- Ensure API is accessible

**"Menu not loading"**
- Check backend API connection
- Verify menu data is initialized
- Check bot logs for errors

## ✅ Test Checklist

### Web Application
- [ ] User registration works
- [ ] User login works
- [ ] Menu displays correctly
- [ ] Product customization works
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] QR code generation works
- [ ] Order history displays
- [ ] QR verification works

### Telegram Bot
- [ ] Bot responds to /start
- [ ] Menu browsing works
- [ ] Product selection works
- [ ] Customization flow works
- [ ] Order placement works
- [ ] QR code delivery works
- [ ] Order history works

### API
- [ ] Health endpoint responds
- [ ] Menu endpoints work
- [ ] Authentication works
- [ ] Order creation works
- [ ] QR verification works

### Database
- [ ] MongoDB connection works
- [ ] Collections are created
- [ ] Data is persisted
- [ ] Queries work correctly

## 📊 Performance Testing

### Load Testing
Use tools like:
- **Postman** for API testing
- **Artillery** for load testing
- **Browser DevTools** for frontend performance

### Database Performance
- Monitor query execution times
- Check index usage
- Verify connection pooling

## 🔒 Security Testing

### Basic Security Checks
- [ ] No sensitive data in logs
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Bot token secured
- [ ] QR tokens are unique and secure

---

🎉 **Happy Testing!** If you encounter any issues, check the troubleshooting section or create an issue in the repository.
