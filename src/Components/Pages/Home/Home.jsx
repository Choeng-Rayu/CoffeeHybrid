import { Link } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import styles from './Home.module.css';

const Home = () => {
  const { isAuthenticated, user } = useUser();

  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to CoffeeHybrid
          </h1>
          <p className={styles.heroSubtitle}>
            Order your perfect coffee with our dual-platform system. 
            Available on web and Telegram bot with QR code pickup verification.
          </p>
          
          {isAuthenticated ? (
            <div className={styles.welcomeBack}>
              <h2>Welcome back, {user.username}! ☕</h2>
              <div className={styles.actionButtons}>
                <Link to="/menu" className={styles.primaryBtn}>
                  Browse Menu
                </Link>
                <Link to="/orders" className={styles.secondaryBtn}>
                  View Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.authPrompt}>
              <div className={styles.actionButtons}>
                <Link to="/register" className={styles.primaryBtn}>
                  Get Started
                </Link>
                <Link to="/login" className={styles.secondaryBtn}>
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Why Choose CoffeeHybrid?</h2>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3>Web & Telegram</h3>
              <p>Order through our responsive web app or convenient Telegram bot</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3>QR Code Pickup</h3>
              <p>Get a unique QR code for each order to ensure secure pickup</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Fast & Efficient</h3>
              <p>Reduce wait times and eliminate order mix-ups</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3>No-Show Prevention</h3>
              <p>Smart system to reduce waste from unclaimed orders</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎨</div>
              <h3>Full Customization</h3>
              <p>Size, sugar level, ice level, and premium add-ons</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏆</div>
              <h3>Loyalty Rewards</h3>
              <p>Earn points with every order and unlock rewards</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.categories}>
        <div className={styles.categoriesContainer}>
          <h2 className={styles.sectionTitle}>Our Coffee Categories</h2>
          
          <div className={styles.categoryGrid}>
            <Link to="/menu?category=hot" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>☕</div>
              <h3>Hot Coffee</h3>
              <p>Americano, Cappuccino, Latte & more</p>
            </Link>
            
            <Link to="/menu?category=iced" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>🧊</div>
              <h3>Iced Coffee</h3>
              <p>Refreshing cold brews and iced classics</p>
            </Link>
            
            <Link to="/menu?category=frappe" className={styles.categoryCard}>
              <div className={styles.categoryIcon}>🥤</div>
              <h3>Frappes</h3>
              <p>Blended coffee drinks with whipped cream</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
