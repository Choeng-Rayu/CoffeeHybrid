import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { adminAPI } from '../../../services/api';
import styles from './SalesAnalytics.module.css';

const SalesAnalytics = () => {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.getAnalytics(user.id, {
        period: selectedPeriod,
        groupBy: selectedPeriod === 'today' ? 'hour' : 'day'
      });
      
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${(price || 0).toFixed(2)}`;
  const formatNumber = (num) => (num || 0).toLocaleString();

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const viewOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'products', label: 'Product Performance' },
    { value: 'categories', label: 'Category Analysis' },
    { value: 'trends', label: 'Sales Trends' },
    { value: 'details', label: 'Detailed Analysis' }
  ];

  if (loading) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.error}>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview, productPerformance, categoryPerformance, salesTrends, sizeAnalysis, addOnAnalysis } = analytics || {};

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 Sales Analytics</h1>
        <p className={styles.subtitle}>
          Comprehensive insights into your {user?.shopName} performance
        </p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Time Period:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={styles.select}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>View:</label>
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            className={styles.select}
          >
            {viewOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button onClick={fetchAnalytics} className={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* Overview Cards */}
      {(selectedView === 'overview' || selectedView === 'all') && overview && (
        <div className={styles.overviewSection}>
          <h2 className={styles.sectionTitle}>📈 Overview</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🛒</div>
              <div className={styles.statContent}>
                <h3>Total Orders</h3>
                <p className={styles.statValue}>{formatNumber(overview.totalOrders)}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3>Total Revenue</h3>
                <p className={styles.statValue}>{formatPrice(overview.totalRevenue)}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3>Average Order Value</h3>
                <p className={styles.statValue}>{formatPrice(overview.averageOrderValue)}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>☕</div>
              <div className={styles.statContent}>
                <h3>Items Sold</h3>
                <p className={styles.statValue}>{formatNumber(overview.totalItemsSold)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Performance */}
      {(selectedView === 'products' || selectedView === 'all') && productPerformance && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🏆 Top Performing Products</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Avg Price</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.slice(0, 10).map((product, index) => (
                  <tr key={product._id}>
                    <td className={styles.rank}>
                      {index + 1}
                      {index === 0 && <span className={styles.crown}>👑</span>}
                    </td>
                    <td className={styles.productName}>{product.productName}</td>
                    <td className={styles.category}>{product.category}</td>
                    <td className={styles.number}>{formatNumber(product.totalSold)}</td>
                    <td className={styles.price}>{formatPrice(product.totalRevenue)}</td>
                    <td className={styles.price}>{formatPrice(product.averagePrice)}</td>
                    <td className={styles.number}>{formatNumber(product.orderCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Performance */}
      {(selectedView === 'categories' || selectedView === 'all') && categoryPerformance && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📂 Category Performance</h2>
          <div className={styles.categoryGrid}>
            {categoryPerformance.map((category, index) => (
              <div key={category._id} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <h3>{category.category}</h3>
                  <span className={styles.categoryRank}>#{index + 1}</span>
                </div>
                <div className={styles.categoryStats}>
                  <div className={styles.categoryStat}>
                    <span className={styles.label}>Revenue:</span>
                    <span className={styles.value}>{formatPrice(category.totalRevenue)}</span>
                  </div>
                  <div className={styles.categoryStat}>
                    <span className={styles.label}>Units Sold:</span>
                    <span className={styles.value}>{formatNumber(category.totalSold)}</span>
                  </div>
                  <div className={styles.categoryStat}>
                    <span className={styles.label}>Orders:</span>
                    <span className={styles.value}>{formatNumber(category.orderCount)}</span>
                  </div>
                  <div className={styles.categoryStat}>
                    <span className={styles.label}>Products:</span>
                    <span className={styles.value}>{formatNumber(category.uniqueProductCount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size and Add-on Analysis */}
      {(selectedView === 'details' || selectedView === 'all') && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔍 Detailed Analysis</h2>
          
          <div className={styles.detailsGrid}>
            {/* Size Analysis */}
            <div className={styles.detailCard}>
              <h3>📏 Size Preferences</h3>
              <div className={styles.detailList}>
                {sizeAnalysis?.map((size, index) => (
                  <div key={size._id} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{size.size}</span>
                    <div className={styles.detailStats}>
                      <span>{formatNumber(size.totalSold)} sold</span>
                      <span>{formatPrice(size.totalRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-on Analysis */}
            <div className={styles.detailCard}>
              <h3>➕ Popular Add-ons</h3>
              <div className={styles.detailList}>
                {addOnAnalysis?.slice(0, 5).map((addon, index) => (
                  <div key={addon._id} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{addon.addOnName}</span>
                    <div className={styles.detailStats}>
                      <span>{formatNumber(addon.totalSold)} times</span>
                      <span>{formatPrice(addon.totalRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className={styles.exportSection}>
        <h3>📄 Export Reports</h3>
        <div className={styles.exportButtons}>
          <button className={styles.exportBtn} onClick={() => window.print()}>
            🖨️ Print Report
          </button>
          <button className={styles.exportBtn} disabled>
            📊 Export CSV (Coming Soon)
          </button>
          <button className={styles.exportBtn} disabled>
            📈 Export PDF (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
