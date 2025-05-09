import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const TextToSpeech = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    
    // Configurer la voix (vous pouvez laisser l'utilisateur choisir)
    const voices = synth.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.includes('fr'));
    if (frenchVoice) {
      u.voice = frenchVoice;
      u.rate = 1.0; // Vitesse de lecture
      u.pitch = 1.0; // Hauteur de la voix
    }

    setUtterance(u);

    return () => {
      synth.cancel();
    };
  }, [text]);

  const handleSpeak = () => {
    const synth = window.speechSynthesis;
    
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      synth.speak(utterance);
      setIsSpeaking(true);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  return (
    <button 
      onClick={handleSpeak} 
      className="speech-button"
      aria-label={isSpeaking ? "Arrêter la lecture" : "Lire le texte"}
    >
      {isSpeaking ? '⏸️' : '🔊'}
    </button>
  );
};

TextToSpeech.propTypes = {
  text: PropTypes.string.isRequired
};

export default TextToSpeech;