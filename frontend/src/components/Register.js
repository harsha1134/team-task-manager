import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, 
  FiBriefcase, FiCheckCircle, FiUsers, FiCheckSquare, FiSend
} from 'react-icons/fi';
import { PulseLoader } from 'react-spinners';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('form'); // 'form', 'success', 'error'
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });
      
      if (error) throw error;
      
      setRegisteredEmail(formData.email);
      setRegistrationStatus('success');
      toast.success('Registration successful! Please check your email to verify your account.');
      
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus('error');
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail
      });
      
      if (error) throw error;
      
      toast.success('Verification email resent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login');
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
      maxWidth: '480px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    successContainer: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '20px',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '480px',
      textAlign: 'center',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
      marginBottom: '2rem',
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
    select: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: '#f1f5f9',
      fontSize: '0.9375rem',
      cursor: 'pointer',
      outline: 'none',
      appearance: 'none',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#38bdf8',
    },
    checkboxLabel: {
      color: '#94a3b8',
      fontSize: '0.8125rem',
      cursor: 'pointer',
    },
    termsLink: {
      color: '#38bdf8',
      textDecoration: 'none',
      fontWeight: 500,
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
      marginTop: '0.5rem',
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
      marginLeft: '0.25rem',
    },
    featureList: {
      marginTop: '2rem',
      textAlign: 'left',
      width: '100%',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      color: '#cbd5e1',
      fontSize: '0.875rem',
    },
    passwordHint: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginTop: '0.375rem',
    },
    successIcon: {
      width: '80px',
      height: '80px',
      background: 'rgba(56, 189, 248, 0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem auto',
    },
    emailText: {
      color: '#38bdf8',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    messageBox: {
      background: 'rgba(56, 189, 248, 0.05)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
  };

  // Show success page after registration
  if (registrationStatus === 'success') {
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
              <FiUsers size={32} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
              Verify Your Email
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
              We've sent a verification link to your email address. Please verify your email to activate your account.
            </p>
          </motion.div>
        </div>
        
        <div style={styles.rightPanel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={styles.successContainer}
          >
            <div style={styles.successIcon}>
              <FiSend size={40} color="#38bdf8" />
            </div>
            
            <h2 style={styles.title}>Check Your Inbox</h2>
            <p style={styles.subtitle}>Verify your email address to continue</p>
            
            <div style={styles.messageBox}>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                We've sent a verification email to:
              </p>
              <p style={styles.emailText}>{registeredEmail}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Click the link in the email to verify your account. After verification, you can log in.
              </p>
            </div>
            
            <button
              onClick={goToLogin}
              style={styles.button}
              onMouseEnter={(e) => e.target.style.background = '#0ea5e9'}
              onMouseLeave={(e) => e.target.style.background = '#38bdf8'}
            >
              Go to Login <FiArrowRight size={16} />
            </button>
            
            <button
              onClick={resendVerificationEmail}
              disabled={isLoading}
              style={styles.secondaryButton}
              onMouseEnter={(e) => e.target.style.background = 'rgba(56, 189, 248, 0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {isLoading ? <PulseLoader color="#94a3b8" size={6} /> : 'Resend Verification Email'}
            </button>
            
            <div style={styles.linkContainer}>
              <Link to="/login" style={styles.linkText}>Back to Login</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show error page
  if (registrationStatus === 'error') {
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
              background: '#ef4444',
              padding: '1rem',
              borderRadius: '20px',
              marginBottom: '1.5rem'
            }}>
              <FiUsers size={32} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
              Registration Failed
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
              There was an error creating your account. Please try again.
            </p>
          </motion.div>
        </div>
        
        <div style={styles.rightPanel}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={styles.formContainer}
          >
            <h2 style={styles.title}>Registration Error</h2>
            <p style={styles.subtitle}>Something went wrong</p>
            
            <button
              onClick={() => setRegistrationStatus('form')}
              style={styles.button}
            >
              Try Again <FiArrowRight size={16} />
            </button>
            
            <div style={styles.linkContainer}>
              <Link to="/login" style={styles.linkText}>Back to Login</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show registration form
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
            <FiUsers size={32} color="#0f172a" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem' }}>
            Join TeamTask
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            Start collaborating with your team today. Create your account and boost productivity.
          </p>
          
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <FiCheckCircle size={18} color="#38bdf8" />
              <span>Unlimited tasks & projects</span>
            </div>
            <div style={styles.featureItem}>
              <FiUsers size={18} color="#38bdf8" />
              <span>Team collaboration tools</span>
            </div>
            <div style={styles.featureItem}>
              <FiCheckSquare size={18} color="#38bdf8" />
              <span>Real-time progress tracking</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div style={styles.rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={styles.formContainer}
        >
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Get started with your free workspace</p>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <FiUser style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              <label style={styles.label}>Role</label>
              <div style={styles.inputWrapper}>
                <FiBriefcase style={styles.inputIcon} />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={styles.select}
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <FiLock style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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
              <div style={styles.passwordHint}>
                Must be at least 6 characters
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <FiLock style={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
                <div style={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </div>
              </div>
            </div>
            
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="terms" style={styles.checkboxLabel}>
                I agree to the <Link to="/terms" style={styles.termsLink}>Terms of Service</Link> and <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={styles.button}
              onMouseEnter={(e) => e.target.style.background = '#0ea5e9'}
              onMouseLeave={(e) => e.target.style.background = '#38bdf8'}
            >
              {isLoading ? <PulseLoader color="#0f172a" size={8} /> : 'Create Account'}
              {!isLoading && <FiArrowRight size={16} />}
            </button>
          </form>
          
          <div style={styles.linkContainer}>
            Already have an account?
            <Link to="/login" style={styles.linkText}>Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;