import { useState } from 'react';
import { ordersAPI } from '../../../services/api';
import styles from './QRVerification.module.css';

const QRVerification = () => {
  const [qrToken, setQrToken] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyQR = async (e) => {
    e.preventDefault();
    
    if (!qrToken.trim()) {
      setError('Please enter a QR token');
      return;
    }

    setIsLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await ordersAPI.verifyQR(qrToken.trim());
      setVerificationResult(response);
      setQrToken(''); // Clear input after successful verification
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleReset = () => {
    setQrToken('');
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>QR Code Verification</h1>
          <p className={styles.subtitle}>
            Staff Portal - Verify customer pickup QR codes
          </p>
        </div>

        <form onSubmit={handleVerifyQR} className={styles.verificationForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="qrToken" className={styles.label}>
              QR Token or Scan Result
            </label>
            <input
              type="text"
              id="qrToken"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              className={styles.input}
              placeholder="Enter QR token or scan QR code"
              disabled={isLoading}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={isLoading || !qrToken.trim()}
              className={styles.verifyBtn}
            >
              {isLoading ? 'Verifying...' : 'Verify Order'}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetBtn}
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.errorResult}>
            <div className={styles.resultIcon}>❌</div>
            <h3>Verification Failed</h3>
            <p>{error}</p>
          </div>
        )}

        {verificationResult && verificationResult.success && (
          <div className={styles.successResult}>
            <div className={styles.resultIcon}>✅</div>
            <h3>Order Verified Successfully!</h3>
            
            <div className={styles.orderDetails}>
              <div className={styles.customerInfo}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {verificationResult.order.customer}</p>
                <p><strong>Order ID:</strong> {verificationResult.order.id}</p>
                <p><strong>Pickup Time:</strong> {formatDate(verificationResult.order.pickupTime)}</p>
                <p><strong>Total:</strong> {formatPrice(verificationResult.order.total)}</p>
              </div>

              <div className={styles.orderItems}>
                <h4>Order Items</h4>
                <div className={styles.itemsList}>
                  {verificationResult.order.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>
                          {item.quantity}× {item.name}
                        </span>
                        <div className={styles.itemSpecs}>
                          <span>Size: {item.size}</span>
                          <span>Sugar: {item.sugarLevel}</span>
                          {item.iceLevel !== 'medium' && (
                            <span>Ice: {item.iceLevel}</span>
                          )}
                          {item.addOns && item.addOns.length > 0 && (
                            <span>
                              Add-ons: {item.addOns.map(addOn => addOn.name).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.completionNote}>
              <p>✅ Order has been marked as completed and customer has been notified.</p>
            </div>
          </div>
        )}

        <div className={styles.instructions}>
          <h4>Instructions:</h4>
          <ul>
            <li>Ask customer to show their QR code</li>
            <li>Scan the QR code or manually enter the token</li>
            <li>Click "Verify Order" to confirm pickup</li>
            <li>If verification fails, check the QR code or ask customer for order details</li>
            <li>Completed orders cannot be verified again</li>
          </ul>
        </div>

        <div className={styles.statusCodes}>
          <h4>Common Status Codes:</h4>
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <span className={styles.statusIcon}>✅</span>
              <span>Valid QR - Order ready for pickup</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusIcon}>❌</span>
              <span>Invalid QR - Token not found or expired</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusIcon}>⏰</span>
              <span>Expired - Order not picked up within 30 minutes</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusIcon}>🔄</span>
              <span>Already Completed - Order was already picked up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRVerification;
