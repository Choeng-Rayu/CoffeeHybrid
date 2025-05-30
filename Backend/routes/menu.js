import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = { available: true };
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get menu items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ 
      category: category.toLowerCase(),
      available: true 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      category,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize menu with sample data (for development)
router.post('/initialize', async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.json({ message: 'Menu already initialized' });
    }

    const sampleProducts = [
      // Hot Coffee
      {
        name: 'Americano',
        description: 'Rich espresso with hot water',
        category: 'hot',
        basePrice: 3.50,
        image: '/images/americano.jpg',
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.50 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Vanilla Syrup', price: 0.50 },
          { name: 'Caramel Syrup', price: 0.50 }
        ]
      },
      {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam',
        category: 'hot',
        basePrice: 4.25,
        image: '/images/cappuccino.jpg',
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.50 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Cinnamon', price: 0.25 },
          { name: 'Chocolate Powder', price: 0.25 }
        ]
      },
      {
        name: 'Latte',
        description: 'Espresso with steamed milk',
        category: 'hot',
        basePrice: 4.75,
        image: '/images/latte.jpg',
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.50 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Vanilla Syrup', price: 0.50 },
          { name: 'Hazelnut Syrup', price: 0.50 }
        ]
      },
      // Iced Coffee
      {
        name: 'Iced Americano',
        description: 'Espresso with cold water over ice',
        category: 'iced',
        basePrice: 3.75,
        image: '/images/iced-americano.jpg',
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.50 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Simple Syrup', price: 0.50 },
          { name: 'Vanilla Syrup', price: 0.50 }
        ]
      },
      {
        name: 'Iced Latte',
        description: 'Espresso with cold milk over ice',
        category: 'iced',
        basePrice: 5.00,
        image: '/images/iced-latte.jpg',
        sizes: [
          { name: 'small', priceModifier: -0.50 },
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.50 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Caramel Syrup', price: 0.50 },
          { name: 'Vanilla Syrup', price: 0.50 }
        ]
      },
      // Frappes
      {
        name: 'Caramel Frappe',
        description: 'Blended coffee with caramel and whipped cream',
        category: 'frappe',
        basePrice: 5.75,
        image: '/images/caramel-frappe.jpg',
        sizes: [
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.75 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Extra Whipped Cream', price: 0.50 },
          { name: 'Chocolate Drizzle', price: 0.50 }
        ]
      },
      {
        name: 'Mocha Frappe',
        description: 'Blended coffee with chocolate and whipped cream',
        category: 'frappe',
        basePrice: 5.75,
        image: '/images/mocha-frappe.jpg',
        sizes: [
          { name: 'medium', priceModifier: 0 },
          { name: 'large', priceModifier: 0.75 }
        ],
        addOns: [
          { name: 'Extra Shot', price: 0.75 },
          { name: 'Extra Whipped Cream', price: 0.50 },
          { name: 'Caramel Drizzle', price: 0.50 }
        ]
      }
    ];

    await Product.insertMany(sampleProducts);
    
    res.json({
      success: true,
      message: 'Menu initialized with sample products',
      count: sampleProducts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
