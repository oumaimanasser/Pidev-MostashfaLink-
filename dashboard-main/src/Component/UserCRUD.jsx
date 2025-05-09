import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';


function UserCRUD() {
  const navigate = useNavigate(); // Ajoutez ce hook

  const [formData, setFormData] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
   
  });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState([]); // Add stats state

  // Styles améliorés
  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0',
      padding: '0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#F0EDEF',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebar: {
      width: '250px',
      backgroundColor: '#F0EDEF',
      color: 'black',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '1.5rem 0',
      boxShadow: '2px 0 5px rgba(240, 220, 220, 0.99)',
      zIndex: 10,
    },
    sidebarHeader: {
      padding: '0 1.5rem 1.5rem',
      borderBottom: '1px solid rgba(255, 170, 147, 0.26)',
      marginBottom: '1.5rem',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'pink',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    navigation: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    navItem: {
      margin: '0.25rem 0',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      color: 'rgba(255, 145, 187, 0.7)',
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      fontSize: '0.875rem',
      gap: '0.75rem',
      cursor: 'pointer',
    },
    navLinkActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      borderLeft: '3px solid #4f46e5',
    },
    mainContent: {
      marginLeft: '250px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      backgroundColor: 'white',
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    pageTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0,
      color: '#111827',
    },
    profileSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.25rem',
      color: '#6b7280',
      border: '2px solid #e5e7eb',
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    userName: {
      fontWeight: '600',
      fontSize: '0.875rem',
      color: '#111827',
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#6b7280',
    },
    contentContainer: {
      padding: '2rem',
      backgroundColor: '#f9fafb',
      flex: 1,
    },
    contentBox: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#111827',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    formContainer: {
      backgroundColor: '#f9fafb',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      marginBottom: '2rem',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    formTitle: {
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#4b5563',
      fontSize: '1.1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    input: {
      padding: '0.625rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      transition: 'border-color 0.15s ease-in-out',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    select: {
      padding: '0.625rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      backgroundColor: '#fff',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    buttonContainer: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      marginTop: '0.5rem',
    },
    cancelButton: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },
    saveButton: {
      padding: '0.5rem 1.25rem',
      fontSize: '0.875rem',
      backgroundColor: '#4f46e5',
      color: 'white',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      fontWeight: '500',
    },
    dashboardTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#111827',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid rgb(234, 187, 209)',
    },
    chartContainer: {
      width: '100%',
      height: 350,
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#fff',
      borderRadius: '0.75rem',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f3f4f6',
    },
    table: {
      width: '100%',
      fontSize: '0.875rem',
      borderCollapse: 'separate',
      borderSpacing: '0',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    },
    tableHead: {
      backgroundColor: '#f8fafc',
    },
    tableHeaderCell: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#4b5563',
      borderBottom: '2px solid #e5e7eb',
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
    },
    tableCell: {
      padding: '0.75rem 1rem',
      color: '#374151',
    },
    badge: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      borderRadius: '9999px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    adminBadge: {
      backgroundColor: '#ede9fe',
      color: '#6d28d9',
    },
    userBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    activeBadge: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    blockedBadge: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
    },
    actionButton: {
      fontSize: '0.75rem',
      padding: '0.375rem 0.5rem',
      borderRadius: '0.375rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      border: 'none',
    },
    editButton: {
      color: '#3b82f6',
      backgroundColor: '#eff6ff',
    },
    deleteButton: {
      color: '#ef4444',
      backgroundColor: '#fef2f2',
    },
    blockButton: {
      color: '#d97706',
      backgroundColor: '#fffbeb',
    },
    unblockButton: {
      color: '#16a34a',
      backgroundColor: '#f0fdf4',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    checkbox: {
      accentColor: '#4f46e5',
      width: '1rem',
      height: '1rem',
    },
  };

  // Simuler une redirection
  const handleNavigation = (path) => {
    navigate(path); // Cela naviguera réellement vers la route
  }
  const getUsers = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get('http://localhost:3002/api/auth/all'),
        axios.get('http://localhost:3002/api/auth/stats') // Add stats endpoint
      ]);
      setUsers(usersResponse.data.users);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error("Erreur de récupération", error);
    }
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:3002/api/auth/update/${formData._id}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Réponse serveur:', response.data);
      getUsers();
      resetForm();
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      alert(`Erreur de mise à jour: ${error.response?.data?.message || error.message}`);
    }
  };
  
  const toggleBlock = async (userId, currentStatus) => {
    if (window.confirm(`Voulez-vous vraiment ${currentStatus ? 'débloquer' : 'bloquer'} cet utilisateur ?`)) {
      try {
        const response = await axios.patch(
          `http://localhost:3002/api/auth/toggle-block/${userId}`
        );
        
        if (response.data.success) {
          setUsers(users.map(user => 
            user._id === userId 
              ? { ...user, isBlocked: response.data.isBlocked } 
              : user
          ));
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la modification du statut");
      }
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      try {
        await axios.delete(`http://localhost:3002/api/auth/delete/${id}`);
        getUsers();
      } catch (error) {
        console.error("Erreur de suppression", error);
      }
    }
  };
 
  // Pré-remplir le formulaire
  const handleEdit = (user) => {
    setFormData(user);
    setIsEditing(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      _id: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      isBlocked: false
    });
    setIsEditing(false);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div style={styles.container}>
      {/* Sidebar / Menu de navigation */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <span>🚀</span>
            <span>Admin Portal</span>
          </div>
        </div>
        
        <ul style={styles.navigation}>
          <li style={styles.navItem}>
            <div 
              style={{...styles.navLink, ...styles.navLinkActive}} 
              onClick={() => handleNavigation('/dashboard')}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </div>
          </li>
          <li style={styles.navItem}>
            <div 
              style={styles.navLink} 
              onClick={() => handleNavigation('/users')}
            >
              <span>👥</span>
              <span>Utilisateurs</span>
            </div>
          </li>
          <li style={styles.navItem}>
            <div 
              style={styles.navLink} 
              onClick={() => handleNavigation('/settings')}
            >
              <span>⚙️</span>
              <span>Paramètres</span>
            </div>
          </li>
          <li style={styles.navItem}>
            <div 
              style={styles.navLink} 
              onClick={() => handleNavigation('/profile')}
            >
              <span>👤</span>
              <span>Mon profil</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Top Header Bar */}
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>Gestion des utilisateurs</h1>
          
          <div style={styles.profileSection}>
            <div style={{fontSize: '1.25rem', cursor: 'pointer'}}>🔔</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
              <div style={styles.avatar}>
                👤
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>Admin</div>
                <div style={styles.userRole}>Administrateur</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.contentContainer}>
          <div style={styles.contentBox}>
            {/* Formulaire d'édition */}
            {isEditing && (
              <div style={styles.formContainer}>
                <h2 style={styles.formTitle}>Modifier utilisateur</h2>
                <form onSubmit={handleUpdate} style={styles.form}>
                  <div style={styles.inputGrid}>
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      style={styles.input}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nom"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                    required
                  />

                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={styles.select}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>

                  <div style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="isBlocked"
                      checked={formData.isBlocked}
                      onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                      style={styles.checkbox}
                    />
                    <label htmlFor="isBlocked">Bloquer cet utilisateur</label>
                  </div>

                  <div style={styles.buttonContainer}>
                    <button 
                      type="button" 
                      onClick={resetForm}
                      style={styles.cancelButton}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      style={styles.saveButton}
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Statistiques et tableau de données */}
            <div>
              <div style={styles.sectionHeader}>
                <h2 style={{margin: 0}}>Tableau de bord Admin</h2>
              </div>
              
              {stats.length > 0 && (
                <div style={styles.chartContainer}>
                  <ResponsiveContainer>
                    <BarChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 2px 5px rgba(239, 218, 218, 0.1)'
                        }} 
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="count" fill="#8884d8" name="Utilisateurs totaux" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="blocked" fill="#DA70D6" name="Utilisateurs bloqués" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Nom</th>
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCell}>Rôle</th>
                    <th style={styles.tableHeaderCell}>Statut</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} style={{
                      ...styles.tableRow,
                      backgroundColor: user.isBlocked ? '#fef2f2' : undefined
                    }}>
                      <td style={styles.tableCell}><strong>{user.firstName} {user.lastName}</strong></td>
                      <td style={{...styles.tableCell, color: '#6b7280'}}>{user.email}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          ...(user.role === 'admin' ? styles.adminBadge : styles.userBadge)
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          ...(user.isBlocked ? styles.blockedBadge : styles.activeBadge)
                        }}>
                          {user.isBlocked ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleEdit(user)} 
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            Modifier
                          </button>
                        
                          <button 
                            onClick={() => handleDelete(user._id)} 
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            Supprimer
                          </button>
                          <button 
                            onClick={() => toggleBlock(user._id, user.isBlocked)}
                            style={{
                              ...styles.actionButton,
                              ...(user.isBlocked ? styles.unblockButton : styles.blockButton)
                            }}
                          >
                            {user.isBlocked ? 'Débloquer' : 'Bloquer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCRUD;