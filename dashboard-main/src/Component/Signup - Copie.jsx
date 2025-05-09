import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import ReCAPTCHA from 'react-google-recaptcha';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [recaptchaValue, setRecaptchaValue] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // const handleRecaptchaChange = (value) => {
  //   setRecaptchaValue(value);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des champs obligatoires
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    // Validation du format d'email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      setLoading(false);
      return;
    }

    // Validation du mot de passe
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    // Validation du numéro de téléphone si fourni
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      setError('Numéro de téléphone invalide. Format: +1234567890');
      setLoading(false);
      return;
    }

    // Validation reCAPTCHA (désactivée)
    // if (!recaptchaValue) {
    //   setError("Veuillez valider le reCAPTCHA");
    //   setLoading(false);
    //   return;
    // }

    try {
      const dataToSend = {
        ...formData,
        // recaptchaToken: recaptchaValue // Désactivé
      };

      const response = await axios.post(
        "http://localhost:3002/api/auth/register",
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate('/login');
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      let errorMsg = "Erreur lors de l'inscription";

      if (error.response) {
        errorMsg = error.response.data.message ||
                   error.response.data.error ||
                   errorMsg;
      } else if (error.request) {
        errorMsg = "Pas de réponse du serveur";
      }

      setError(errorMsg);
      console.error('Erreur complète:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Hero">
      <div className="Hero-text">
        <h1>Join Us Today</h1>
        <p>Sign up to get started with our amazing service</p>
      </div>
      <div className="wrapper">
        <div className="form-signup">
          <h2>Create Account</h2>
          {error && <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password * (min 6 caractères)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="input-box">
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone (ex: +1234567890)"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="\+?[0-9]{10,15}"
              />
              <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                Format: +1234567890 (optionnel)
              </small>
            </div>

            <div className="input-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
              >
                <option value="">Select Role *</option>
                <option value="Administrateur">Administrateur</option>
                <option value="Infirmier">Infirmier</option>
                <option value="Médecin">Médecin</option>
              </select>
            </div>

            {/* reCAPTCHA désactivé */}
            {/* <div style={{ margin: '20px 0' }}>
              <ReCAPTCHA
                sitekey="6LeBORorAAAAACjpyI4dIJWDmLitNRPnpSltxr5y"
                onChange={handleRecaptchaChange}
              />
            </div> */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#cccccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;