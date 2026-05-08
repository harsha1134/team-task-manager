import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiSearch, FiFilter, FiCalendar, FiUser, FiFlag, 
  FiClock, FiCheckCircle, FiCircle, FiTrendingUp, FiX,
  FiEdit2, FiTrash2, FiChevronDown, FiStar, FiAlertCircle,
  FiClipboard, FiPlay, FiCheck, FiSend, FiRefreshCw
} from 'react-icons/fi';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    status: 'pending'
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      const tasksWithDetails = await Promise.all(
        (data || []).map(async (task) => {
          const [projectRes, assignedUserRes] = await Promise.all([
            supabase.from('projects').select('name, leader_id').eq('id', task.project_id).single(),
            supabase.from('user_profiles').select('name, role').eq('id', task.assigned_to).single()
          ]);
          
          return {
            ...task,
            project_name: projectRes.data?.name || 'Unknown',
            project_leader: projectRes.data?.leader_id,
            assigned_to_name: assignedUserRes.data?.name || 'Unassigned',
            assigned_to_role: assignedUserRes.data?.role
          };
        })
      );
      
      setTasks(tasksWithDetails);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, leader_id');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, role');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            project_id: formData.project_id,
            assigned_to: formData.assigned_to,
            due_date: formData.due_date,
            priority: formData.priority,
            status: 'pending',
            updated_at: new Date()
          })
          .eq('id', editingTask.id);
        
        if (error) throw error;
        toast.success('Task updated successfully');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{
            title: formData.title,
            description: formData.description,
            project_id: formData.project_id,
            assigned_to: formData.assigned_to,
            assigned_by: user?.id,
            due_date: formData.due_date,
            priority: formData.priority,
            status: 'pending'
          }]);
        
        if (error) throw error;
        toast.success('Task created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Member accepts and starts the task
  const handleAcceptTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'accepted',
          accepted_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', taskId);
      
      if (error) throw error;
      toast.success('Task accepted! You can now start working on it.');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to accept task');
    }
  };

  // Member starts working on the task
  const handleStartTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress',
          started_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', taskId);
      
      if (error) throw error;
      toast.success('Task started! Good luck! 🚀');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to start task');
    }
  };

  // Member completes the task
  const handleCompleteTask = async (taskId) => {
    if (!window.confirm('Mark this task as completed?')) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', taskId);
      
      if (error) throw error;
      toast.success('Task completed! Great job! 🎉');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to complete task');
    }
  };

  // Admin reassigns task
  const handleReassignTask = async (taskId, newAssigneeId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assigned_to: newAssigneeId,
          status: 'pending',
          started_at: null,
          accepted_at: null,
          completed_at: null,
          updated_at: new Date()
        })
        .eq('id', taskId);
      
      if (error) throw error;
      toast.success('Task reassigned successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to reassign task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      assigned_to: '',
      due_date: '',
      priority: 'medium',
      status: 'pending'
    });
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id,
      assigned_to: task.assigned_to,
      due_date: task.due_date,
      priority: task.priority || 'medium',
      status: task.status
    });
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#999';
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending', color: '#ef4444', icon: <FiCircle size={14} />, action: 'Accept' },
      accepted: { label: 'Accepted', color: '#8b5cf6', icon: <FiCheck size={14} />, action: 'Start' },
      in_progress: { label: 'In Progress', color: '#f59e0b', icon: <FiPlay size={14} />, action: 'Complete' },
      completed: { label: 'Completed', color: '#10b981', icon: <FiCheckCircle size={14} />, action: 'Done' },
      rejected: { label: 'Rejected', color: '#ef4444', icon: <FiX size={14} />, action: 'Reassigned' }
    };
    return configs[status] || configs.pending;
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.project_id === filterProject;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    accepted: tasks.filter(t => t.status === 'accepted').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.due_date, t.status)).length,
  };

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      background: '#0a0a0a',
      minHeight: '100vh',
    },
    header: { marginBottom: '2rem' },
    title: {
      fontSize: '2rem',
      background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    subtitle: { color: '#999', marginTop: '0.25rem' },
    statsBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
    },
    statValue: { fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' },
    statLabel: { fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' },
    filtersBar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    searchBox: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
    },
    searchInput: {
      flex: 1,
      background: 'none',
      border: 'none',
      color: 'white',
      outline: 'none',
    },
    filterSelect: {
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: 'white',
      cursor: 'pointer',
    },
    taskGrid: {
      display: 'grid',
      gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr',
      gap: '1rem',
    },
    taskCard: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1.25rem',
      position: 'relative',
    },
    taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
    taskTitle: { fontSize: '1rem', fontWeight: 600, color: 'white' },
    priorityBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.2rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
    },
    taskMeta: { display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.7rem', color: '#999', flexWrap: 'wrap' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
    statusButton: {
      width: '100%',
      padding: '0.5rem',
      marginTop: '0.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    actionButtons: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' },
    smallButton: {
      padding: '0.3rem 0.6rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '6px',
      color: '#999',
      cursor: 'pointer',
      fontSize: '0.7rem',
    },
    overdueBadge: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'rgba(239,68,68,0.2)',
      color: '#ef4444',
      padding: '0.2rem 0.5rem',
      borderRadius: '20px',
      fontSize: '0.6rem',
    },
    addButton: {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
      zIndex: 100,
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '2rem',
      width: '90%',
      maxWidth: '550px',
      maxHeight: '85vh',
      overflowY: 'auto',
    },
    modalTitle: { fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' },
    modalSubtitle: { color: '#999', marginBottom: '1.5rem', fontSize: '0.875rem' },
    inputGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#e0e0e0', fontSize: '0.875rem' },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      minHeight: '100px',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    modalButtons: { display: 'flex', gap: '1rem', marginTop: '1rem' },
    submitButton: {
      flex: 1,
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    cancelButton: {
      flex: 1,
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      cursor: 'pointer',
    },
    emptyState: { textAlign: 'center', padding: '4rem', color: '#999' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tasks</h1>
        <p style={styles.subtitle}>Accept, start, and complete your assigned tasks</p>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.total}</div><div style={styles.statLabel}>Total</div></div>
        <div style={styles.statCard}><div style={{...styles.statValue, color: '#ef4444'}}>{stats.pending}</div><div style={styles.statLabel}>Pending</div></div>
        <div style={styles.statCard}><div style={{...styles.statValue, color: '#8b5cf6'}}>{stats.accepted}</div><div style={styles.statLabel}>Accepted</div></div>
        <div style={styles.statCard}><div style={{...styles.statValue, color: '#f59e0b'}}>{stats.inProgress}</div><div style={styles.statLabel}>In Progress</div></div>
        <div style={styles.statCard}><div style={{...styles.statValue, color: '#10b981'}}>{stats.completed}</div><div style={styles.statLabel}>Completed</div></div>
        <div style={styles.statCard}><div style={{...styles.statValue, color: '#ef4444'}}>{stats.overdue}</div><div style={styles.statLabel}>Overdue</div></div>
      </div>

      {/* Filters */}
      <div style={styles.filtersBar}>
        <div style={styles.searchBox}>
          <FiSearch size={14} color="#999" />
          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Tasks List */}
      <div style={styles.taskGrid}>
        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}><p>No tasks found. Create your first task!</p></div>
        ) : (
          filteredTasks.map(task => {
            const statusConfig = getStatusConfig(task.status);
            const canAccept = task.assigned_to === user?.id && task.status === 'pending';
            const canStart = task.assigned_to === user?.id && task.status === 'accepted';
            const canComplete = task.assigned_to === user?.id && task.status === 'in_progress';
            const isAdmin = user?.role === 'admin';
            
            return (
              <div key={task.id} style={styles.taskCard}>
                {isOverdue(task.due_date, task.status) && <div style={styles.overdueBadge}>⚠️ Overdue</div>}
                
                <div style={styles.taskHeader}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <span style={{...styles.priorityBadge, background: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority)}}>
                    <FiFlag size={10} /> {task.priority?.toUpperCase()}
                  </span>
                </div>
                
                <p style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  {task.description?.substring(0, 100)}{task.description?.length > 100 ? '...' : ''}
                </p>
                
                <div style={styles.taskMeta}>
                  <div style={styles.metaItem}><FiClipboard size={12} /> {task.project_name}</div>
                  <div style={styles.metaItem}><FiUser size={12} /> {task.assigned_to_name}</div>
                  <div style={styles.metaItem}><FiCalendar size={12} /> {new Date(task.due_date).toLocaleDateString()}</div>
                  <div style={{...styles.metaItem, color: statusConfig.color}}>{statusConfig.icon} {statusConfig.label}</div>
                </div>

                {/* Member Actions - Accept/Start/Complete Flow */}
                {canAccept && (
                  <button style={{...styles.statusButton, background: '#8b5cf6', color: 'white'}} onClick={() => handleAcceptTask(task.id)}>
                    <FiCheck size={14} /> Accept Task
                  </button>
                )}
                
                {canStart && (
                  <button style={{...styles.statusButton, background: '#f59e0b', color: 'white'}} onClick={() => handleStartTask(task.id)}>
                    <FiPlay size={14} /> Start Working
                  </button>
                )}
                
                {canComplete && (
                  <button style={{...styles.statusButton, background: '#10b981', color: 'white'}} onClick={() => handleCompleteTask(task.id)}>
                    <FiCheckCircle size={14} /> Mark Complete
                  </button>
                )}

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={styles.actionButtons}>
                    <button style={styles.smallButton} onClick={() => handleEdit(task)}><FiEdit2 size={12} /> Edit</button>
                    <button style={styles.smallButton} onClick={() => handleDelete(task.id)}><FiTrash2 size={12} /> Delete</button>
                    {task.status !== 'completed' && (
                      <select style={styles.smallButton} onChange={(e) => handleReassignTask(task.id, e.target.value)} value="">
                        <option value="">Reassign to...</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {user?.role === 'admin' && (
        <button style={styles.addButton} onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus size={24} />
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Task Title *</label>
                <input type="text" placeholder="Enter task title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea placeholder="Describe the task..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.textarea} />
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Project</label>
                  <select value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} required style={styles.select}>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} required style={styles.select}>
                    <option value="">Select Member</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={styles.select}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitButton}>{editingTask ? 'Update' : 'Create'}</button>
                <button type="button" style={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;