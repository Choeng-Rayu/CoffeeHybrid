import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useUser();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          ☕ CoffeeHybrid
        </Link>

        <div className={styles.navMenu}>
          <Link to="/menu" className={styles.navLink}>
            Menu
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className={styles.navLink}>
                Cart ({getCartItemCount()})
              </Link>
              <Link to="/orders" className={styles.navLink}>
                Orders
              </Link>
              <div className={styles.userMenu}>
                <span className={styles.username}>
                  Hello, {user.username}
                </span>
                <button 
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
              <Link to="/register" className={styles.navLink}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
