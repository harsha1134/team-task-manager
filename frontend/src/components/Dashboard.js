import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, 
  FiUsers, FiFolder, FiCalendar, FiBarChart2, FiStar,
  FiChevronRight, FiActivity, FiTarget, FiZap, FiPieChart,
  FiRefreshCw, FiUserCheck, FiLayers, FiAward, FiList
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');
      
      if (tasksError) throw tasksError;
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
      
      if (projectsError) throw projectsError;
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Fetch project members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('*');
      
      if (membersError) throw membersError;
      
      setTasks(tasksData || []);
      setProjects(projectsData || []);
      setUsers(usersData || []);
      setProjectMembers(membersData || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => 
      new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;
    
    const completionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(1)
      : 0;
    
    // Priority distribution
    const priorityData = [
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' }
    ];
    
    // Status distribution
    const statusData = [
      { name: 'Completed', value: completedTasks, color: '#10b981' },
      { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
      { name: 'Pending', value: pendingTasks, color: '#ef4444' }
    ];
    
    // Member workload
    const memberWorkload = users.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_to === member.id);
      return {
        id: member.id,
        name: member.name,
        tasks: memberTasks.length,
        completed: memberTasks.filter(t => t.status === 'completed').length,
        inProgress: memberTasks.filter(t => t.status === 'in_progress').length,
        pending: memberTasks.filter(t => t.status === 'pending').length
      };
    }).sort((a, b) => b.tasks - a.tasks);
    
    // Project progress
    const projectProgress = projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const memberCount = projectMembers.filter(m => m.project_id === project.id).length;
      return {
        id: project.id,
        name: project.name,
        progress: projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0,
        total: projectTasks.length,
        completed,
        members: memberCount
      };
    });
    
    // Task completion trend (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    const completionTrend = last7Days.map(date => {
      const createdOnDate = tasks.filter(t => t.created_at?.split('T')[0] === date).length;
      const completedOnDate = tasks.filter(t => 
        t.status === 'completed' && t.updated_at?.split('T')[0] === date
      ).length;
      return { date: date.slice(5), created: createdOnDate, completed: completedOnDate };
    });
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      priorityData,
      statusData,
      memberWorkload,
      projectProgress,
      completionTrend,
      totalProjects: projects.length,
      totalMembers: users.length,
      activeProjects: projects.filter(p => {
        const projectTasks = tasks.filter(t => t.project_id === p.id);
        return projectTasks.some(t => t.status !== 'completed');
      }).length
    };
  }, [tasks, projects, users, projectMembers]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '8px 12px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{label}</p>
          <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#667eea', fontWeight: 'bold' }}>
            {payload[0].value} tasks
          </p>
        </div>
      );
    }
    return null;
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
    greeting: {
      fontSize: '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    username: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    date: {
      color: '#999',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '0.5rem',
    },
    tab: {
      padding: '0.5rem 1rem',
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.2s',
    },
    activeTab: {
      color: '#667eea',
      borderBottom: '2px solid #667eea',
    },
    refreshButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.25rem',
    },
    statValue: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.25rem',
    },
    statLabel: {
      fontSize: '0.75rem',
      color: '#999',
      textTransform: 'uppercase',
    },
    chartsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    },
    chartCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
    },
    chartTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    progressBar: {
      width: '100%',
      height: '6px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '0.5rem',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      transition: 'width 0.3s',
    },
    memberItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    memberName: {
      fontSize: '0.875rem',
      color: '#e0e0e0',
    },
    memberStats: {
      fontSize: '0.75rem',
      color: '#999',
    },
    projectItem: {
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    projectName: {
      fontSize: '0.875rem',
      color: '#e0e0e0',
      marginBottom: '0.25rem',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0a0a0a',
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '3px solid rgba(102,126,234,0.3)',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.greeting}>
            {getGreeting()}, <span style={styles.username}>{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p style={styles.date}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button style={styles.refreshButton} onClick={fetchDashboardData}>
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div style={styles.tabs}>
        {['overview', 'analytics', 'team'].map(tab => (
          <button
            key={tab}
            style={{...styles.tab, ...(activeTab === tab ? styles.activeTab : {})}}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalTasks}</div>
              <div style={styles.statLabel}>Total Tasks</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statValue, color: '#10b981'}}>{stats.completionRate}%</div>
              <div style={styles.statLabel}>Completion Rate</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statValue, color: '#f59e0b'}}>{stats.inProgressTasks}</div>
              <div style={styles.statLabel}>In Progress</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statValue, color: '#ef4444'}}>{stats.overdueTasks}</div>
              <div style={styles.statLabel}>Overdue</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalProjects}</div>
              <div style={styles.statLabel}>Projects</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalMembers}</div>
              <div style={styles.statLabel}>Team Members</div>
            </div>
          </div>

          <div style={styles.chartsRow}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                <FiBarChart2 size={18} />
                Task Overview
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#667eea" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                <FiPieChart size={18} />
                Priority Distribution
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <FiTrendingUp size={18} />
              Project Progress
            </div>
            {stats.projectProgress.slice(0, 5).map(project => (
              <div key={project.id} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#e0e0e0' }}>{project.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#667eea' }}>{project.progress.toFixed(0)}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, width: `${project.progress}%`}}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                  {project.completed} of {project.total} tasks completed
                </div>
              </div>
            ))}
            {stats.projectProgress.length === 0 && (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No projects yet</p>
            )}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          <div style={styles.chartsRow}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                <FiTrendingUp size={18} />
                Weekly Activity
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke="#f59e0b" name="Created" />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                <FiActivity size={18} />
                Completion Analytics
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea' }}>
                  {stats.completionRate}%
                </div>
                <p style={{ color: '#999', marginTop: '0.5rem' }}>Overall Completion Rate</p>
                <div style={styles.progressBar}>
                  <div style={{...styles.progressFill, width: `${stats.completionRate}%`}}></div>
                </div>
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedTasks}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>Completed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.pendingTasks}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <FiAward size={18} />
              Performance Insights
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Average Tasks per Member</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {stats.totalMembers > 0 ? (stats.totalTasks / stats.totalMembers).toFixed(1) : 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Productivity Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {stats.completionRate > 0 ? Math.min(100, (stats.completionRate * 1.2).toFixed(0)) : 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Active Projects</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeProjects}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <>
          <div style={styles.chartsRow}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                <FiUsers size={18} />
                Team Members ({stats.totalMembers})
              </div>
              {stats.memberWorkload.map(member => (
                <div key={member.id} style={styles.memberItem}>
                  <div>
                    <div style={styles.memberName}>{member.name}</div>
                    <div style={styles.memberStats}>
                      {member.completed} completed · {member.inProgress} in progress · {member.pending} pending
                    </div>
                  </div>
                  <div style={{ width: '100px' }}>
                    <div style={styles.progressBar}>
                      <div style={{...styles.progressFill, width: member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0}}></div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666', textAlign: 'right' }}>
                      {member.tasks} tasks
                    </div>
                  </div>
                </div>
              ))}
              {stats.memberWorkload.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No team members yet</p>
              )}
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                <FiUserCheck size={18} />
                Workload Distribution
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.memberWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#999" />
                  <YAxis dataKey="name" type="category" stroke="#999" width={80} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#667eea" radius={[0,8,8,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>
              <FiStar size={18} />
              Team Leaders
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.memberWorkload.filter(m => m.completed > 0).slice(0, 3).map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>🏆</div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'white' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{member.completed} tasks completed</div>
                  </div>
                </div>
              ))}
              {stats.memberWorkload.filter(m => m.completed > 0).length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No completed tasks yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;