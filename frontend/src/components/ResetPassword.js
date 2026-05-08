import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { FiLock, FiArrowRight, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { PulseLoader } from 'react-spinners';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Invalid or expired reset link. Please request a new one.');
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success('Password updated successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
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
      textAlign: 'center',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      color: '#f1f5f9',
    },
    subtitle: {
      color: '#94a3b8',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
    },
    inputGroup: {
      marginBottom: '1.25rem',
      textAlign: 'left',
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
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.75rem',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: '#f1f5f9',
      fontSize: '0.9375rem',
      outline: 'none',
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      cursor: 'pointer',
      color: '#64748b',
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

  if (isSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div style={styles.successIcon}>
            <FiCheckCircle size={32} color="#38bdf8" />
          </div>
          <h2 style={styles.title}>Password Updated!</h2>
          <p style={styles.subtitle}>
            Your password has been successfully changed.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create New Password</h2>
        <p style={styles.subtitle}>Enter your new password below</p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <div style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </div>
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={styles.button}
            onMouseEnter={(e) => e.target.style.background = '#0ea5e9'}
            onMouseLeave={(e) => e.target.style.background = '#38bdf8'}
          >
            {isLoading ? <PulseLoader color="#0f172a" size={8} /> : 'Reset Password'}
            {!isLoading && <FiArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;