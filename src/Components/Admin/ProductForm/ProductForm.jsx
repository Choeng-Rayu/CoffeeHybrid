import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { adminAPI } from '../../../services/api';
import styles from './ProductForm.module.css';

const ProductForm = ({ onProductAdded, editProduct = null }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    description: editProduct?.description || '',
    category: editProduct?.category || 'hot',
    basePrice: editProduct?.basePrice || '',
    image: editProduct?.image || '',
    preparationTime: editProduct?.preparationTime || 5,
    featured: editProduct?.featured || false,
    sizes: editProduct?.sizes || [
      { name: 'small', priceModifier: -0.50 },
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.50 }
    ],
    addOns: editProduct?.addOns || []
  });

  const [newAddOn, setNewAddOn] = useState({ name: '', price: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === 'priceModifier' ? parseFloat(value) || 0 : value
    };
    setFormData(prev => ({ ...prev, sizes: updatedSizes }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', priceModifier: 0 }]
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleAddOnChange = (field, value) => {
    setNewAddOn(prev => ({
      ...prev,
      [field]: field === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const addAddOn = () => {
    if (newAddOn.name && newAddOn.price > 0) {
      setFormData(prev => ({
        ...prev,
        addOns: [...prev.addOns, newAddOn]
      }));
      setNewAddOn({ name: '', price: '' });
    }
  };

  const removeAddOn = (index) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        preparationTime: parseInt(formData.preparationTime),
        userId: user.id
      };

      if (editProduct) {
        await adminAPI.updateProduct(editProduct._id, productData);
        setSuccess('Product updated successfully!');
      } else {
        await adminAPI.addProduct(productData);
        setSuccess('Product added successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: 'hot',
          basePrice: '',
          image: '',
          preparationTime: 5,
          featured: false,
          sizes: [
            { name: 'small', priceModifier: -0.50 },
            { name: 'medium', priceModifier: 0 },
            { name: 'large', priceModifier: 0.50 }
          ],
          addOns: []
        });
      }

      if (onProductAdded) {
        onProductAdded();
      }

    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.productForm}>
      <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="e.g., Caramel Macchiato"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="category" className={styles.label}>Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.input}
              required
            >
              <option value="hot">Hot Coffee</option>
              <option value="iced">Iced Coffee</option>
              <option value="frappe">Frappe</option>
            </select>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="description" className={styles.label}>Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            required
            placeholder="Describe your coffee product..."
            rows={3}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="basePrice" className={styles.label}>Base Price ($)</label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              className={styles.input}
              required
              min="0"
              step="0.01"
              placeholder="4.50"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="preparationTime" className={styles.label}>Prep Time (minutes)</label>
            <input
              type="number"
              id="preparationTime"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              className={styles.input}
              required
              min="1"
              max="30"
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="image" className={styles.label}>Image URL (optional)</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://example.com/coffee-image.jpg"
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className={styles.checkbox}
            />
            Featured Product
          </label>
        </div>

        {/* Sizes Section */}
        <div className={styles.section}>
          <h4>Sizes & Pricing</h4>
          {formData.sizes.map((size, index) => (
            <div key={index} className={styles.sizeRow}>
              <input
                type="text"
                value={size.name}
                onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                placeholder="Size name"
                className={styles.sizeInput}
              />
              <input
                type="number"
                value={size.priceModifier}
                onChange={(e) => handleSizeChange(index, 'priceModifier', e.target.value)}
                placeholder="Price modifier"
                step="0.01"
                className={styles.sizeInput}
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addSize} className={styles.addBtn}>
            Add Size
          </button>
        </div>

        {/* Add-ons Section */}
        <div className={styles.section}>
          <h4>Add-ons</h4>
          {formData.addOns.map((addOn, index) => (
            <div key={index} className={styles.addOnRow}>
              <span>{addOn.name} - ${addOn.price.toFixed(2)}</span>
              <button
                type="button"
                onClick={() => removeAddOn(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className={styles.addOnForm}>
            <input
              type="text"
              value={newAddOn.name}
              onChange={(e) => handleAddOnChange('name', e.target.value)}
              placeholder="Add-on name"
              className={styles.addOnInput}
            />
            <input
              type="number"
              value={newAddOn.price}
              onChange={(e) => handleAddOnChange('price', e.target.value)}
              placeholder="Price"
              step="0.01"
              min="0"
              className={styles.addOnInput}
            />
            <button type="button" onClick={addAddOn} className={styles.addBtn}>
              Add Add-on
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (editProduct ? 'Update Product' : 'Add Product')}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
