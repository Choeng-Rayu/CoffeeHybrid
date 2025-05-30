import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuAPI } from '../../../services/api';
import ProductCard from '../../ProductCard/ProductCard';
import ProductModal from '../../ProductModal/ProductModal';
import styles from './Menu.module.css';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '☕' },
    { id: 'hot', name: 'Hot Coffee', icon: '☕' },
    { id: 'iced', name: 'Iced Coffee', icon: '🧊' },
    { id: 'frappe', name: 'Frappes', icon: '🥤' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const category = selectedCategory === 'all' ? null : selectedCategory;
      const response = await menuAPI.getMenu(category);
      setProducts(response.products);
    } catch (error) {
      setError('Failed to load menu. Please try again.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className={styles.menuContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading delicious coffee options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.menuContainer}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchProducts} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menuContainer}>
      <div className={styles.menuHeader}>
        <h1 className={styles.title}>Our Coffee Menu</h1>
        <p className={styles.subtitle}>
          Discover our carefully crafted coffee selection
        </p>
      </div>

      <div className={styles.categoryFilter}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`${styles.categoryBtn} ${
              selectedCategory === category.id ? styles.active : ''
            }`}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      <div className={styles.productsGrid}>
        {products.length === 0 ? (
          <div className={styles.noProducts}>
            <p>No products found in this category.</p>
          </div>
        ) : (
          products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))
        )}
      </div>

      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Menu;
