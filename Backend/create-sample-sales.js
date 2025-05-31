import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function createSampleSales() {
  try {
    console.log('🛒 Creating sample sales data...');
    
    // Find seller and products
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('❌ No seller found! Please create sellers first.');
      process.exit(1);
    }
    
    const products = await Product.find({ sellerId: seller._id });
    if (products.length === 0) {
      console.log('❌ No products found! Creating sample products...');
      
      // Create sample products
      const sampleProducts = [
        {
          name: 'Espresso',
          description: 'Strong and bold coffee',
          category: 'hot',
          basePrice: 3.50,
          sellerId: seller._id,
          shopName: seller.shopName,
          sizes: [
            { name: 'small', priceModifier: -0.50 },
            { name: 'medium', priceModifier: 0 },
            { name: 'large', priceModifier: 0.50 }
          ],
          addOns: [
            { name: 'Extra Shot', price: 1.00 },
            { name: 'Vanilla Syrup', price: 0.75 },
            { name: 'Caramel Syrup', price: 0.75 }
          ]
        },
        {
          name: 'Cappuccino',
          description: 'Espresso with steamed milk foam',
          category: 'hot',
          basePrice: 4.25,
          sellerId: seller._id,
          shopName: seller.shopName,
          sizes: [
            { name: 'small', priceModifier: -0.50 },
            { name: 'medium', priceModifier: 0 },
            { name: 'large', priceModifier: 0.50 }
          ],
          addOns: [
            { name: 'Extra Shot', price: 1.00 },
            { name: 'Cinnamon', price: 0.50 },
            { name: 'Chocolate Powder', price: 0.50 }
          ]
        },
        {
          name: 'Iced Latte',
          description: 'Cold espresso with milk',
          category: 'cold',
          basePrice: 4.75,
          sellerId: seller._id,
          shopName: seller.shopName,
          sizes: [
            { name: 'small', priceModifier: -0.50 },
            { name: 'medium', priceModifier: 0 },
            { name: 'large', priceModifier: 0.50 }
          ],
          addOns: [
            { name: 'Extra Shot', price: 1.00 },
            { name: 'Vanilla Syrup', price: 0.75 },
            { name: 'Oat Milk', price: 0.60 }
          ]
        },
        {
          name: 'Americano',
          description: 'Espresso with hot water',
          category: 'hot',
          basePrice: 3.25,
          sellerId: seller._id,
          shopName: seller.shopName,
          sizes: [
            { name: 'small', priceModifier: -0.50 },
            { name: 'medium', priceModifier: 0 },
            { name: 'large', priceModifier: 0.50 }
          ],
          addOns: [
            { name: 'Extra Shot', price: 1.00 },
            { name: 'Sugar', price: 0.00 }
          ]
        },
        {
          name: 'Frappuccino',
          description: 'Blended iced coffee drink',
          category: 'cold',
          basePrice: 5.50,
          sellerId: seller._id,
          shopName: seller.shopName,
          sizes: [
            { name: 'medium', priceModifier: 0 },
            { name: 'large', priceModifier: 0.75 }
          ],
          addOns: [
            { name: 'Whipped Cream', price: 0.75 },
            { name: 'Caramel Drizzle', price: 0.50 },
            { name: 'Chocolate Chips', price: 0.60 }
          ]
        }
      ];
      
      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
        products.push(product);
      }
      
      console.log(`✅ Created ${sampleProducts.length} sample products`);
    }
    
    // Find or create customers
    let customers = await User.find({ role: 'customer' });
    if (customers.length === 0) {
      const customerData = [
        { username: 'customer1', email: 'customer1@test.com', password: 'test123', role: 'customer' },
        { username: 'customer2', email: 'customer2@test.com', password: 'test123', role: 'customer' },
        { username: 'customer3', email: 'customer3@test.com', password: 'test123', role: 'customer' },
        { username: 'customer4', email: 'customer4@test.com', password: 'test123', role: 'customer' },
        { username: 'customer5', email: 'customer5@test.com', password: 'test123', role: 'customer' }
      ];
      
      for (const custData of customerData) {
        const customer = new User(custData);
        await customer.save();
        customers.push(customer);
      }
      
      console.log(`✅ Created ${customerData.length} sample customers`);
    }
    
    // Generate sample orders over the past 30 days
    const ordersToCreate = 50;
    const sizes = ['small', 'medium', 'large'];
    const sugarLevels = ['none', 'low', 'medium', 'high'];
    const iceLevels = ['none', 'low', 'medium', 'high'];
    
    console.log(`🎯 Creating ${ordersToCreate} sample orders...`);
    
    for (let i = 0; i < ordersToCreate; i++) {
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(orderDate.getHours() - hoursAgo);
      
      // Random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      // Random number of items (1-3)
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let total = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        
        // Calculate price
        let itemPrice = product.basePrice;
        const sizeOption = product.sizes.find(s => s.name === size);
        if (sizeOption) {
          itemPrice += sizeOption.priceModifier;
        }
        
        // Random add-ons (30% chance)
        const itemAddOns = [];
        if (Math.random() < 0.3 && product.addOns.length > 0) {
          const addOn = product.addOns[Math.floor(Math.random() * product.addOns.length)];
          itemAddOns.push(addOn);
          itemPrice += addOn.price;
        }
        
        const totalItemPrice = itemPrice * quantity;
        total += totalItemPrice;
        
        orderItems.push({
          productId: product._id,
          name: product.name,
          size: size,
          sugarLevel: sugarLevels[Math.floor(Math.random() * sugarLevels.length)],
          iceLevel: iceLevels[Math.floor(Math.random() * iceLevels.length)],
          addOns: itemAddOns,
          price: totalItemPrice,
          quantity: quantity
        });
      }
      
      // Create order
      const order = new Order({
        userId: customer._id,
        items: orderItems,
        total: total,
        qrToken: uuidv4(),
        status: 'completed', // Mark as completed for analytics
        orderSource: Math.random() < 0.7 ? 'web' : 'telegram',
        customerInfo: {
          name: customer.username,
          email: customer.email
        },
        createdAt: orderDate,
        pickupTime: new Date(orderDate.getTime() + (Math.random() * 30 + 5) * 60000) // 5-35 minutes later
      });
      
      await order.save();
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Created ${i + 1}/${ordersToCreate} orders...`);
      }
    }
    
    console.log('✅ Sample sales data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${products.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Orders: ${ordersToCreate}`);
    console.log(`   Seller: ${seller.shopName} (${seller.username})`);
    
    console.log('\n🎯 You can now view analytics in the seller dashboard!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample sales:', error);
    process.exit(1);
  }
}

createSampleSales();
