// Script to populate the database with comprehensive fake data
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Fake customer data
const fakeCustomers = [
  {
    username: 'john_coffee',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    username: 'sarah_latte',
    email: 'sarah@example.com', 
    password: 'password123'
  },
  {
    username: 'mike_espresso',
    email: 'mike@example.com',
    password: 'password123'
  },
  {
    username: 'emma_frappe',
    email: 'emma@example.com',
    password: 'password123'
  },
  {
    username: 'david_brew',
    email: 'david@example.com',
    password: 'password123'
  }
];

// Additional products for each seller
const additionalProducts = {
  'Coffee Central': [
    {
      name: 'Flat White',
      description: 'Microfoam milk with double shot espresso - Australian style',
      category: 'hot',
      basePrice: 4.50,
      preparationTime: 4,
      featured: false,
      sizes: [
        { name: 'small', priceModifier: -0.50 },
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 0.50 }
      ],
      addOns: [
        { name: 'Extra Shot', price: 0.75 },
        { name: 'Oat Milk', price: 0.60 },
        { name: 'Almond Milk', price: 0.60 }
      ]
    },
    {
      name: 'Turkish Coffee',
      description: 'Traditional unfiltered coffee - strong and aromatic',
      category: 'hot',
      basePrice: 3.25,
      preparationTime: 6,
      featured: true,
      sizes: [
        { name: 'traditional', priceModifier: 0 }
      ],
      addOns: [
        { name: 'Turkish Delight', price: 1.00 },
        { name: 'Extra Sugar', price: 0.25 }
      ]
    }
  ],
  'Bean Paradise': [
    {
      name: 'Paradise Punch',
      description: 'Tropical iced coffee with coconut and pineapple - paradise vibes',
      category: 'iced',
      basePrice: 5.50,
      preparationTime: 5,
      featured: true,
      sizes: [
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 0.75 }
      ],
      addOns: [
        { name: 'Coconut Flakes', price: 0.50 },
        { name: 'Whipped Cream', price: 0.50 },
        { name: 'Extra Pineapple', price: 0.75 }
      ]
    },
    {
      name: 'Iced Matcha Latte',
      description: 'Premium matcha with cold milk - zen in a cup',
      category: 'iced',
      basePrice: 5.25,
      preparationTime: 4,
      featured: false,
      sizes: [
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 0.75 }
      ],
      addOns: [
        { name: 'Vanilla Syrup', price: 0.50 },
        { name: 'Coconut Milk', price: 0.60 },
        { name: 'Honey', price: 0.50 }
      ]
    }
  ],
  'Brew Masters': [
    {
      name: 'Master\'s Special Frappe',
      description: 'Secret recipe frappe with premium ingredients - our masterpiece',
      category: 'frappe',
      basePrice: 6.50,
      preparationTime: 7,
      featured: true,
      sizes: [
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 1.00 }
      ],
      addOns: [
        { name: 'Gold Leaf', price: 2.00 },
        { name: 'Premium Whipped Cream', price: 0.75 },
        { name: 'Chocolate Pearls', price: 1.00 }
      ]
    },
    {
      name: 'Salted Caramel Frappe',
      description: 'Perfect balance of sweet and salty - crafted to perfection',
      category: 'frappe',
      basePrice: 5.95,
      preparationTime: 6,
      featured: false,
      sizes: [
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 0.75 }
      ],
      addOns: [
        { name: 'Extra Caramel', price: 0.50 },
        { name: 'Sea Salt Topping', price: 0.25 },
        { name: 'Whipped Cream', price: 0.50 }
      ]
    }
  ]
};

