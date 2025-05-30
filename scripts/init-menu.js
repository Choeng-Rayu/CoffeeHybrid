// Script to initialize menu data
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function initializeMenu() {
  try {
    console.log('🍵 Initializing coffee menu...');
    
    const response = await axios.post(`${API_BASE_URL}/menu/initialize`);
    
    if (response.data.success) {
      console.log('✅ Menu initialized successfully!');
      console.log(`📊 Added ${response.data.count} products to the menu`);
    } else {
      console.log('ℹ️ Menu already initialized');
    }
    
    // Test API health
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('🏥 API Health:', healthResponse.data.status);
    
  } catch (error) {
    console.error('❌ Error initializing menu:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
}

initializeMenu();
