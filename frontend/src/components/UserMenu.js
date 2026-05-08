import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiLock, FiLogOut, FiSettings, 
  FiChevronDown, FiCheckCircle, FiX, FiEye, FiEyeOff,
  FiShield, FiBell, FiHelpCircle, FiUserCheck
} from 'react-icons/fi';
import { PulseLoader } from 'react-spinners';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent! Check your new email to confirm the change.');
      setShowEmailModal(false);
      setNewEmail('');
      
    } catch (error) {
      console.error('Error changing email:', error);
      toast.error(error.message || 'Failed to change email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const styles = {
    userMenu: {
      position: 'relative',
      display: 'inline-block',
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
    },
    userInfo: {
      textAlign: 'left',
    },
    userName: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
    },
    userRole: {
      fontSize: '11px',
      color: '#999',
    },
    chevron: {
      color: '#999',
      transition: 'transform 0.2s ease',
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '320px',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      zIndex: 1000,
      animation: 'slideDown 0.2s ease',
    },
    dropdownHeader: {
      padding: '1rem',
      borderBottom: '1px solid #334155',
      background: '#0f172a',
    },
    dropdownUserInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    dropdownAvatar: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 600,
      color: 'white',
    },
    dropdownUserName: {
      fontSize: '16px',
      fontWeight: 600,
      color: 'white',
    },
    dropdownUserEmail: {
      fontSize: '12px',
      color: '#94a3b8',
      marginTop: '2px',
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      color: '#e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
    },
    menuItemIcon: {
      width: '20px',
      color: '#667eea',
    },
    dangerItem: {
      color: '#ef4444',
      borderTop: '1px solid #334155',
    },
    dangerIcon: {
      color: '#ef4444',
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
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease',
    },
    modalContent: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '20px',
      padding: '1.5rem',
      width: '90%',
      maxWidth: '420px',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'white',
      marginBottom: '0.5rem',
    },
    modalSubtitle: {
      fontSize: '0.875rem',
      color: '#94a3b8',
      marginBottom: '1.5rem',
    },
    inputGroup: {
      marginBottom: '1rem',
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
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: '#f1f5f9',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'all 0.2s',
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#64748b',
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    buttonPrimary: {
      flex: 1,
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    buttonSecondary: {
      flex: 1,
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: '#cbd5e1',
      fontWeight: 500,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.userMenu} ref={menuRef}>
      <div style={styles.userButton} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.userAvatar}>
          {getInitials(user?.name)}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</div>
          <div style={styles.userRole}>{user?.role === 'admin' ? 'Admin' : 'Member'}</div>
        </div>
        <FiChevronDown style={{...styles.chevron, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}} />
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={styles.dropdownUserInfo}>
              <div style={styles.dropdownAvatar}>
                {getInitials(user?.name)}
              </div>
              <div>
                <div style={styles.dropdownUserName}>{user?.name}</div>
                <div style={styles.dropdownUserEmail}>{user?.email}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            <div style={styles.menuItem} onClick={() => { setShowEmailModal(true); setIsOpen(false); }}>
              <FiMail style={styles.menuItemIcon} />
              <span>Change Email Address</span>
            </div>
            
            <div style={styles.menuItem} onClick={() => { setShowPasswordModal(true); setIsOpen(false); }}>
              <FiLock style={styles.menuItemIcon} />
              <span>Change Password</span>
            </div>
            
            <div style={styles.menuItem} onClick={() => { navigate('/admin'); setIsOpen(false); }}>
              <FiSettings style={styles.menuItemIcon} />
              <span>Admin Settings</span>
            </div>
            
            <div style={{ ...styles.menuItem, ...styles.dangerItem }} onClick={handleLogout}>
              <FiLogOut style={{ ...styles.menuItemIcon, ...styles.dangerIcon }} />
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <div style={styles.modal} onClick={() => setShowEmailModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Change Email Address</h3>
            <p style={styles.modalSubtitle}>We'll send a verification link to your new email</p>
            
            <form onSubmit={handleChangeEmail}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Email Address</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="email"
                    placeholder="newemail@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.buttonPrimary} disabled={isLoading}>
                  {isLoading ? <PulseLoader color="#fff" size={6} /> : 'Send Verification'}
                </button>
                <button type="button" style={styles.buttonSecondary} onClick={() => setShowEmailModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={styles.modal} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Change Password</h3>
            <p style={styles.modalSubtitle}>Create a strong password to keep your account secure</p>
            
            <form onSubmit={handleChangePassword}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                    required
                  />
                  <div style={styles.passwordToggle} onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </div>
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.buttonPrimary} disabled={isLoading}>
                  {isLoading ? <PulseLoader color="#fff" size={6} /> : 'Update Password'}
                </button>
                <button type="button" style={styles.buttonSecondary} onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UserMenu;