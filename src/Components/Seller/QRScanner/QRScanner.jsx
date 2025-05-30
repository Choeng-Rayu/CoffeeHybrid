import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { ordersAPI } from '../../../services/api';
import { useUser } from '../../../context/UserContext';
import styles from './QRScanner.module.css';

const QRScanner = () => {
  const { user } = useUser();
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Initialize camera for QR scanning
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsScanning(true);
      startQRDetection();
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Camera access denied. Please use manual input or check camera permissions.');
      setScanMode('manual');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setIsScanning(false);
  };

  // QR Code detection using jsQR
  const startQRDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            console.log('QR Code detected:', code.data);
            // Automatically verify the detected QR code
            handleVerifyQR(code.data);
          }
        } catch (error) {
          console.error('QR detection error:', error);
        }
      }
    }, 300); // Check every 300ms for better responsiveness
  };

  // Handle QR verification
  const handleVerifyQR = async (token) => {
    if (!token.trim()) {
      setError('Please enter a QR token or scan a QR code');
      return;
    }

    setIsLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await ordersAPI.verifyQR(token.trim());
      setVerificationResult(response);
      setManualToken('');

      // Stop scanning after successful verification
      if (isScanning) {
        stopCamera();
      }

      // Auto-clear result after 10 seconds
      setTimeout(() => {
        setVerificationResult(null);
      }, 10000);

    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual form submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVerifyQR(manualToken);
  };

  // Reset everything
  const handleReset = () => {
    setVerificationResult(null);
    setError('');
    setManualToken('');
    if (isScanning) {
      stopCamera();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.scannerCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>📱 Order Verification</h2>
          <p className={styles.subtitle}>
            Scan customer QR codes to complete orders
          </p>
          <div className={styles.shopInfo}>
            <span className={styles.shopName}>{user?.shopName || 'Coffee Shop'}</span>
          </div>
        </div>

        {/* Mode Selection */}
        <div className={styles.modeSelection}>
          <button
            onClick={() => setScanMode('camera')}
            className={`${styles.modeBtn} ${scanMode === 'camera' ? styles.active : ''}`}
          >
            📷 Camera Scan
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`${styles.modeBtn} ${scanMode === 'manual' ? styles.active : ''}`}
          >
            ⌨️ Manual Input
          </button>
        </div>

        {/* Camera Scanner */}
        {scanMode === 'camera' && (
          <div className={styles.cameraSection}>
            {!isScanning ? (
              <div className={styles.cameraStart}>
                <div className={styles.cameraIcon}>📷</div>
                <h3>Start Camera Scanner</h3>
                <p>Position the customer's QR code in front of the camera</p>
                <button onClick={startCamera} className={styles.startCameraBtn}>
                  Start Camera
                </button>
              </div>
            ) : (
              <div className={styles.cameraActive}>
                <div className={styles.videoContainer}>
                  <video ref={videoRef} className={styles.video} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div className={styles.scanOverlay}>
                    <div className={styles.scanFrame}></div>
                    <p className={styles.scanInstructions}>
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
                <div className={styles.cameraControls}>
                  <button onClick={stopCamera} className={styles.stopCameraBtn}>
                    Stop Camera
                  </button>
                  <p className={styles.manualFallback}>
                    Having trouble? <button onClick={() => setScanMode('manual')} className={styles.linkBtn}>
                      Use manual input
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Input */}
        {scanMode === 'manual' && (
          <div className={styles.manualSection}>
            <form onSubmit={handleManualSubmit} className={styles.manualForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="qrToken" className={styles.label}>
                  QR Token
                </label>
                <input
                  type="text"
                  id="qrToken"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className={styles.input}
                  placeholder="Enter QR token from customer's phone"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={isLoading || !manualToken.trim()}
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
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={styles.errorResult}>
            <div className={styles.resultIcon}>❌</div>
            <h3>Verification Failed</h3>
            <p>{error}</p>
            <button onClick={() => setError('')} className={styles.dismissBtn}>
              Dismiss
            </button>
          </div>
        )}

        {/* Success Result */}
        {verificationResult && verificationResult.success && (
          <div className={styles.successResult}>
            <div className={styles.resultIcon}>✅</div>
            <h3>Order Verified Successfully!</h3>

            <div className={styles.orderDetails}>
              <div className={styles.customerInfo}>
                <h4>Customer Information</h4>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Name:</span>
                  <span className={styles.value}>{verificationResult.order.customer}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Order ID:</span>
                  <span className={styles.value}>{verificationResult.order.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Total:</span>
                  <span className={styles.value}>{formatPrice(verificationResult.order.total)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Pickup Time:</span>
                  <span className={styles.value}>{formatDate(verificationResult.order.pickupTime)}</span>
                </div>
              </div>

              <div className={styles.orderItems}>
                <h4>Order Items</h4>
                {verificationResult.order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDetails}>
                      Size: {item.size} | Sugar: {item.sugarLevel} | Qty: {item.quantity}
                      {item.addOns && item.addOns.length > 0 && (
                        <div className={styles.addOns}>
                          Add-ons: {item.addOns.map(addon => addon.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.successActions}>
              <button onClick={handleReset} className={styles.newOrderBtn}>
                Scan Next Order
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={styles.instructions}>
          <h4>📋 How to Use</h4>
          <ul>
            <li>Ask customer to show their QR code</li>
            <li>Use camera to scan or manually enter the token</li>
            <li>Verify order details with customer</li>
            <li>Complete the order and hand over items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
