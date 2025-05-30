import styles from './ProductCard.module.css';

const ProductCard = ({ product, onClick }) => {
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'hot': return '☕';
      case 'iced': return '🧊';
      case 'frappe': return '🥤';
      default: return '☕';
    }
  };

  const getPriceRange = () => {
    if (!product.sizes || product.sizes.length === 0) {
      return formatPrice(product.basePrice);
    }

    const prices = product.sizes.map(size => product.basePrice + size.priceModifier);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }

    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  return (
    <div className={styles.productCard} onClick={onClick}>
      <div className={styles.productImage}>
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className={styles.placeholderImage}>
            <span className={styles.categoryIcon}>
              {getCategoryIcon(product.category)}
            </span>
          </div>
        )}
        <div className={styles.categoryBadge}>
          {product.category}
        </div>
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDescription}>{product.description}</p>
        
        <div className={styles.productDetails}>
          <div className={styles.priceInfo}>
            <span className={styles.price}>{getPriceRange()}</span>
          </div>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizesInfo}>
              <span className={styles.sizesLabel}>Sizes:</span>
              <span className={styles.sizes}>
                {product.sizes.map(size => size.name).join(', ')}
              </span>
            </div>
          )}
          
          {product.addOns && product.addOns.length > 0 && (
            <div className={styles.addOnsInfo}>
              <span className={styles.addOnsLabel}>Add-ons available</span>
            </div>
          )}
        </div>

        <button className={styles.customizeBtn}>
          Customize & Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
