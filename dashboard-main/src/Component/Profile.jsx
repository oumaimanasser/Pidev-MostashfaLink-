import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3002/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

   const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3002/api/auth/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Mettre à jour l'état avec la nouvelle URL complète
      setUser({
        ...response.data.user,
        profileImageUrl: response.data.user.profileImageUrl // Utiliser l'URL complète renvoyée par le serveur
      });
      
      alert("Photo de profil mise à jour avec succès!");
    } catch (error) {
      console.error("Erreur upload:", error.response?.data || error.message);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(251, 192, 192, 0.1)'
    },
    title: {
      color: '#333',
      textAlign: 'center',
      marginBottom: '30px'
    },
    imageSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '30px'
    },
    profileImage: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid rgb(247, 117, 208)',
      marginBottom: '20px'
    },
    placeholder: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      backgroundColor: '#d1e0e6',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '60px',
      border: '3px solid #6e2b5a',
      marginBottom: '20px'
    },
    uploadSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      width: '100%',
      maxWidth: '300px'
    },
    fileInput: {
      width: '100%',
      marginBottom: '10px'
    },
    uploadButton: {
      padding: '10px 20px',
      backgroundColor: '#6e2b5a',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
      width: '100%',
      ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
      },
      ':hover:not(:disabled)': {
        backgroundColor: '#8a3a6e'
      }
    },
    info: {
      backgroundColor: '#ff85a5',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    infoItem: {
      marginBottom: '15px',
      fontSize: '16px'
    },
    backButton: {
      padding: '10px 20px',
      backgroundColor: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
      ':hover': {
        backgroundColor: '#555'
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Chargement...</div>;
  if (!user) return <div style={{ textAlign: 'center', padding: '20px' }}>Utilisateur non trouvé</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profil Utilisateur</h2>
      
      <div style={styles.imageSection}>
       {user.profileImageUrl ? (
    <img 
      src={user.profileImageUrl} // Utiliser directement l'URL complète
      alt="Profile" 
      style={styles.profileImage}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2QxZTBhNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmUyYjVhIiBmb250LXNpemU9IjYwIj57dXNlci5nZW5kZXIgPT09ICdmZW1hbGUnID8gJ8OQbicgOiAnw5BqJ308L3RleHQ+PC9zdmc+';
      }}
    />
  ) : (
    <div style={styles.placeholder}>
      {user.gender === 'female' ? '👩' : '👨'}
    </div>
  )}
        
        <div style={styles.uploadSection}>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="image/*"
            style={styles.fileInput}
            id="profileImageInput"
          />
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            style={{
              ...styles.uploadButton,
              ...(!file || uploading ? styles.uploadButton[':disabled'] : {}),
              ...(uploading ? { opacity: 0.7 } : {})
            }}
          >
            {uploading ? 'Téléchargement...' : 'Télécharger votre image'}
          </button>
          {file && (
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              Fichier sélectionné: {file.name}
            </div>
          )}
        </div>
      </div>

      <div style={styles.info}>
        <p style={styles.infoItem}><strong>Nom:</strong> {user.firstName} {user.lastName}</p>
        <p style={styles.infoItem}><strong>Email:</strong> {user.email}</p>
        <p style={styles.infoItem}><strong>Rôle:</strong> {user.role}</p>
      </div>

      <button 
        onClick={() => navigate('/dashboard')}
        style={styles.backButton}
      >
        Retour au tableau de bord
      </button>
    </div>
  );
};

export default Profile;