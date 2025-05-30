import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on app start
  useEffect(() => {
    const savedCart = localStorage.getItem('coffeeCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('coffeeCart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('coffeeCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, customizations) => {
    const cartItem = {
      id: Date.now(), // Simple ID for cart item
      productId: product._id,
      name: product.name,
      basePrice: product.basePrice,
      size: customizations.size || 'medium',
      sugarLevel: customizations.sugarLevel || 'medium',
      iceLevel: customizations.iceLevel || 'medium',
      addOns: customizations.addOns || [],
      quantity: customizations.quantity || 1,
      totalPrice: calculateItemPrice(product, customizations)
    };

    setCartItems(prev => [...prev, cartItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItem = (cartItemId, updates) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === cartItemId 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateItemPrice = (product, customizations) => {
    let price = product.basePrice;

    // Add size modifier
    if (customizations.size && product.sizes) {
      const sizeOption = product.sizes.find(s => s.name === customizations.size);
      if (sizeOption) {
        price += sizeOption.priceModifier;
      }
    }

    // Add add-ons price
    if (customizations.addOns && customizations.addOns.length > 0) {
      const addOnsPrice = customizations.addOns.reduce((total, addOn) => total + addOn.price, 0);
      price += addOnsPrice;
    }

    return price * (customizations.quantity || 1);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
    calculateItemPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
