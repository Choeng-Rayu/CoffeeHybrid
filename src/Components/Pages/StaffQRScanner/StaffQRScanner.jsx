import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { ordersAPI } from '../../../services/api';
import styles from './StaffQRScanner.module.css';

const StaffQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState('camera');
  const [stream, setStream] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
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
      setError('Camera access denied. Please allow camera access or use manual input.');
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

  // QR Detection
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
            handleVerifyQR(code.data);
          }
        } catch (error) {
          console.error('QR detection error:', error);
        }
      }
    }, 300);
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
      
      // Add to recent scans
      const newScan = {
        id: Date.now(),
        token: token.trim(),
        result: response,
        timestamp: new Date()
      };
      setRecentScans(prev => [newScan, ...prev.slice(0, 4)]); // Keep last 5 scans
      
      // Stop scanning after successful verification
      if (isScanning) {
        stopCamera();
      }
      
      // Auto-clear result after 15 seconds
      setTimeout(() => {
        setVerificationResult(null);
      }, 15000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
      setError(errorMessage);
      
      // Add failed scan to recent scans
      const failedScan = {
        id: Date.now(),
        token: token.trim(),
        result: { success: false, error: errorMessage },
        timestamp: new Date()
      };
      setRecentScans(prev => [failedScan, ...prev.slice(0, 4)]);
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
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString();

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.scannerCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>☕ Coffee Shop QR Scanner</h1>
          <p className={styles.subtitle}>
            Scan customer QR codes to verify and complete orders
          </p>
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
                  placeholder="Enter or paste QR token from customer's phone"
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
            
            <div className={styles.orderSummary}>
              <div className={styles.customerInfo}>
                <h4>Customer: {verificationResult.order.customer}</h4>
                <p>Order ID: {verificationResult.order.id}</p>
                <p>Total: {formatPrice(verificationResult.order.total)}</p>
                <p>Completed: {formatTime(verificationResult.order.pickupTime)}</p>
              </div>

              <div className={styles.orderItems}>
                <h4>Items:</h4>
                {verificationResult.order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemDetails}>
                      {item.size} | {item.sugarLevel} sugar | Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleReset} className={styles.newOrderBtn}>
              Scan Next Order
            </button>
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className={styles.recentScans}>
            <h4>Recent Scans</h4>
            {recentScans.map((scan) => (
              <div key={scan.id} className={`${styles.scanItem} ${scan.result.success ? styles.success : styles.failed}`}>
                <div className={styles.scanInfo}>
                  <span className={styles.scanTime}>{formatTime(scan.timestamp)}</span>
                  <span className={styles.scanStatus}>
                    {scan.result.success ? '✅ Verified' : '❌ Failed'}
                  </span>
                </div>
                {scan.result.success && (
                  <div className={styles.scanDetails}>
                    {scan.result.order.customer} - {formatPrice(scan.result.order.total)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className={styles.instructions}>
          <h4>📋 How to Use</h4>
          <ol>
            <li>Ask customer to show their order QR code</li>
            <li>Use camera to scan or manually enter the token</li>
            <li>Verify order details match customer's request</li>
            <li>Hand over the completed order to customer</li>
            <li>QR codes can only be used once per order</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StaffQRScanner;
