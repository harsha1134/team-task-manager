import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiShield } from 'react-icons/fi';  
import UserMenu from './UserMenu'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  if (!user) return null;

  const styles = {
    navbar: {
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      textDecoration: 'none',
    },
    navLinks: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    link: {
      color: '#e0e0e0',
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 0.3s ease',
      position: 'relative',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    userName: {
      fontWeight: 600,
      color: '#667eea',
    },
    userRole: {
      fontSize: '0.875rem',
      color: '#999',
    },
    logoutBtn: {
      padding: '0.5rem 1rem',
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.3s ease',
    },
    mobileMenuBtn: {
      display: 'none',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
    },
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.logo}>
          TaskManager
        </Link>
        <div style={{...styles.navLinks, display: isMobileMenuOpen ? 'flex' : 'flex'}} className="nav-links">
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/projects" style={styles.link}>Projects</Link>
          <Link to="/tasks" style={styles.link}>Tasks</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={styles.link}>
                <FiShield size={16} /> Admin
            </Link>
            )}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;