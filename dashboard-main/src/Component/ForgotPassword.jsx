// Add this to the top of affected files (Dashboard.jsx, etc.)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:3001/auth/forgot-password', {
        email // Envoie seulement l'email
      });
      
      setMessage("Un email de réinitialisation a été envoyé");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de l'email");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-form">
        <h2>Mot de passe oublié</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
            />
          </div>
          
          <button type="submit" className="btn">
            Envoyer le lien de réinitialisation
          </button>
        </form>
      </div>
    </>
  );
}