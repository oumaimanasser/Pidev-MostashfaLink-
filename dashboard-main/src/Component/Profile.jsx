import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
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
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

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
      
      setUser(response.data.user);
      alert("Photo de profil mise à jour avec succès!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erreur lors du téléchargement de l'image");
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
      gap: '10px'
    },
    fileInput: {
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
      ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
      }
    },
    info: {
      backgroundColor:'#ff85a5',
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

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Utilisateur non trouvé</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profil Utilisateur</h2>
      
      <div style={styles.imageSection}>
        {user.profileImage ? (
          <img 
            src={`http://localhost:3002/uploads/${user.profileImage}`} 
            alt="Profile" 
            style={styles.profileImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
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
          />
          <button 
            onClick={handleUpload} 
            disabled={!file}
            style={{
              ...styles.uploadButton,
              ...(!file ? styles.uploadButton[':disabled'] : {})
            }}
          >
            Télécharger votre image
          </button>
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