import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { useUser } from '../../../context/UserContext';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      // Check if user is seller or admin
      if (response.user.role !== 'seller' && response.user.role !== 'admin') {
        setError('Access denied. Seller privileges required.');
        setIsLoading(false);
        return;
      }

      login(response.user);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Seller Portal</h2>
        <p className={styles.subtitle}>Sign in to manage your coffee products</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="emailOrUsername" className={styles.label}>
              Email or Username
            </label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Enter your seller email or username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Seller Portal'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Need a seller account? Contact support to get started.
          </p>
          <p>
            <a href="/" className={styles.link}>
              Back to Customer Portal
            </a>
          </p>
        </div>

        <div className={styles.demoAccounts}>
          <h4>Demo Seller Accounts:</h4>
          <div className={styles.demoAccount}>
            <strong>Coffee Central:</strong> coffeeshop1 / seller123
          </div>
          <div className={styles.demoAccount}>
            <strong>Bean Paradise:</strong> coffeeshop2 / seller123
          </div>
          <div className={styles.demoAccount}>
            <strong>Brew Masters:</strong> coffeeshop3 / seller123
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
