import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  FiUsers, FiShield, FiActivity, FiSettings, FiTrash2,
  FiEdit2, FiEye, FiLock, FiUnlock, FiDownload, FiRefreshCw,
  FiUserCheck, FiUserX, FiClock, FiGlobe, FiServer,
  FiBarChart2, FiAlertCircle, FiCheckCircle, FiXCircle,
  FiMoreVertical, FiSearch, FiFilter, FiCalendar, FiMail
} from 'react-icons/fi';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*');
      
      // Fetch all projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*');
      
      // Fetch all tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*');
      
      setUsers(usersData || []);
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      
      // Calculate stats
      setStats({
        totalUsers: usersData?.length || 0,
        totalProjects: projectsData?.length || 0,
        totalTasks: tasksData?.length || 0,
        completedTasks: tasksData?.filter(t => t.status === 'completed').length || 0,
        pendingTasks: tasksData?.filter(t => t.status === 'pending').length || 0,
        adminCount: usersData?.filter(u => u.role === 'admin').length || 0,
        activeUsers: usersData?.filter(u => u.is_active !== false).length || 0
      });
      
      // Generate audit logs (from session history)
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const logs = (authUsers?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        last_sign_in_at: u.last_sign_in_at,
        created_at: u.created_at,
        action: 'login',
        ip: u.raw_app_meta_data?.ip || 'Unknown'
      }));
      setAuditLogs(logs || []);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success(`User role updated to ${newRole}`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast.success('Project deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const exportData = async (type) => {
    let data = [];
    let filename = '';
    
    switch(type) {
      case 'users':
        data = users;
        filename = 'users_export.csv';
        break;
      case 'projects':
        data = projects;
        filename = 'projects_export.csv';
        break;
      case 'tasks':
        data = tasks;
        filename = 'tasks_export.csv';
        break;
      case 'logs':
        data = auditLogs;
        filename = 'audit_logs.csv';
        break;
      default:
        return;
    }
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${type} exported successfully`);
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      background: '#0a0a0a',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    subtitle: {
      color: '#999',
      marginTop: '0.25rem',
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '0.5rem',
      flexWrap: 'wrap',
    },
    tab: {
      padding: '0.5rem 1.25rem',
      background: 'none',
      border: 'none',
      borderRadius: '8px',
      color: '#999',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    activeTab: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1rem',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#667eea',
    },
    statLabel: {
      fontSize: '0.7rem',
      color: '#999',
      marginTop: '0.25rem',
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    },
    searchInput: {
      flex: 1,
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '0.875rem',
    },
    exportButton: {
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      color: '#999',
      fontSize: '0.75rem',
      fontWeight: 500,
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      color: '#e0e0e0',
      fontSize: '0.875rem',
    },
    roleBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: 600,
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      background: 'rgba(255,255,255,0.05)',
      border: 'none',
      borderRadius: '6px',
      color: '#999',
      cursor: 'pointer',
      marginLeft: '0.25rem',
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid rgba(102,126,234,0.3)', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Panel</h1>
        <p style={styles.subtitle}>Manage users, projects, and system settings</p>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalUsers}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.adminCount}</div>
          <div style={styles.statLabel}>Admins</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalProjects}</div>
          <div style={styles.statLabel}>Total Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalTasks}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.completedTasks}</div>
          <div style={styles.statLabel}>Completed Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.pendingTasks}</div>
          <div style={styles.statLabel}>Pending Tasks</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {})}} onClick={() => setActiveTab('users')}>
          <FiUsers /> Users
        </button>
        <button style={{...styles.tab, ...(activeTab === 'projects' ? styles.activeTab : {})}} onClick={() => setActiveTab('projects')}>
          <FiGlobe /> Projects
        </button>
        <button style={{...styles.tab, ...(activeTab === 'tasks' ? styles.activeTab : {})}} onClick={() => setActiveTab('tasks')}>
          <FiCheckCircle /> Tasks
        </button>
        <button style={{...styles.tab, ...(activeTab === 'audit' ? styles.activeTab : {})}} onClick={() => setActiveTab('audit')}>
          <FiActivity /> Audit Logs
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.exportButton} onClick={() => exportData('users')}>
              <FiDownload /> Export
            </button>
            <button style={styles.exportButton} onClick={fetchAdminData}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(userItem => (
                <tr key={userItem.id}>
                  <td style={styles.td}>{userItem.name}</td>
                  <td style={styles.td}>{userItem.email}</td>
                  <td style={styles.td}>
                    <span style={{...styles.roleBadge, background: userItem.role === 'admin' ? 'rgba(102,126,234,0.2)' : 'rgba(16,185,129,0.2)', color: userItem.role === 'admin' ? '#667eea' : '#10b981' }}>
                      {userItem.role}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(userItem.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <FiCheckCircle color="#10b981" size={16} />
                  </td>
                  <td style={styles.td}>
                    {userItem.role !== 'admin' ? (
                      <button style={styles.actionButton} onClick={() => updateUserRole(userItem.id, 'admin')}>
                        <FiShield /> Make Admin
                      </button>
                    ) : (
                      userItem.id !== user?.id && (
                        <button style={styles.actionButton} onClick={() => updateUserRole(userItem.id, 'member')}>
                          <FiUserCheck /> Remove Admin
                        </button>
                      )
                    )}
                    {userItem.id !== user?.id && (
                      <button style={styles.actionButton} onClick={() => deleteUser(userItem.id)}>
                        <FiTrash2 /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <>
          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.exportButton} onClick={() => exportData('projects')}>
              <FiDownload /> Export
            </button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(project => (
                <tr key={project.id}>
                  <td style={styles.td}>{project.name}</td>
                  <td style={styles.td}>{project.description?.substring(0, 50)}</td>
                  <td style={styles.td}>{new Date(project.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button style={styles.actionButton} onClick={() => deleteProject(project.id)}>
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.exportButton} onClick={() => exportData('tasks')}>
              <FiDownload /> Export
            </button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.filter(t => t.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(task => (
                <tr key={task.id}>
                  <td style={styles.td}>{task.title}</td>
                  <td style={styles.td}>
                    <span style={{...styles.roleBadge, 
                      background: task.status === 'completed' ? 'rgba(16,185,129,0.2)' : task.status === 'in_progress' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#f59e0b' : '#ef4444'
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(task.due_date).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button style={styles.actionButton} onClick={() => deleteTask(task.id)}>
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <>
          <div style={styles.searchBar}>
            <button style={styles.exportButton} onClick={() => exportData('logs')}>
              <FiDownload /> Export Logs
            </button>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>IP Address</th>
                <th style={styles.th}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td style={styles.td}>{log.email}</td>
                  <td style={styles.td}>{log.action}</td>
                  <td style={styles.td}>{log.ip}</td>
                  <td style={styles.td}>{new Date(log.last_sign_in_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminPanel;