import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    // Create new user (Note: No password encryption as per requirements)
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (Note: No encryption as per requirements)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Account is temporarily blocked due to no-shows' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        loyaltyPoints: user.loyaltyPoints,
        strikes: user.strikes
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Telegram user
router.post('/register-telegram', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, phoneNumber } = req.body;

    // Check if telegram user already exists
    const existingUser = await User.findOne({ telegramId });

    if (existingUser) {
      return res.json({
        message: 'User already registered',
        user: {
          id: existingUser._id,
          username: existingUser.username,
          telegramId: existingUser.telegramId
        }
      });
    }

    // Create new telegram user
    const user = new User({
      username: username || `telegram_${telegramId}`,
      email: `telegram_${telegramId}@temp.com`, // Temporary email
      password: `temp_${telegramId}`, // Temporary password
      telegramId,
      phoneNumber
    });

    await user.save();

    res.status(201).json({
      message: 'Telegram user registered successfully',
      user: {
        id: user._id,
        username: user.username,
        telegramId: user.telegramId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
