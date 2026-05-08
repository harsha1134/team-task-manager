import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, FiChevronDown, FiZap, FiLayers, FiShield,
  FiTwitter, FiGithub, FiLinkedin, FiMail, FiMapPin, FiPhone,
  FiHeart, FiTrendingUp, FiUsers, FiCheck, FiClock
} from 'react-icons/fi';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) navigate('/dashboard');
    else navigate('/register');
  };

  const features = [
    { icon: <FiZap size={24} />, title: "Lightning Fast", desc: "Real-time updates and instant collaboration" },
    { icon: <FiLayers size={24} />, title: "Smart Organization", desc: "AI-powered task prioritization" },
    { icon: <FiShield size={24} />, title: "Enterprise Security", desc: "Bank-level encryption security" }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", icon: <FiTrendingUp /> },
    { value: "50K+", label: "Active Teams", icon: <FiUsers /> },
    { value: "2M+", label: "Tasks Completed", icon: <FiCheck /> },
    { value: "24/7", label: "Support", icon: <FiClock /> }
  ];

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      background: '#0a0a0a',
    },
    heroContainer: {
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
    },
    videoBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'brightness(0.3) contrast(1.2)',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 30% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
      zIndex: 1,
    },
    bottomGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '200px',
      background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)',
      zIndex: 1,
    },
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: scrolled ? '0.75rem 2rem' : '1.25rem 2rem',
      background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
      zIndex: 100,
      transition: 'all 0.3s ease',
    },
    navContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      letterSpacing: '-0.02em',
    },
    navButtons: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    navLogin: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      border: 'none',
      color: '#e0e0e0',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    navSignup: {
      padding: '0.5rem 1.25rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    mainContent: {
      maxWidth: '700px',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '100px',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '1.5rem',
    },
    badgeDot: {
      width: '8px',
      height: '8px',
      background: '#10b981',
      borderRadius: '50%',
      animation: 'pulse 2s infinite',
    },
    title: {
      fontSize: '4.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      marginBottom: '1.5rem',
      letterSpacing: '-0.02em',
    },
    titleGradient: {
      background: 'linear-gradient(135deg, #fff 0%, #667eea 50%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    description: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '2rem',
      maxWidth: '550px',
    },
    ctaButtons: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '3rem',
      flexWrap: 'wrap',
    },
    btnPrimary: {
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
    },
    btnSecondary: {
      padding: '1rem 2rem',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
    },
    statsGrid: {
      display: 'flex',
      gap: '3rem',
      flexWrap: 'wrap',
    },
    statItem: {
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem',
    },
    statLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    featuresSection: {
      position: 'relative',
      zIndex: 2,
      background: '#0a0a0a',
      padding: '5rem 2rem',
    },
    featuresContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '2rem',
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: '3rem',
      color: 'white',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    featureCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px',
      padding: '2rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
    },
    featureIcon: {
      width: '60px',
      height: '60px',
      background: 'rgba(102,126,234,0.1)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      color: '#667eea',
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'white',
      marginBottom: '0.5rem',
    },
    featureDesc: {
      fontSize: '0.875rem',
      color: '#999',
      lineHeight: 1.5,
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
    },
    // Footer Styles
    footer: {
      background: '#0f172a',
      padding: '4rem 2rem 2rem',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    },
    footerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      marginBottom: '3rem',
    },
    footerBrand: {
      maxWidth: '300px',
    },
    footerLogo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      marginBottom: '1rem',
      display: 'inline-block',
    },
    footerDescription: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      lineHeight: 1.6,
      marginBottom: '1.5rem',
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
    },
    socialIcon: {
      width: '36px',
      height: '36px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    footerColumnTitle: {
      color: 'white',
      fontSize: '1rem',
      fontWeight: 600,
      marginBottom: '1.25rem',
    },
    footerLinks: {
      listStyle: 'none',
      padding: 0,
    },
    footerLink: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      marginBottom: '0.75rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    footerContact: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      color: '#94a3b8',
      fontSize: '0.875rem',
    },
    footerBottom: {
      paddingTop: '2rem',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    copyright: {
      color: '#64748b',
      fontSize: '0.75rem',
    },
    heart: {
      color: '#ef4444',
      margin: '0 0.25rem',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroContainer}>
        <video 
          autoPlay
          loop 
          muted 
          playsInline 
          style={styles.videoBackground}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-world-map-2570-large.mp4" type="video/mp4" />
        </video>
        
        <div style={styles.gradientOverlay}></div>
        <div style={styles.bottomGradient}></div>
        
        {/* Navbar */}
        <div style={styles.navbar}>
          <div style={styles.navContent}>
            <div style={styles.logo}>TaskManager</div>
            <div style={styles.navButtons}>
              <button style={styles.navLogin} onClick={() => navigate('/login')}>Sign In</button>
              <button style={styles.navSignup} onClick={handleGetStarted}>Get Started</button>
            </div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div style={styles.content}>
          <div style={styles.mainContent}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={styles.badge}>
                <div style={styles.badgeDot}></div>
                <span style={{ fontSize: '0.875rem', color: '#e0e0e0' }}>Trusted by teams worldwide</span>
              </div>
              
              <h1 style={styles.title}>
                Transform Your Team's{" "}
                <span style={styles.titleGradient}>Productivity</span>
              </h1>
              
              <p style={styles.description}>
                Streamline projects, assign tasks, and track progress with our 
                intelligent task management system. Built for modern teams.
              </p>
              
              <div style={styles.ctaButtons}>
                <motion.button
                  style={styles.btnPrimary}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                >
                  Let's Explore <FiArrowRight />
                </motion.button>
                <motion.button
                  style={styles.btnSecondary}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                >
                  Learn More <FiChevronDown />
                </motion.button>
              </div>
              
              <div style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    style={styles.statItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div style={{...styles.statValue, color: '#667eea'}}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        <div style={styles.scrollIndicator} onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
          <div style={{ width: '24px', height: '40px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '20px', position: 'relative' }}>
            <div style={{ width: '4px', height: '8px', background: 'white', position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', borderRadius: '2px', animation: 'scrollAnim 2s infinite' }} />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresContainer}>
          <h2 style={styles.sectionTitle}>Everything you need to succeed</h2>
          
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                style={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, background: 'rgba(255,255,255,0.05)' }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerGrid}>
            {/* Brand Column */}
            <div style={styles.footerBrand}>
              <div style={styles.footerLogo}>TaskManager</div>
              <p style={styles.footerDescription}>
                The ultimate task management platform for modern teams. 
                Collaborate, track, and achieve more together.
              </p>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.socialIcon}><FiTwitter size={18} /></a>
                <a href="#" style={styles.socialIcon}><FiGithub size={18} /></a>
                <a href="#" style={styles.socialIcon}><FiLinkedin size={18} /></a>
                <a href="#" style={styles.socialIcon}><FiMail size={18} /></a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 style={styles.footerColumnTitle}>Product</h4>
              <ul style={styles.footerLinks}>
                <li style={styles.footerLink}>Features</li>
                <li style={styles.footerLink}>Pricing</li>
                <li style={styles.footerLink}>Integrations</li>
                <li style={styles.footerLink}>Roadmap</li>
                <li style={styles.footerLink}>Changelog</li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 style={styles.footerColumnTitle}>Company</h4>
              <ul style={styles.footerLinks}>
                <li style={styles.footerLink}>About Us</li>
                <li style={styles.footerLink}>Blog</li>
                <li style={styles.footerLink}>Careers</li>
                <li style={styles.footerLink}>Press Kit</li>
                <li style={styles.footerLink}>Contact</li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 style={styles.footerColumnTitle}>Resources</h4>
              <ul style={styles.footerLinks}>
                <li style={styles.footerLink}>Documentation</li>
                <li style={styles.footerLink}>API Reference</li>
                <li style={styles.footerLink}>Community</li>
                <li style={styles.footerLink}>Support Center</li>
                <li style={styles.footerLink}>Status</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={styles.footerColumnTitle}>Contact</h4>
              <div style={styles.footerContact}>
                <FiMail size={16} />
                <span>support@taskmanager.com</span>
              </div>
              <div style={styles.footerContact}>
                <FiPhone size={16} />
                <span>+91 9876543210</span>
              </div>
              <div style={styles.footerContact}>
                <FiMapPin size={16} />
                <span>Tiurpati, India</span>
              </div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <div style={styles.copyright}>
              © 2026 TaskManager. All rights reserved.
            </div>
            <div style={styles.copyright}>
              Made with <FiHeart style={styles.heart} size={12} /> for better productivity
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={styles.copyright}>Privacy Policy</span>
              <span style={styles.copyright}>Terms of Service</span>
              <span style={styles.copyright}>Security</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scrollAnim {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(15px); }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;