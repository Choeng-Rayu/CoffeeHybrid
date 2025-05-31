import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function testAnalytics() {
  try {
    console.log('🧪 Testing fixed analytics API...');
    
    // Get seller
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('❌ No seller found!');
      process.exit(1);
    }
    
    console.log('✅ Testing analytics for seller:', seller.username);
    
    // Test the analytics API
    const response = await fetch(`http://localhost:5000/api/admin/analytics/${seller._id}?period=month`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
      process.exit(1);
    }
    
    const data = await response.json();
    
    if (data.success) {
      const analytics = data.analytics;
      
      console.log('\n🎉 Analytics API is working!');
      console.log('\n📊 Overview:');
      console.log(`   Total Orders: ${analytics.overview.totalOrders}`);
      console.log(`   Total Revenue: $${analytics.overview.totalRevenue.toFixed(2)}`);
      console.log(`   Average Order Value: $${analytics.overview.averageOrderValue.toFixed(2)}`);
      console.log(`   Items Sold: ${analytics.overview.totalItemsSold}`);
      
      console.log('\n🏆 Top Products:');
      analytics.productPerformance.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productName}: ${product.totalSold} sold, $${product.totalRevenue.toFixed(2)} revenue`);
      });
      
      console.log('\n📂 Categories:');
      analytics.categoryPerformance.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.category}: ${category.totalSold} sold, $${category.totalRevenue.toFixed(2)} revenue`);
      });
      
      console.log('\n📏 Size Analysis:');
      analytics.sizeAnalysis.forEach((size, index) => {
        console.log(`   ${index + 1}. ${size.size}: ${size.totalSold} sold, $${size.totalRevenue.toFixed(2)} revenue`);
      });
      
      if (analytics.addOnAnalysis.length > 0) {
        console.log('\n➕ Add-on Analysis:');
        analytics.addOnAnalysis.slice(0, 3).forEach((addon, index) => {
          console.log(`   ${index + 1}. ${addon.addOnName}: ${addon.totalSold} times, $${addon.totalRevenue.toFixed(2)} revenue`);
        });
      } else {
        console.log('\n➕ Add-on Analysis: No add-ons found');
      }
      
      console.log('\n✅ All analytics data is now working correctly!');
      console.log('\n🎯 You can now view the analytics in the seller dashboard.');
      
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
    process.exit(1);
  }
}

testAnalytics();
