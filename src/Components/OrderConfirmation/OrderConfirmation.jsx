import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { ordersAPI } from '../../services/api';
import styles from './OrderConfirmation.module.css';

const OrderConfirmation = ({ order, onClose }) => {
  const navigate = useNavigate();
  const [qrBlob, setQrBlob] = useState(null);

  useEffect(() => {
    // Fetch QR code image
    const fetchQRCode = async () => {
      try {
        const blob = await ordersAPI.getOrderQR(order.id);
        const url = URL.createObjectURL(blob);
        setQrBlob(url);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      }
    };

    fetchQRCode();

    return () => {
      if (qrBlob) {
        URL.revokeObjectURL(qrBlob);
      }
    };
  }, [order.id]);

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDownloadQR = () => {
    if (qrBlob) {
      const link = document.createElement('a');
      link.href = qrBlob;
      link.download = `order-${order.id}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewOrders = () => {
    navigate('/orders');
    if (onClose) onClose();
  };

  const handleContinueShopping = () => {
    navigate('/menu');
    if (onClose) onClose();
  };

  return (
    <div className={styles.confirmationContainer}>
      <div className={styles.confirmationCard}>
        <div className={styles.header}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.title}>Order Confirmed!</h1>
          <p className={styles.subtitle}>
            Your coffee is being prepared. Show this QR code when picking up.
          </p>
        </div>

        <div className={styles.orderDetails}>
          <div className={styles.orderInfo}>
            <h3>Order Information</h3>
            <div className={styles.infoRow}>
              <span>Order ID:</span>
              <span className={styles.orderId}>{order.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Order Time:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Expires At:</span>
              <span className={styles.expiryTime}>
                {formatDate(order.expiresAt)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span>Total:</span>
              <span className={styles.total}>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className={styles.qrSection}>
            <h3>Pickup QR Code</h3>
            <div className={styles.qrContainer}>
              <QRCode
                value={order.qrToken}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className={styles.qrInstructions}>
              Show this QR code to staff when picking up your order
            </p>
            <div className={styles.tokenDisplay}>
              <p className={styles.tokenLabel}>QR Token (for manual entry):</p>
              <code className={styles.tokenCode}>{order.qrToken}</code>
              <button
                onClick={() => navigator.clipboard.writeText(order.qrToken)}
                className={styles.copyBtn}
              >
                Copy Token
              </button>
            </div>
            {qrBlob && (
              <button onClick={handleDownloadQR} className={styles.downloadBtn}>
                Download QR Code
              </button>
            )}
          </div>
        </div>

        <div className={styles.orderItems}>
          <h3>Order Items</h3>
          <div className={styles.itemsList}>
            {order.items.map((item, index) => (
              <div key={index} className={styles.orderItem}>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <div className={styles.itemSpecs}>
                    <span>Size: {item.size}</span>
                    <span>Sugar: {item.sugarLevel}</span>
                    {item.iceLevel !== 'medium' && (
                      <span>Ice: {item.iceLevel}</span>
                    )}
                    {item.addOns.length > 0 && (
                      <span>
                        Add-ons: {item.addOns.map(addOn => addOn.name).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  <span className={styles.quantity}>×{item.quantity}</span>
                  <span className={styles.price}>{formatPrice(item.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.importantNote}>
          <h4>⚠️ Important Notes:</h4>
          <ul>
            <li>Your order will expire in 30 minutes if not picked up</li>
            <li>Please arrive on time to avoid no-show penalties</li>
            <li>Show the QR code to complete your pickup</li>
            <li>Keep this confirmation for your records</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button onClick={handleViewOrders} className={styles.primaryBtn}>
            View All Orders
          </button>
          <button onClick={handleContinueShopping} className={styles.secondaryBtn}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
