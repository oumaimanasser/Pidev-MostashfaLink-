import React, { useState, useEffect } from 'react';
import './NotificationPanel.css';

const NotificationPanel = ({ notifications, onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300); // Attend la fin de l'animation
  };

  if (!visible) return null;

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button onClick={handleClose} className="close-button">
          &times;
        </button>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${notification.type}`}>
              <div className="notification-content">
                <span className="notification-icon">
                  {notification.type === 'success' ? '✓' : 
                   notification.type === 'error' ? '✗' : '⚠'}
                </span>
                <p>{notification.message}</p>
              </div>
              <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
            </div>
          ))
        ) : (
          <p className="empty-notifications">Aucune notification</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;