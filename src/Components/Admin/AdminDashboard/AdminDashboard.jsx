import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { adminAPI } from '../../../services/api';
import ProductForm from '../ProductForm/ProductForm';
import ProductList from '../ProductList/ProductList';
import QRScanner from '../../Seller/QRScanner/QRScanner';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || (user.role !== 'seller' && user.role !== 'admin')) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch seller's products
      const productsResponse = await adminAPI.getSellerProducts(user.id);
      setProducts(productsResponse.products);

      // Fetch dashboard stats
      const statsResponse = await adminAPI.getDashboardStats(user.id);
      setStats(statsResponse.stats);

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = () => {
    fetchDashboardData();
    setActiveTab('products');
  };

  const handleProductUpdated = () => {
    fetchDashboardData();
  };

  if (!isAuthenticated || (user.role !== 'seller' && user.role !== 'admin')) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Seller Dashboard</h1>
        <div className={styles.shopInfo}>
          <h2>{user.shopName}</h2>
          <p>Welcome back, {user.username}!</p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('qr-scanner')}
          className={`${styles.tab} ${activeTab === 'qr-scanner' ? styles.active : ''}`}
        >
          📱 QR Scanner
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
        >
          ☕ My Products
        </button>
        <button
          onClick={() => setActiveTab('add-product')}
          className={`${styles.tab} ${activeTab === 'add-product' ? styles.active : ''}`}
        >
          ➕ Add Product
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
        >
          📋 Orders
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'dashboard' && (
          <div className={styles.dashboardStats}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Products</h3>
                <div className={styles.statNumber}>{stats?.productCount || 0}</div>
              </div>

              <div className={styles.statCard}>
                <h3>Today's Orders</h3>
                <div className={styles.statNumber}>{stats?.todayOrders || 0}</div>
              </div>

              <div className={styles.statCard}>
                <h3>Total Revenue</h3>
                <div className={styles.statNumber}>
                  ${stats?.orderStats?.reduce((total, stat) => total + (stat.totalRevenue || 0), 0)?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className={styles.statCard}>
                <h3>Completed Orders</h3>
                <div className={styles.statNumber}>
                  {stats?.orderStats?.find(s => s._id === 'completed')?.count || 0}
                </div>
              </div>
            </div>

            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setActiveTab('qr-scanner')}
                  className={styles.actionBtn}
                >
                  📱 Scan QR Codes
                </button>
                <button
                  onClick={() => setActiveTab('add-product')}
                  className={styles.actionBtn}
                >
                  ➕ Add New Product
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={styles.actionBtn}
                >
                  📝 Manage Products
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={styles.actionBtn}
                >
                  📋 View Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr-scanner' && (
          <QRScanner />
        )}

        {activeTab === 'products' && (
          <ProductList
            products={products}
            onProductUpdated={handleProductUpdated}
          />
        )}

        {activeTab === 'add-product' && (
          <ProductForm
            onProductAdded={handleProductAdded}
          />
        )}

        {activeTab === 'orders' && (
          <div className={styles.ordersSection}>
            <h3>Recent Orders</h3>
            <p>Order management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