async function populateFakeData() {
  try {
    console.log('🚀 Starting fake data population...');

    // 1. Initialize menu (creates sellers and basic products)
    console.log('📋 Initializing menu with sellers...');
    try {
      const menuResponse = await axios.post(`${API_BASE_URL}/menu/initialize`);
      console.log('✅ Menu initialized:', menuResponse.data.message);
    } catch (error) {
      console.log('ℹ️ Menu already initialized');
    }

    // 2. Register fake customers
    console.log('👥 Creating fake customers...');
    const customers = [];
    for (const customerData of fakeCustomers) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, customerData);
        customers.push(response.data.user);
        console.log(`✅ Created customer: ${customerData.username}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`ℹ️ Customer ${customerData.username} already exists`);
          // Try to login to get user data
          try {
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
              emailOrUsername: customerData.email,
              password: customerData.password
            });
            customers.push(loginResponse.data.user);
          } catch (loginError) {
            console.log(`⚠️ Could not login existing customer: ${customerData.username}`);
          }
        } else {
          console.error(`❌ Error creating customer ${customerData.username}:`, error.message);
        }
      }
    }

    // 3. Get seller accounts for adding products
    console.log('🏪 Getting seller accounts...');
    const sellers = [];
    const sellerCredentials = [
      { email: 'shop1@coffeehybrid.com', password: 'seller123', shopName: 'Coffee Central' },
      { email: 'shop2@coffeehybrid.com', password: 'seller123', shopName: 'Bean Paradise' },
      { email: 'shop3@coffeehybrid.com', password: 'seller123', shopName: 'Brew Masters' }
    ];

    for (const cred of sellerCredentials) {
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          emailOrUsername: cred.email,
          password: cred.password
        });
        sellers.push({ ...loginResponse.data.user, shopName: cred.shopName });
        console.log(`✅ Logged in seller: ${cred.shopName}`);
      } catch (error) {
        console.error(`❌ Could not login seller ${cred.shopName}:`, error.message);
      }
    }

    // 4. Add additional products for each seller
    console.log('☕ Adding additional products...');
    for (const seller of sellers) {
      const products = additionalProducts[seller.shopName];
      if (products) {
        for (const productData of products) {
          try {
            const response = await axios.post(`${API_BASE_URL}/admin/products`, {
              ...productData,
              userId: seller.id
            });
            console.log(`✅ Added product: ${productData.name} for ${seller.shopName}`);
          } catch (error) {
            console.error(`❌ Error adding product ${productData.name}:`, error.message);
          }
        }
      }
    }

    // 5. Create some fake orders
    console.log('📦 Creating fake orders...');
    if (customers.length > 0 && sellers.length > 0) {
      // Get all products first
      const menuResponse = await axios.get(`${API_BASE_URL}/menu`);
      const allProducts = menuResponse.data.products;

      for (let i = 0; i < 10; i++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        
        const orderData = {
          userId: randomCustomer.id,
          items: [
            {
              productId: randomProduct._id,
              size: randomProduct.sizes?.[0]?.name || 'medium',
              sugarLevel: ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
              iceLevel: 'medium',
              addOns: [],
              quantity: Math.floor(Math.random() * 3) + 1
            }
          ],
          orderSource: Math.random() > 0.5 ? 'web' : 'telegram',
          customerInfo: {
            name: randomCustomer.username,
            email: randomCustomer.email
          }
        };

        try {
          const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
          console.log(`✅ Created order for ${randomCustomer.username}: ${randomProduct.name}`);
          
          // Randomly complete some orders
          if (Math.random() > 0.7) {
            try {
              await axios.post(`${API_BASE_URL}/orders/verify-qr`, {
                qrToken: response.data.order.qrToken
              });
              console.log(`✅ Completed order for ${randomCustomer.username}`);
            } catch (verifyError) {
              // Ignore verification errors for demo
            }
          }
        } catch (error) {
          console.error(`❌ Error creating order:`, error.message);
        }
      }
    }

    console.log('🎉 Fake data population completed!');
    console.log('\n📊 Summary:');
    console.log(`👥 Customers: ${customers.length}`);
    console.log(`🏪 Sellers: ${sellers.length}`);
    console.log(`☕ Additional products added per seller`);
    console.log(`📦 ~10 fake orders created`);
    
    console.log('\n🔑 Demo Accounts:');
    console.log('Customers:');
    fakeCustomers.forEach(customer => {
      console.log(`  - ${customer.username} / ${customer.password}`);
    });
    
    console.log('\nSellers:');
    sellerCredentials.forEach(seller => {
      console.log(`  - ${seller.shopName}: ${seller.email} / ${seller.password}`);
    });

  } catch (error) {
    console.error('❌ Error populating fake data:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
}

populateFakeData();
