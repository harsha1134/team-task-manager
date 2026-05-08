import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, 
  FiKey, FiSend, FiCheckCircle, FiArrowLeft
} from 'react-icons/fi';
import { PulseLoader } from 'react-spinners';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    setResetLoading(true);
    
    try {
      // Get the current origin URL (your app's URL)
      const origin = window.location.origin;
      
      // Send reset password email with redirect to your reset-password page
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail('');
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
    },
    gridOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
      zIndex: 0,
    },
    leftPanel: {
      flex: 1,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 1,
      borderRight: '1px solid rgba(56, 189, 248, 0.15)',
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 1,
      background: '#0f172a',
    },
    formContainer: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '20px',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '20px',
      padding: '2rem',
      width: '90%',
      maxWidth: '420px',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      color: '#f1f5f9',
      letterSpacing: '-0.025em',
    },
    subtitle: {
      color: '#94a3b8',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
    },
    inputGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#cbd5e1',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      color: '#64748b',
      fontSize: '1.125rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: '#f1f5f9',
      fontSize: '0.9375rem',
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      cursor: 'pointer',
      color: '#64748b',
      fontSize: '1.125rem',
    },
    button: {
      width: '100%',
      padding: '0.875rem',
      background: '#38bdf8',
      border: 'none',
      borderRadius: '12px',
      color: '#0f172a',
      fontSize: '0.9375rem',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
    },
    secondaryButton: {
      width: '100%',
      padding: '0.875rem',
      background: 'transparent',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: '#94a3b8',
      fontSize: '0.9375rem',
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
    },
    forgotLink: {
      textAlign: 'right',
      marginTop: '0.5rem',
    },
    forgotButton: {
      background: 'none',
      border: 'none',
      color: '#38bdf8',
      cursor: 'pointer',
      fontSize: '0.8rem',
    },
    linkContainer: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#94a3b8',
      fontSize: '0.875rem',
    },
    linkText: {
      color: '#38bdf8',
      textDecoration: 'none',
      fontWeight: 600,
    },
    backLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '1rem',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    successIcon: {
      width: '64px',
      height: '64px',
      background: 'rgba(56, 189, 248, 0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
    },
  };

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          {!resetSent ? (
            <>
              <FiKey size={40} color="#38bdf8" style={{ marginBottom: '1rem' }} />
              <h2 style={{ ...styles.title, fontSize: '1.5rem' }}>Reset Password</h2>
              <p style={styles.subtitle}>Enter your email to receive reset instructions</p>
              
              <form onSubmit={handleForgotPassword}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <FiMail style={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={resetLoading}
                  style={styles.button}
                >
                  {resetLoading ? <PulseLoader color="#0f172a" size={8} /> : 'Send Reset Email'}
                  {!resetLoading && <FiSend size={16} />}
                </button>
              </form>
              
              <div style={styles.backLink} onClick={() => setShowForgotPassword(false)}>
                <FiArrowLeft size={14} /> Back to Login
              </div>
            </>
          ) : (
            <>
              <div style={styles.successIcon}>
                <FiCheckCircle size={32} color="#38bdf8" />
              </div>
              <h2 style={{ ...styles.title, fontSize: '1.5rem' }}>Email Sent!</h2>
              <p style={styles.subtitle}>
                We've sent a password reset link to <strong>{resetEmail}</strong>
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Check your inbox and click the link to reset your password.
              </p>
              
              <div style={styles.backLink} onClick={() => setShowForgotPassword(false)}>
                <FiArrowLeft size={14} /> Back to Login
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main Login Form
  return (
    <div style={styles.container}>
      <div style={styles.gridOverlay} />
      
      <div style={styles.leftPanel}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', maxWidth: '400px' }}
        >
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#38bdf8',
            padding: '1rem',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <FiKey size={32} color="#0f172a" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
            Welcome Back!
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
            Sign in to access your tasks, projects, and team collaboration features.
          </p>
        </motion.div>
      </div>
      
      <div style={styles.rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={styles.formContainer}
        >
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Access your account</p>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <FiMail style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="hello@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <FiLock style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <div style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </div>
              </div>
              <div style={styles.forgotLink}>
                <button
                  type="button"
                  style={styles.forgotButton}
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={styles.button}
              onMouseEnter={(e) => e.target.style.background = '#0ea5e9'}
              onMouseLeave={(e) => e.target.style.background = '#38bdf8'}
            >
              {isLoading ? <PulseLoader color="#0f172a" size={8} /> : 'Sign In'}
              {!isLoading && <FiArrowRight size={16} />}
            </button>
          </form>
          
          <div style={styles.linkContainer}>
            Don't have an account?
            <Link to="/register" style={styles.linkText}>Create Account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;