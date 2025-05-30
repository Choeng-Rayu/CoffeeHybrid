import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './ProductModal.module.css';

const ProductModal = ({ product, onClose }) => {
  const { isAuthenticated } = useUser();
  const { addToCart, calculateItemPrice } = useCart();
  const navigate = useNavigate();

  const [customizations, setCustomizations] = useState({
    size: product.sizes?.[0]?.name || 'medium',
    sugarLevel: 'medium',
    iceLevel: 'medium',
    addOns: [],
    quantity: 1
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const price = calculateItemPrice(product, customizations);
    setTotalPrice(price);
  }, [customizations, product, calculateItemPrice]);

  const handleSizeChange = (size) => {
    setCustomizations(prev => ({ ...prev, size }));
  };

  const handleLevelChange = (type, level) => {
    setCustomizations(prev => ({ ...prev, [type]: level }));
  };

  const handleAddOnToggle = (addOn) => {
    setCustomizations(prev => {
      const isSelected = prev.addOns.some(item => item.name === addOn.name);
      if (isSelected) {
        return {
          ...prev,
          addOns: prev.addOns.filter(item => item.name !== addOn.name)
        };
      } else {
        return {
          ...prev,
          addOns: [...prev.addOns, addOn]
        };
      }
    });
  };

  const handleQuantityChange = (change) => {
    setCustomizations(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    addToCart(product, customizations);
    onClose();
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const levels = ['none', 'low', 'medium', 'high'];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.productName}>{product.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.productImage}>
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className={styles.placeholderImage}>
                <span className={styles.categoryIcon}>
                  {product.category === 'hot' ? '☕' : 
                   product.category === 'iced' ? '🧊' : '🥤'}
                </span>
              </div>
            )}
          </div>

          <div className={styles.customizationSection}>
            <p className={styles.description}>{product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.optionGroup}>
                <h3 className={styles.optionTitle}>Size</h3>
                <div className={styles.optionButtons}>
                  {product.sizes.map(size => (
                    <button
                      key={size.name}
                      onClick={() => handleSizeChange(size.name)}
                      className={`${styles.optionBtn} ${
                        customizations.size === size.name ? styles.selected : ''
                      }`}
                    >
                      {size.name}
                      {size.priceModifier !== 0 && (
                        <span className={styles.priceModifier}>
                          {size.priceModifier > 0 ? '+' : ''}
                          {formatPrice(size.priceModifier)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugar Level */}
            <div className={styles.optionGroup}>
              <h3 className={styles.optionTitle}>Sugar Level</h3>
              <div className={styles.optionButtons}>
                {levels.map(level => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange('sugarLevel', level)}
                    className={`${styles.optionBtn} ${
                      customizations.sugarLevel === level ? styles.selected : ''
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Ice Level (for iced and frappe) */}
            {(product.category === 'iced' || product.category === 'frappe') && (
              <div className={styles.optionGroup}>
                <h3 className={styles.optionTitle}>Ice Level</h3>
                <div className={styles.optionButtons}>
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => handleLevelChange('iceLevel', level)}
                      className={`${styles.optionBtn} ${
                        customizations.iceLevel === level ? styles.selected : ''
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {product.addOns && product.addOns.length > 0 && (
              <div className={styles.optionGroup}>
                <h3 className={styles.optionTitle}>Add-ons</h3>
                <div className={styles.addOnsList}>
                  {product.addOns.map(addOn => (
                    <label key={addOn.name} className={styles.addOnItem}>
                      <input
                        type="checkbox"
                        checked={customizations.addOns.some(item => item.name === addOn.name)}
                        onChange={() => handleAddOnToggle(addOn)}
                        className={styles.addOnCheckbox}
                      />
                      <span className={styles.addOnName}>{addOn.name}</span>
                      <span className={styles.addOnPrice}>+{formatPrice(addOn.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className={styles.optionGroup}>
              <h3 className={styles.optionTitle}>Quantity</h3>
              <div className={styles.quantityControls}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className={styles.quantityBtn}
                  disabled={customizations.quantity <= 1}
                >
                  -
                </button>
                <span className={styles.quantity}>{customizations.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className={styles.quantityBtn}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.totalPrice}>
            Total: {formatPrice(totalPrice)}
          </div>
          <button
            onClick={handleAddToCart}
            className={styles.addToCartBtn}
          >
            {isAuthenticated ? 'Add to Cart' : 'Login to Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
