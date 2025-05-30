import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { useCart } from '../../../context/CartContext';
import { ordersAPI } from '../../../services/api';
import OrderConfirmation from '../../OrderConfirmation/OrderConfirmation';
import styles from './Cart.module.css';

const Cart = () => {
  const { user, isAuthenticated } = useUser();
  const { cartItems, removeFromCart, updateCartItem, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.authPrompt}>
          <h2>Please log in to view your cart</h2>
          <button onClick={() => navigate('/login')} className={styles.loginBtn}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
    } else {
      const item = cartItems.find(item => item.id === cartItemId);
      const pricePerUnit = item.totalPrice / item.quantity;
      updateCartItem(cartItemId, {
        quantity: newQuantity,
        totalPrice: pricePerUnit * newQuantity
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.productId,
          size: item.size,
          sugarLevel: item.sugarLevel,
          iceLevel: item.iceLevel,
          addOns: item.addOns,
          quantity: item.quantity
        })),
        orderSource: 'web',
        customerInfo: {
          name: user.username,
          email: user.email
        }
      };

      const response = await ordersAPI.createOrder(orderData);
      setOrderConfirmation(response.order);
      clearCart();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderConfirmation) {
    return (
      <OrderConfirmation
        order={orderConfirmation}
        onClose={() => setOrderConfirmation(null)}
      />
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.emptyCart}>
          <h2>Your cart is empty</h2>
          <p>Add some delicious coffee to get started!</p>
          <button onClick={() => navigate('/menu')} className={styles.browseBtn}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1 className={styles.title}>Your Cart</h1>
        <p className={styles.itemCount}>
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cartItems.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <div className={styles.itemDetails}>
                  <span className={styles.detail}>Size: {item.size}</span>
                  <span className={styles.detail}>Sugar: {item.sugarLevel}</span>
                  {item.iceLevel !== 'medium' && (
                    <span className={styles.detail}>Ice: {item.iceLevel}</span>
                  )}
                  {item.addOns.length > 0 && (
                    <span className={styles.detail}>
                      Add-ons: {item.addOns.map(addOn => addOn.name).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.itemControls}>
                <div className={styles.quantityControls}>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className={styles.quantityBtn}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>

                <div className={styles.itemPrice}>
                  {formatPrice(item.totalPrice)}
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            
            <div className={styles.summaryRow + ' ' + styles.total}>
              <span>Total:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || cartItems.length === 0}
              className={styles.placeOrderBtn}
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>

            <button
              onClick={() => navigate('/menu')}
              className={styles.continueShoppingBtn}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
