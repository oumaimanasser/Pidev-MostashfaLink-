import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserCRUD() {
  const [formData, setFormData] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    isBlocked: false
  });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Récupérer les utilisateurs
  const getUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/auth/all');
      setUsers(response.data.users);
    } catch (error) {
      console.error("Erreur de récupération", error);
    }
  };

  // Mettre à jour un utilisateur
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3002/api/auth/update/${formData._id}`, formData);
      getUsers();
      resetForm();
    } catch (error) {
      console.error("Erreur de mise à jour", error);
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

  // Bloquer/Débloquer un utilisateur
  const toggleBlock = async (id, currentStatus) => {
    if (window.confirm(`Voulez-vous vraiment ${currentStatus ? 'débloquer' : 'bloquer'} cet utilisateur ?`)) {
      try {
        await axios.patch(`http://localhost:3002/api/auth/toggle-block/${id}`, {
          isBlocked: !currentStatus
        });
        getUsers();
      } catch (error) {
        console.error("Erreur de blocage/déblocage", error);
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
    <div style={{
      maxWidth: '56rem',
      margin: '0 auto',
      padding: '1rem'
    }}>
      <h1 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '1rem'
      }}>Gestion Utilisateurs</h1>

      {/* Formulaire compact */}
      {isEditing && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>Modifier utilisateur</h2>
          <form onSubmit={handleUpdate} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              <input
                type="text"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                required
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>
            
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
              required
            />
            
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isBlocked"
                checked={formData.isBlocked}
                onChange={(e) => setFormData({...formData, isBlocked: e.target.checked})}
              />
              <label htmlFor="isBlocked">Bloquer cet utilisateur</label>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button 
                type="button" 
                onClick={resetForm}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.875rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '0.375rem'
                }}
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau compact */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontWeight: '500'
          }}>Liste des utilisateurs</h2>
          <button 
            onClick={getUsers}
            style={{
              fontSize: '0.875rem',
              color: '#3b82f6'
            }}
          >
            Actualiser
          </button>
        </div>
        
        <table style={{
          width: '100%',
          fontSize: '0.875rem'
        }}>
          <thead style={{
            backgroundColor: '#f3f4f6'
          }}>
            <tr>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nom</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Rôle</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Statut</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{
                borderBottom: '1px solid #e5e7eb'
              }}>
                <td style={{ padding: '0.5rem' }}>{user.firstName} {user.lastName}</td>
                <td style={{ padding: '0.5rem', color: '#4b5563' }}>{user.email}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    ...(user.role === 'admin' 
                      ? { backgroundColor: '#f3e8ff', color: '#6b21a8' }
                      : { backgroundColor: '#dcfce7', color: '#166534' })
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    ...(user.isBlocked
                      ? { backgroundColor: '#fee2e2', color: '#b91c1c' }
                      : { backgroundColor: '#ecfdf5', color: '#065f46' })
                  }}>
                    {user.isBlocked ? 'Bloqué' : 'Actif'}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        color: '#3b82f6',
                        fontSize: '0.75rem',
                        padding: '0.25rem'
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleBlock(user._id, user.isBlocked)}
                      style={{
                        color: user.isBlocked ? '#16a34a' : '#d97706',
                        fontSize: '0.75rem',
                        padding: '0.25rem'
                      }}
                    >
                      {user.isBlocked ? 'Débloquer' : 'Bloquer'}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      style={{
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        padding: '0.25rem'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserCRUD;