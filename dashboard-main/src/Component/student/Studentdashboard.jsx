import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Studentdash.css"
const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(!localStorage.getItem("user"));
  const [showDropdown, setShowDropdown] = useState(false); // État pour le menu déroulant
  const dropdownItemStyle = {
    display: 'block',
    padding: '10px 15px',
    textDecoration: 'none',
    color: '#333',
    borderBottom: '1px solid #eee'
  };
  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-profile-container')) {
        setShowDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Network error');
        }
        
        const data = await res.json();
        console.log("User data:", data);
        
        // Update user data
        const user = data.user || data;
        setUserData(user);
        localStorage.setItem("user", JSON.stringify(user));
        
      } catch (error) {
        console.error("Error loading user", error);
      } finally {
        setLoading(false);
      }
    };

    if (!userData) {
      fetchMe();
    }
  }, [userData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#F0EDEF', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ 
        width: '400px', 
        backgroundColor: 'white', 
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)', 
        zIndex: 10 
      }}>
        {/* Logo and Brand */}
        <div className="sidebar-header" style={{ 
          padding: '70px', 
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#F2BBDA', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            marginRight: '5px',
            fontSize: '24px'
          }}>
            +
          </div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>
            Mostachfa_Link
          </h2>
        </div>
<br/>
<br/>
<br/>
      
        
        {/* COVID Info */}
        <div style={{ padding: '16px 20px', borderTop: '1px dashed #ccc', marginTop: '10px' }}>
          <Link to="/test-usercrud" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 16px',
            color: '#c31815',
            textDecoration: 'none',
            backgroundColor: '#fff0f0',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <span style={{ marginRight: '10px' }}>🦠</span>
            View users
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, padding: '0' }}>
 {/* Top Header Bar */}
<header style={{ 
  backgroundColor: 'white', 
  padding: '10px 30px', 
  display: 'flex', 
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
}}>
  <h1 style={{ 
    fontSize: '24px', 
    fontWeight: '600', 
    margin: 0 
  }}>
    Dashboard
  </h1>
  
  {/* User Profile */}
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    gap: '20px'
  }}>
    <div style={{ fontSize: '20px' }}>🔔</div>
    <div 
      className="user-profile-container"
      onClick={() => setShowDropdown(!showDropdown)} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <div style={{ 
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        overflow: 'hidden',
        marginRight: '12px',
        backgroundColor: '#f0f0f0',
        border: '2px solid #e1e1e1'
      }}>
        {/* ... votre code d'image de profil ... */}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {userData?.name || 'User'}
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          Doctor
        </div>
      </div>

      {/* Menu déroulant */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '200px',
          zIndex: 1000, // Augmentez ce valeur si nécessaire
          marginTop: '10px'
        }}>
          <Link 
            to="/profile" 
            style={{
              display: 'block',
              padding: '10px 15px',
              textDecoration: 'none',
              color: '#333',
              borderBottom: '1px solid #eee'
            }}
            onClick={() => setShowDropdown(false)}
          >
            Mon profil
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 15px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              color: '#c31815',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  </div>
</header>
              
        {/* Dashboard Content */}
        <div style={{ padding: '30px' }}>
          {/* Welcome Section */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
                Hello, {userData?.name || 'User'}
              </h2>
              <p style={{ margin: 0, color: '#666' }}>
                Welcome to your dashboard
              </p>
            </div>
            <div>
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI0YyRjJGMiIgY3g9IjgwIiBjeT0iODAiIHI9IjgwIi8+PHBhdGggZD0iTTg2IDEwNXYtNWg4djEwaC04djVIODFsLTUtMTB2LTVoNXYtNWg1di01aDV2LTVoNXYtNWg1di01aDV2MTVoNXYxMGgtNXY1aC01djVoLTV2NWgtNXY1aC01eiIgZmlsbD0iI0ZGNDg0OCIvPjxwYXRoIGQ9Ik02MSA4MGg1djVoNXY1aDV2NWg1djEwaC01di01aC01di01aC01di01aC01eiIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgZmlsbD0iIzMzMyIgY3g9IjkxIiBjeT0iNjUiIHI9IjUiLz48cGF0aCBkPSJNNTEgMTE1aDVWOTVoMTB2LTVoNXYtNWg1di01aDEwdjVoNXYxMGgtNXY1aC01djVoLTVWOTBoLTVWODVoLTV2MjBoLTVWOTVoLTV2MjBoLTVaIiBmaWxsPSIjNTg3REQ0Ii8+PHBhdGggZD0iTTY2IDU1aDV2NWgtNXoiIGZpbGw9IiMzMzMiLz48L2c+PC9zdmc+" 
                alt="Doctor illustration" 
                style={{ width: '120px', height: '120px' }}
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            marginBottom: '30px' 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px',
              padding: '20px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                color: '#c31815', 
                fontSize: '30px', 
                marginBottom: '15px' 
              }}>
                👥
              </div>
              <div style={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontSize: '24px' 
              }}>
                2,301
              </div>
              <div style={{ 
                textAlign: 'center', 
                color: '#666',
                fontSize: '14px'
              }}>
                Total Patients
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px',
              padding: '20px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                color: '#c31815', 
                fontSize: '30px', 
                marginBottom: '15px' 
              }}>
                👨‍⚕️
              </div>
              <div style={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontSize: '24px' 
              }}>
                401
              </div>
              <div style={{ 
                textAlign: 'center', 
                color: '#666',
                fontSize: '14px'
              }}>
                Total Doctors
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px',
              padding: '20px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                color: '#c31815', 
                fontSize: '30px', 
                marginBottom: '15px' 
              }}>
                🏥
              </div>
              <div style={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontSize: '24px' 
              }}>
                21
              </div>
              <div style={{ 
                textAlign: 'center', 
                color: '#666',
                fontSize: '14px'
              }}>
                Total Clinics
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Quick Actions</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '15px' 
            }}>
              {[
                { icon: '🏥', text: 'Add A Clinic', link: '/hospitals' },
                { icon: '👨‍⚕️', text: 'Add A Specialist', link: '/personnels' },
                { icon: '👥', text: 'Medical Records', link: '/medical-records' },
                { icon: '👥', text: 'Hospitalized Patients', link: '/hospitalized-patients' }
              ].map((item, index) => (
                <Link key={index} to={item.link} style={{ 
                  backgroundColor: '#D67EC9', 
                  borderRadius: '8px', 
                  padding: '25px 15px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>
                    {item.icon}
                  </div>
                  <div>{item.text}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Dashboard Analytics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '20px' 
          }}>
            {/* Recent Activities */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px',
              height: '250px'
            }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Recent Activities</h3>
              <div style={{ textAlign: 'center' }}>
                <svg width="100%" height="200" viewBox="0 0 300 180">
                  <g transform="translate(0,10)">
                    {/* X-axis */}
                    <line x1="40" y1="150" x2="280" y2="150" stroke="#eee" strokeWidth="1" />
                    {/* Y-axis */}
                    <line x1="40" y1="10" x2="40" y2="150" stroke="#eee" strokeWidth="1" />
                    
                    {/* X-axis labels */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, i) => (
                      <text key={i} x={40 + i * 35} y="170" textAnchor="middle" fontSize="12" fill="#666">{month}</text>
                    ))}
                    
                    {/* Y-axis labels */}
                    {[0, 5, 10, 15, 20, 25].map((val, i) => (
                      <text key={i} x="30" y={150 - i * 30} textAnchor="end" fontSize="12" fill="#666">{val}</text>
                    ))}
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <line key={i} x1="40" y1={150 - i * 30} x2="280" y2={150 - i * 30} stroke="#f5f5f5" strokeWidth="1" />
                    ))}
                    
                    {/* Data area */}
                    <path 
                      d="M40,140 L75,120 L110,130 L145,100 L180,80 L215,90 L250,70 L285,60 L285,150 L40,150 Z" 
                      fill="rgba(237, 107, 125, 0.2)" 
                    />
                    
                    {/* Data line */}
                    <path 
                      d="M40,140 L75,120 L110,130 L145,100 L180,80 L215,90 L250,70 L285,60" 
                      fill="none" 
                      stroke="#ed6b7d" 
                      strokeWidth="3" 
                    />
                    
                    {/* Data points */}
                    {[
                      { x: 40, y: 140 },
                      { x: 75, y: 120 },
                      { x: 110, y: 130 },
                      { x: 145, y: 100 },
                      { x: 180, y: 80 },
                      { x: 215, y: 90 },
                      { x: 250, y: 70 },
                      { x: 285, y: 60 }
                    ].map((point, i) => (
                      <circle key={i} cx={point.x} cy={point.y} r="4" fill="white" stroke="#ed6b7d" strokeWidth="2" />
                    ))}
                  </g>
                </svg>
              </div>
            </div>
            
            {/* Total Bookings */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px',
              height: '250px'
            }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Total Bookings</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#eee" strokeWidth="30" />
                  
                  {/* Urgent segment - 25% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#FFD166" 
                    strokeWidth="30" 
                    strokeDasharray="125.6 377" 
                    strokeDashoffset="0" 
                  />
                  
                  {/* Emergency segment - 15% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#EF476F" 
                    strokeWidth="30" 
                    strokeDasharray="75.4 427.2" 
                    strokeDashoffset="-125.6" 
                  />
                  
                  {/* Not urgent segment - 35% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#06D6A0" 
                    strokeWidth="30" 
                    strokeDasharray="175.8 326.8" 
                    strokeDashoffset="-201" 
                  />
                  
                  {/* Resuscitation segment - 25% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#118AB2" 
                    strokeWidth="30" 
                    strokeDasharray="125.6 377" 
                    strokeDashoffset="-376.8" 
                  />
                  
                  {/* Center */}
                  <circle cx="100" cy="100" r="65" fill="white" />
                  <text x="100" y="95" textAnchor="middle" fontSize="22" fontWeight="bold">382</text>
                  <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#666">Total Bookings</text>
                </svg>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '15px', 
                marginTop: '20px' 
              }}>
                {[
                  { color: '#FFD166', label: 'urgent' },
                  { color: '#06D6A0', label: 'not urgent' },
                  { color: '#118AB2', label: 'resuscitation' },
                  { color: '#EF476F', label: 'emergency' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '12px', color: '#666' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Diseases Summary */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px',
              height: '250px'
            }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Diseases Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#eee" strokeWidth="30" />
                  
                  {/* Malaria segment - 40% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#FFAFCC" 
                    strokeWidth="30" 
                    strokeDasharray="200.8 301.8" 
                    strokeDashoffset="0" 
                  />
                  
                  {/* Tuberculosis segment - 20% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#FFC8DD" 
                    strokeWidth="30" 
                    strokeDasharray="100.4 402.2" 
                    strokeDashoffset="-200.8" 
                  />
                  
                  {/* Pneumonia segment - 25% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#A2D2FF" 
                    strokeWidth="30" 
                    strokeDasharray="125.6 377" 
                    strokeDashoffset="-301.2" 
                  />
                  
                  {/* Diabetes segment - 15% */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#BDE0FE" 
                    strokeWidth="30" 
                    strokeDasharray="75.4 427.2" 
                    strokeDashoffset="-426.8" 
                  />
                  
                  {/* Center */}
                  <circle cx="100" cy="100" r="65" fill="white" />
                </svg>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '15px', 
                marginTop: '20px' 
              }}>
                {[
                  { color: '#FFAFCC', label: 'malaria' },
                  { color: '#FFC8DD', label: 'tuberculosis' },
                  { color: '#A2D2FF', label: 'pneumonia' },
                  { color: '#BDE0FE', label: 'diabetes' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '12px', color: '#666' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;