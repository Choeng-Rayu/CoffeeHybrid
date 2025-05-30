import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { adminAPI } from '../../../services/api';
import ProductForm from '../ProductForm/ProductForm';
import styles from './ProductList.module.css';

const ProductList = ({ products, onProductUpdated }) => {
  const { user } = useUser();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleProductUpdated = () => {
    setEditingProduct(null);
    onProductUpdated();
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await adminAPI.deleteProduct(productId, user.id);
      onProductUpdated();
    } catch (error) {
      setError('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (product) => {
    setIsLoading(true);
    setError('');

    try {
      await adminAPI.updateProduct(product._id, {
        available: !product.available,
        userId: user.id
      });
      onProductUpdated();
    } catch (error) {
      setError('Failed to update product availability');
    } finally {
      setIsLoading(false);
    }
  };

  if (editingProduct) {
    return (
      <div>
        <div className={styles.editHeader}>
          <h3>Edit Product</h3>
          <button onClick={handleCancelEdit} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
        <ProductForm
          editProduct={editingProduct}
          onProductAdded={handleProductUpdated}
        />
      </div>
    );
  }

  return (
    <div className={styles.productList}>
      <div className={styles.header}>
        <h3>My Products ({products.length})</h3>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <h4>No products yet</h4>
          <p>Start by adding your first coffee product!</p>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {products.map(product => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productHeader}>
                <h4 className={styles.productName}>{product.name}</h4>
                <div className={styles.productStatus}>
                  <span className={`${styles.statusBadge} ${product.available ? styles.available : styles.unavailable}`}>
                    {product.available ? 'Available' : 'Unavailable'}
                  </span>
                  {product.featured && (
                    <span className={styles.featuredBadge}>Featured</span>
                  )}
                </div>
              </div>

              <div className={styles.productInfo}>
                <p className={styles.description}>{product.description}</p>
                
                <div className={styles.productDetails}>
                  <div className={styles.detail}>
                    <strong>Category:</strong> {product.category}
                  </div>
                  <div className={styles.detail}>
                    <strong>Base Price:</strong> {formatPrice(product.basePrice)}
                  </div>
                  <div className={styles.detail}>
                    <strong>Prep Time:</strong> {product.preparationTime} min
                  </div>
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <div className={styles.sizes}>
                    <strong>Sizes:</strong>
                    <div className={styles.sizeList}>
                      {product.sizes.map((size, index) => (
                        <span key={index} className={styles.sizeItem}>
                          {size.name} ({size.priceModifier >= 0 ? '+' : ''}{formatPrice(size.priceModifier)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.addOns && product.addOns.length > 0 && (
                  <div className={styles.addOns}>
                    <strong>Add-ons:</strong>
                    <div className={styles.addOnList}>
                      {product.addOns.map((addOn, index) => (
                        <span key={index} className={styles.addOnItem}>
                          {addOn.name} (+{formatPrice(addOn.price)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.productActions}>
                <button
                  onClick={() => handleEdit(product)}
                  className={styles.editBtn}
                  disabled={isLoading}
                >
                  Edit
                </button>
                
                <button
                  onClick={() => toggleAvailability(product)}
                  className={`${styles.toggleBtn} ${product.available ? styles.disable : styles.enable}`}
                  disabled={isLoading}
                >
                  {product.available ? 'Disable' : 'Enable'}
                </button>
                
                <button
                  onClick={() => handleDelete(product._id)}
                  className={styles.deleteBtn}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
