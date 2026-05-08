import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiX, FiUsers, FiPlus, FiEdit2, FiTrash2, 
  FiStar, FiUserCheck, FiChevronDown, FiLoader
} from 'react-icons/fi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_id: '',
    members: []
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchTasks(); 
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch members and leader details for each project
      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project) => {
          // Fetch members
          const { data: members } = await supabase
            .from('project_members')
            .select('user_id')
            .eq('project_id', project.id);
          
          // Get member names
          const memberNames = await Promise.all(
            (members || []).map(async (member) => {
              const { data: userData } = await supabase
                .from('user_profiles')
                .select('name, role')
                .eq('id', member.user_id)
                .single();
              return { id: member.user_id, name: userData?.name || 'Unknown', role: userData?.role };
            })
          );
          
          // Get leader name
          let leaderName = 'None assigned';
          let leaderRole = '';
          if (project.leader_id) {
            const { data: leaderData } = await supabase
              .from('user_profiles')
              .select('name, role')
              .eq('id', project.leader_id)
              .single();
            leaderName = leaderData?.name || 'Unknown';
            leaderRole = leaderData?.role || '';
          }
          
          // Get owner name
          const { data: owner } = await supabase
            .from('user_profiles')
            .select('name')
            .eq('id', project.owner_id)
            .single();
          
          return {
            ...project,
            members: members || [],
            memberDetails: memberNames,
            leaderName: leaderName,
            leaderRole: leaderRole,
            ownerName: owner?.name || 'Unknown'
          };
        })
      );
      
      setProjects(projectsWithDetails);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  const fetchTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, status, project_id');
    
    if (error) throw error;
    setTasks(data || []);
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);
    
    try {
      let projectId;
      
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            description: formData.description,
            leader_id: formData.leader_id || null,
            updated_at: new Date()
          })
          .eq('id', editingProject.id);
        
        if (error) throw error;
        projectId = editingProject.id;
        toast.success('Project updated successfully');
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            name: formData.name,
            description: formData.description,
            owner_id: user?.id,
            leader_id: formData.leader_id || null
          }])
          .select();
        
        if (error) throw error;
        projectId = data[0].id;
        toast.success('Project created successfully');
      }

      // Handle members for new project only
      if (!editingProject && formData.members.length > 0) {
        const memberInserts = formData.members.map(memberId => ({
          project_id: projectId,
          user_id: memberId
        }));
        
        const { error } = await supabase
          .from('project_members')
          .insert(memberInserts);
        
        if (error) console.error('Error adding members:', error);
      }
      
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all tasks in this project.')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      leader_id: project.leader_id || '',
      members: project.members?.map(m => m.user_id) || []
    });
    setShowModal(true);
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      leader_id: '',
      members: []
    });
    setEditingProject(null);
    setSearchTerm('');
  };

  // Filter users for member selection (exclude current user and already selected)
  const availableUsers = users.filter(u => 
    u.id !== user?.id && 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add this function to calculate project progress
const calculateProjectProgress = (projectId) => {
  const projectTasks = tasks.filter(t => t.project_id === projectId);
  if (projectTasks.length === 0) return { percentage: 0, completed: 0, total: 0, inProgress: 0, pending: 0 };
  
  const completed = projectTasks.filter(t => t.status === 'completed').length;
  const inProgress = projectTasks.filter(t => t.status === 'in_progress').length;
  const pending = projectTasks.filter(t => t.status === 'pending' || t.status === 'accepted').length;
  
  return {
    percentage: (completed / projectTasks.length) * 100,
    completed,
    inProgress,
    pending,
    total: projectTasks.length
  };
};

  // Get admin users only for leader selection
  const adminUsers = users.filter(u => u.role === 'admin');

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
      transition: 'transform 0.2s',
      zIndex: 100,
    },
    projectGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '1.5rem',
    },
    projectCard: {
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      transition: 'transform 0.2s',
    },
    projectName: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'white',
      marginBottom: '0.5rem',
    },
    projectDescription: {
      color: '#ccc',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      lineHeight: 1.5,
    },
    leaderSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      padding: '0.5rem',
      background: 'rgba(102,126,234,0.1)',
      borderRadius: '8px',
    },
    leaderIcon: {
      color: '#f59e0b',
    },
    leaderText: {
      fontSize: '0.75rem',
      color: '#f59e0b',
    },
    membersSection: {
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    },
    membersTitle: {
      fontSize: '0.7rem',
      color: '#999',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
    },
    memberTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    memberTag: {
      background: 'rgba(255,255,255,0.1)',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      color: '#ccc',
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    editButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(245,158,11,0.2)',
      color: '#f59e0b',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
    },
    deleteButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(239,68,68,0.2)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
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
    modalTitle: {
      fontSize: '1.5rem',
      color: 'white',
      marginBottom: '0.5rem',
    },
    modalSubtitle: {
      color: '#999',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
    },
    inputGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#e0e0e0',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      minHeight: '100px',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      marginBottom: '1rem',
    },
    searchInput: {
      flex: 1,
      background: 'none',
      border: 'none',
      color: 'white',
      outline: 'none',
    },
    membersList: {
      maxHeight: '150px',
      overflowY: 'auto',
      marginBottom: '1rem',
    },
    memberItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    memberCheckbox: {
      marginRight: '0.75rem',
    },
    selectedMembersSection: {
      padding: '1rem',
      background: 'rgba(102,126,234,0.1)',
      borderRadius: '10px',
      marginBottom: '1rem',
    },
    selectedMemberTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    selectedTag: {
      background: 'rgba(102,126,234,0.3)',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      color: '#667eea',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    },
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
    emptyState: {
      textAlign: 'center',
      padding: '4rem',
      color: '#999',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
  };

  if (loading && projects.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <FiLoader size={40} color="#667eea" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Projects</h1>
        <p style={styles.subtitle}>Manage and organize your team's projects</p>
      </div>

      <div style={styles.projectGrid}>
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <FiUsers size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No projects yet. Click the + button to create your first project!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <h3 style={styles.projectName}>{project.name}</h3>
              <p style={styles.projectDescription}>{project.description || 'No description provided'}</p>
              
              {/* Team Leader Display */}
              <div style={styles.leaderSection}>
                <FiStar style={styles.leaderIcon} size={14} />
                <span style={styles.leaderText}>
                  Team Leader: {project.leaderName} {project.leaderRole === 'admin' && '(Admin)'}
                </span>
              </div>
              
              <div style={styles.membersSection}>
                <div style={styles.membersTitle}>Team Members ({project.memberDetails?.length || 0})</div>
                <div style={styles.memberTags}>
                  {project.memberDetails?.slice(0, 4).map((member, idx) => (
                    <span key={idx} style={styles.memberTag}>{member.name}</span>
                  ))}
                  {project.memberDetails?.length > 4 && (
                    <span style={styles.memberTag}>+{project.memberDetails.length - 4} more</span>
                  )}
                  {project.memberDetails?.length === 0 && (
                    <span style={styles.memberTag}>No members added yet</span>
                  )}
                </div>
                
              </div>
            {(() => {
            const progress = calculateProjectProgress(project.id);
            return (
                <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#999' }}>Project Progress</span>
                    <span style={{ fontSize: '0.7rem', color: '#667eea' }}>{progress.percentage.toFixed(0)}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress.percentage}%`, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.65rem', color: '#666' }}>
                    <span>✅ {progress.completed} completed</span>
                    <span>🔄 {progress.inProgress} in progress</span>
                    <span>⏳ {progress.pending} pending</span>
                </div>
                </div>
            );
            })()}
              
              
              {user?.role === 'admin' && (
                <div style={styles.buttonGroup}>
                  <button style={styles.editButton} onClick={() => handleEdit(project)}>
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(project.id)}>
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {user?.role === 'admin' && (
        <button 
          style={styles.addButton}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <FiPlus size={24} />
        </button>
      )}

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p style={styles.modalSubtitle}>
              {editingProject ? 'Update project details' : 'Fill in the details to create a new project'}
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Website Redesign, Mobile App Development"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  placeholder="Describe the project goals and objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              {/* Team Leader Selection - Only Admins */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FiStar style={{ marginRight: '0.25rem' }} />
                  Team Leader (Admin only)
                </label>
                <select
                  value={formData.leader_id}
                  onChange={(e) => setFormData({...formData, leader_id: e.target.value})}
                  style={styles.select}
                >
                  <option value="">Select Team Leader</option>
                  {adminUsers.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} {admin.id === user?.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
                  Team leaders can manage project settings and approve tasks
                </p>
              </div>

              {/* Team Members Selection */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <FiUsers style={{ marginRight: '0.25rem' }} />
                  Team Members
                </label>
                
                <div style={styles.searchBox}>
                  <FiSearch size={14} color="#999" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.membersList}>
                  {availableUsers.map(member => (
                    <div
                      key={member.id}
                      style={styles.memberItem}
                      onClick={() => toggleMember(member.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.members.includes(member.id)}
                        onChange={() => {}}
                        style={styles.memberCheckbox}
                      />
                      <div style={{ flex: 1 }}>
                        <div>{member.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#999' }}>{member.role}</div>
                      </div>
                    </div>
                  ))}
                  {availableUsers.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>
                      No other users found
                    </p>
                  )}
                </div>

                {formData.members.length > 0 && (
                  <div style={styles.selectedMembersSection}>
                    <div>Selected Members ({formData.members.length})</div>
                    <div style={styles.selectedMemberTags}>
                      {formData.members.map(memberId => {
                        const member = users.find(u => u.id === memberId);
                        return member ? (
                          <div key={memberId} style={styles.selectedTag}>
                            {member.name}
                            <FiX
                              size={12}
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMember(memberId);
                              }}
                            />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitButton}>
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button type="button" style={styles.cancelButton} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Projects;