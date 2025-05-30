import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Import components
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Pages/Home/Home';
import Login from './Components/Auth/Login/Login';
import Register from './Components/Auth/Register/Register';
import Menu from './Components/Pages/Menu/Menu';
import Cart from './Components/Pages/Cart/Cart';
import OrderHistory from './Components/Pages/OrderHistory/OrderHistory';
import QRVerification from './Components/Pages/QRVerification/QRVerification';
import AdminLogin from './Components/Admin/AdminLogin/AdminLogin';
import AdminDashboard from './Components/Admin/AdminDashboard/AdminDashboard';

// Context for user authentication
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/verify" element={<QRVerification />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
