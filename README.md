# ☕ CoffeeHybrid - Dual Platform Coffee Ordering System

A comprehensive coffee ordering system with both web application and Telegram bot interfaces, featuring QR code-based pickup verification to reduce waste from unclaimed orders.

## 🌟 Features

### Web Application
- **User Authentication**: Register/Login system (no encryption as per requirements)
- **Menu Browsing**: Hot, Iced, and Frappe categories
- **Full Customization**: Size, sugar level, ice level, and premium add-ons
- **Shopping Cart**: Add, modify, and remove items
- **Order Management**: Place orders and view history
- **QR Code Generation**: Unique QR codes for each order
- **Responsive Design**: Works on desktop and mobile

### Telegram Bot
- **Menu Browsing**: Interactive menu with inline keyboards
- **Order Customization**: Full customization flow
- **QR Code Delivery**: Automatic QR code generation and sending
- **Order History**: View past orders and status
- **No Registration Required**: Uses Telegram user data

### Staff Features
- **QR Verification**: Simple interface for staff to verify pickups
- **Order Completion**: Mark orders as completed
- **Real-time Status**: Automatic order status updates

### No-Show Prevention
- **Strike System**: Track user no-shows
- **Auto-Expiry**: Orders expire after 30 minutes
- **Account Blocking**: Temporary blocks for repeat offenders
- **Loyalty Rewards**: Points system to encourage good behavior

## 🛠 Technology Stack

### Frontend
- **React 19** with JSX
- **CSS Modules** for styling
- **React Router** for navigation
- **Axios** for API calls
- **react-qr-code** for QR generation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **UUID** for unique tokens
- **qr-image** for server-side QR generation

### Telegram Bot
- **Telegraf.js** framework
- **Webhook** support for production
- **Session management** for user state

### Hosting
- **Render.com** for all services
- **MongoDB Atlas** for database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Telegram Bot Token (for bot features)

### 1. Clone and Install
```bash
git clone <repository-url>
cd CoffeeHybrid
npm install
cd Backend && npm install
cd ../Bot && npm install
```

### 2. Environment Setup

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coffee-ordering
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Bot (.env)**
```env
BOT_TOKEN=your_telegram_bot_token
API_BASE_URL=http://localhost:5000/api
WEBHOOK_URL=https://your-app.onrender.com/webhook
PORT=3000
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Bot (Optional):**
```bash
cd Bot
npm run dev
```

### 4. Initialize Menu Data
Visit: `http://localhost:5000/api/menu/initialize` (POST request)

### 5. Access Application
- **Web App**: http://localhost:5173
- **API**: http://localhost:5000/api
- **QR Verification**: http://localhost:5173/verify

## 📱 Telegram Bot Setup

### 1. Create Bot
1. Message @BotFather on Telegram
2. Use `/newbot` command
3. Follow instructions to get bot token
4. Add token to `Bot/.env`

### 2. Set Commands (Optional)
```
start - Start the coffee ordering bot
menu - Browse coffee menu
cart - View your cart
orders - View order history
help - Get help and instructions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/register-telegram` - Register Telegram user

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/category/:category` - Get items by category
- `POST /api/menu/initialize` - Initialize sample menu

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id/qr` - Get QR code image
- `POST /api/verify-qr` - Verify QR token
- `GET /api/orders/user/:userId` - Get user orders

## 🎯 Usage Examples

### Web Application Flow
1. **Register/Login** → Create account or sign in
2. **Browse Menu** → Select coffee category
3. **Customize** → Choose size, sugar, ice, add-ons
4. **Add to Cart** → Review selections
5. **Place Order** → Get QR code
6. **Pickup** → Show QR code to staff

### Telegram Bot Flow
1. **Start Bot** → `/start` command
2. **Browse Menu** → Use keyboard buttons
3. **Select Item** → Choose from numbered list
4. **Customize** → Follow prompts for options
5. **Place Order** → Receive QR code image
6. **Pickup** → Show QR code

### Staff Verification
1. **Access Portal** → Visit `/verify` page
2. **Scan/Enter QR** → Input QR token
3. **Verify Order** → Confirm pickup
4. **Complete** → Order marked as completed

## 🔒 Security Notes

- **No Password Encryption**: As per requirements, passwords are stored in plain text
- **No JWT Tokens**: Simple session-based authentication
- **QR Token Security**: UUID-based tokens with expiration
- **Input Validation**: Basic validation on all inputs

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify port 5000 is available
- Check environment variables

**Frontend API errors:**
- Ensure backend is running
- Check VITE_API_URL in .env
- Verify CORS settings

**Bot not responding:**
- Check bot token validity
- Verify webhook URL (production)
- Check API connectivity

**QR codes not working:**
- Ensure orders are not expired
- Check QR token format
- Verify verification endpoint

---

**Built with ❤️ for coffee lovers everywhere** ☕
