import React, { useState } from 'react';
import axios from 'axios';
import 'font-awesome/css/font-awesome.min.css';

function Sentiment() {
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyser = async () => {
    try {
      const response = await axios.post(
       ' http://localhost:5000/api/analyse-sentiment',
        {
          text: textInput,  // Texte à analyser
        }
      );
      setResult(response.data);  // Mise à jour des résultats
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      const errorMessage = err.response?.data?.message || "Erreur de communication avec le serveur";
      setError(errorMessage);  // Message d'erreur
      setResult(null);
    }
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'very positive': return 'bg-success text-white';
      case 'positive': return 'bg-success bg-opacity-75 text-white';
      case 'neutral': return 'bg-warning text-dark';
      case 'negative': return 'bg-danger bg-opacity-75 text-white';
      case 'very negative': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'very positive': return 'fas fa-grin-stars';
      case 'positive': return 'fas fa-smile';
      case 'neutral': return 'fas fa-meh';
      case 'negative': return 'fas fa-frown';
      case 'very negative': return 'fas fa-angry';
      default: return 'fas fa-question-circle';
    }
  };

  const getStarRating = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'very positive': return 5;  // 5 étoiles pour très positif
      case 'positive': return 4;      // 4 étoiles pour positif
      case 'neutral': return 3;       // 3 étoiles pour neutre
      case 'negative': return 2;      // 2 étoiles pour négatif
      case 'very negative': return 1; // 1 étoile pour très négatif
      default: return 0;              // Aucun pour sentiment inconnu
    }
  };

  const getProgressBarClass = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'very positive': return 'bg-success';
      case 'positive': return 'bg-success';
      case 'neutral': return 'bg-warning';
      case 'negative': return 'bg-danger';
      case 'very negative': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <>
      <div style={{ padding: '50px 0', background: '#e8f0fe', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#777' }}>Real-time text analysis</p>
        <h1 style={{ fontSize: '36px', fontWeight: '600' }}>Sentiment Analysis</h1>
      </div>

      <div style={{ padding: '50px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ flex: 2 }}>
              <h2>Analyze customer reviews</h2>
              <p>Our sentiment analysis tool uses AI to determine the dominant emotion in your text.</p>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <textarea
                  style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '8px', boxSizing: 'border-box', marginBottom: '15px' }}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter your text to analyze..."
                  rows="5"
                />
                <button
                  onClick={analyser}
                  style={{
                    backgroundColor: '#007bff',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '100%'
                  }}
                >
                  Analyze
                </button>
              </div>

              {error && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              {result && (
                <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <i className="fas fa-chart-pie"></i> Analysis Results
                  </h3>

                  <div style={{ marginBottom: '20px' }}>
                    <strong>Analyzed text:</strong>
                    <p style={{ fontStyle: 'italic' }}>&quot;{result.text}&quot;</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <strong>Sentiment:</strong>
                    <span className={`sentiment-badge ${getSentimentClass(result.sentiment)}`} style={{ padding: '5px 15px', borderRadius: '25px', fontWeight: '700' }}>
                      <i className={`${getSentimentIcon(result.sentiment)} me-1`} style={{ fontSize: '18px' }}></i>
                      {result.sentiment}
                    </span>
                  </div>

                  {/* Affichage des étoiles */}
                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <strong>Rating:</strong>
                    <div>
                      {Array.from({ length: getStarRating(result.sentiment) }).map((_, index) => (
                        <i key={index} className="fa fa-star" style={{ color: '#ffd700', fontSize: '24px' }}></i>
                      ))}
                      {Array.from({ length: 5 - getStarRating(result.sentiment) }).map((_, index) => (
                        <i key={index + 5} className="fa fa-star-o" style={{ color: '#ffd700', fontSize: '24px' }}></i>
                      ))}
                    </div>
                  </div>

                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sentiment;
