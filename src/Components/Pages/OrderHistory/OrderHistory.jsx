import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { ordersAPI } from '../../../services/api';
import QRCode from 'react-qr-code';
import styles from './OrderHistory.module.css';

const OrderHistory = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getUserOrders(user.id, { limit: 20 });
      setOrders(response.orders);
    } catch (error) {
      setError('Failed to load order history. Please try again.');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#d4a574';
      case 'completed': return '#28a745';
      case 'no-show': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'completed': return '✅';
      case 'no-show': return '❌';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  const handleShowQR = (order) => {
    if (order.status === 'pending') {
      setSelectedOrder(order);
      setShowQRModal(true);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await ordersAPI.cancelOrder(orderId);
      fetchOrders(); // Refresh the list
    } catch (error) {
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className={styles.ordersContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ordersContainer}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchOrders} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order History</h1>
        <p className={styles.subtitle}>
          Track your coffee orders and view QR codes for pickup
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.noOrders}>
          <h3>No orders yet</h3>
          <p>Start by ordering some delicious coffee!</p>
          <button onClick={() => navigate('/menu')} className={styles.browseBtn}>
            Browse Menu
          </button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderId}>Order #{order._id.slice(-8)}</h3>
                  <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                </div>
                <div className={styles.orderStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                  <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <span className={styles.itemName}>
                      {item.quantity}× {item.name}
                    </span>
                    <span className={styles.itemDetails}>
                      {item.size} | {item.sugarLevel} sugar
                      {item.addOns.length > 0 && ` | +${item.addOns.length} add-ons`}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.orderActions}>
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleShowQR(order)}
                      className={styles.qrBtn}
                    >
                      Show QR Code
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className={styles.cancelBtn}
                    >
                      Cancel Order
                    </button>
                    <div className={styles.expiryInfo}>
                      Expires: {formatDate(order.expiresAt)}
                    </div>
                  </>
                )}
                {order.status === 'completed' && order.pickupTime && (
                  <div className={styles.completedInfo}>
                    Picked up: {formatDate(order.pickupTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
          <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Pickup QR Code</h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            <div className={styles.qrContainer}>
              <QRCode
                value={selectedOrder.qrToken}
                size={250}
                level="M"
                includeMargin={true}
              />
            </div>
            <div className={styles.qrInstructions}>
              <p>Show this QR code to staff when picking up your order</p>
              <p className={styles.expiryWarning}>
                Order expires: {formatDate(selectedOrder.expiresAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
