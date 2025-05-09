import React, { useState, useEffect } from 'react';


const MedicalPlan = () => {
  const API_BASE_URL = 'http://localhost:3002/api';
  
  // State management
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nextAdministration');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Stats and notifications states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);

  // Form state
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    route: 'Oral',
    frequency: 'Daily',
    startDate: '',
    endDate: '',
    prescribingDoctor: '',
    notes: '',
    status: 'Pending'
  });

  // Fetch medications on component mount and when dependencies change
  useEffect(() => {
    fetchMedications();
  }, [currentPage, searchTerm, sortField, sortOrder]);

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch reminders when timeframe changes
  useEffect(() => {
    fetchReminders();
  }, [timeframe]);

  // Fetch medications from API
  const fetchMedications = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/medications?page=${currentPage}&search=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        setMedications(data.data);
        setTotalPages(data.pages);
      } else {
        throw new Error(data.message || 'Failed to fetch medications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics from API
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const url = `${API_BASE_URL}/medications/stats`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch reminders from API
  const fetchReminders = async () => {
    setLoadingReminders(true);
    try {
      const url = `${API_BASE_URL}/medications/reminders?timeframe=${timeframe}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        setReminders(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch reminders');
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoadingReminders(false);
    }
  };

  // Batch administer medications
  const handleBatchAdminister = async (ids) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/batch-administer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ medicationIds: ids })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        fetchMedications();
        fetchReminders();
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to batch administer medications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error batch administering medications:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      route: 'Oral',
      frequency: 'Daily',
      startDate: '',
      endDate: '',
      prescribingDoctor: '',
      notes: '',
      status: 'Pending'
    });
    setFormMode('add');
    setSelectedMedication(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let url = `${API_BASE_URL}/medications`;
      let method = 'POST';
      
      if (formMode === 'edit' && selectedMedication) {
        url += `/${selectedMedication._id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        fetchMedications();
        resetForm();
        toggleFormModal(false);
        // Refresh stats and reminders after adding/editing medication
        fetchStats();
        fetchReminders();
      } else {
        throw new Error(data.message || 'Failed to save medication');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving medication:', err);
    }
  };

  // Delete medication
 // Mettre à jour l'URL de suppression
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this medication plan?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    if (data.success) {
      fetchMedications();
      fetchStats();
      fetchReminders();
    } else {
      throw new Error(data.message || 'Failed to delete medication');
    }
  } catch (err) {
    setError(err.message);
    console.error('Error deleting medication:', err);
  }
};

  // Update medication status
  const handleStatusUpdate = async (id, status) => {
    try {
      const medicationToUpdate = medications.find(med => med._id === id);
      
      const response = await fetch(`${API_BASE_URL}/medications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          frequency: medicationToUpdate.frequency
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.success) {
        fetchMedications();
        // Refresh stats and reminders after updating status
        fetchStats();
        fetchReminders();
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
    }
  };

  // Edit medication
  const handleEdit = (medication) => {
    setFormMode('edit');
    setSelectedMedication(medication);
    
    // Format dates for form inputs
    const formattedStartDate = medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : '';
    const formattedEndDate = medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '';
    
    setFormData({
      name: medication.name || '',
      dosage: medication.dosage || '',
      route: medication.route || 'Oral',
      frequency: medication.frequency || 'Daily',
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      prescribingDoctor: medication.prescribingDoctor || '',
      notes: medication.notes || '',
      status: medication.status || 'Pending'
    });
    
    toggleFormModal(true);
  };

  // Modal management
  const [showFormModal, setShowFormModal] = useState(false);
  
  const toggleFormModal = (show) => {
    setShowFormModal(show);
    if (!show) {
      resetForm();
    }
  };

  // Search handling
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchMedications();
  };

  // Sort handling
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Check if a reminder is due soon (within 1 hour)
  const isDueSoon = (dateString) => {
    if (!dateString) return false;
    const now = new Date();
    const reminderDate = new Date(dateString);
    const diffMs = reminderDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 1;
  };

  // Handle administering from reminders
  const handleAdministerFromReminders = (ids) => {
    handleBatchAdminister(Array.isArray(ids) ? ids : [ids]);
    setShowRemindersModal(false);
  };

  return (
    <div className="medical-plan-container">
      <header className="header">
        <h1>Medication Plan Management</h1>
        <div className="actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medications..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <button 
            className="btn btn-info" 
            onClick={() => setShowStatsModal(true)}
          >
            Statistics
          </button>
          <button 
            className="btn btn-warning" 
            onClick={() => {
              fetchReminders();
              setShowRemindersModal(true);
            }}
          >
            Reminders
            {reminders.length > 0 && <span className="badge">{reminders.length}</span>}
          </button>
          <button 
            className="btn btn-success" 
            onClick={() => toggleFormModal(true)}
          >
            Add New Medication
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="close-btn">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading medications...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="medications-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Dosage</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th onClick={() => handleSort('startDate')} className="sortable">
                    Start Date {sortField === 'startDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('nextAdministration')} className="sortable">
                    Next Dose {sortField === 'nextAdministration' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medications.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No medications found</td>
                  </tr>
                ) : (
                  medications.map((medication) => (
                    <tr key={medication._id} className={`status-${medication.status.toLowerCase()}`}>
                      <td>{medication.name}</td>
                      <td>{medication.dosage}</td>
                      <td>{medication.route}</td>
                      <td>{medication.frequency}</td>
                      <td>{formatDate(medication.startDate)}</td>
                      <td>{formatDate(medication.nextAdministration)}</td>
                      <td>{medication.prescribingDoctor}</td>
                      <td>
                        <span className={`status-badge ${medication.status.toLowerCase()}`}>
                          {medication.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="dropdown">
                          <button className="btn btn-secondary dropdown-toggle">Status</button>
                          <div className="dropdown-content">
                            <button 
                              onClick={() => handleStatusUpdate(medication._id, 'Administered')}
                              className="dropdown-item"
                            >
                              Administered
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(medication._id, 'Skipped')}
                              className="dropdown-item"
                            >
                              Skipped
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(medication._id, 'Cancelled')}
                              className="dropdown-item"
                            >
                              Cancelled
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(medication._id, 'Pending')}
                              className="dropdown-item"
                            >
                              Pending
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleEdit(medication)} 
                          className="btn btn-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(medication._id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Add/Edit Medication Modal */}
      {showFormModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formMode === 'add' ? 'Add New Medication' : 'Edit Medication'}</h2>
              <button onClick={() => toggleFormModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="medication-form">
              <div className="form-group">
                <label htmlFor="name">Medication Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dosage">Dosage:</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="route">Route:</label>
                  <select
                    id="route"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                  >
                    <option value="Oral">Oral</option>
                    <option value="Intravenous">Intravenous</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Topical">Topical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Frequency:</label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                  >
                    <option value="Daily">Daily</option>
                    <option value="BID">BID (Twice a day)</option>
                    <option value="TID">TID (Three times a day)</option>
                    <option value="QID">QID (Four times a day)</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="AsNeeded">As Needed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date (Optional):</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prescribingDoctor">Prescribing Doctor:</label>
                <input
                  type="text"
                  id="prescribingDoctor"
                  name="prescribingDoctor"
                  value={formData.prescribingDoctor}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes:</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              {formMode === 'edit' && (
                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Administered">Administered</option>
                    <option value="Skipped">Skipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => toggleFormModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {formMode === 'add' ? 'Add Medication' : 'Update Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="modal">
          <div className="modal-content stats-modal">
            <div className="modal-header">
              <h2>Medication Statistics</h2>
              <button onClick={() => setShowStatsModal(false)} className="close-btn">&times;</button>
            </div>
            
            {loadingStats ? (
              <div className="loading">Loading statistics...</div>
            ) : stats ? (
              <div className="stats-container">
                <div className="stats-overview">
                  <div className="stat-card">
                    <h3>Total Medications</h3>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Active Medications</h3>
                    <div className="stat-value">{stats.active}</div>
                    <div className="stat-percent">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Upcoming in 24h</h3>
                    <div className="stat-value">{stats.upcomingIn24h}</div>
                  </div>
                </div>
                
                <div className="stats-section">
                  <h3>Distribution by Frequency</h3>
                  <div className="stat-bar-chart">
                    {stats.byFrequency.map((item) => (
                      <div key={item._id} className="stat-bar-item">
                        <div className="stat-bar-label">{item._id}</div>
                        <div className="stat-bar-container">
                          <div 
                            className="stat-bar" 
                            style={{ 
                              width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <div className="stat-bar-value">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="stats-section">
                  <h3>Top Prescribing Doctors</h3>
                  <div className="stat-bar-chart">
                    {stats.topPrescribers.map((item) => (
                      <div key={item._id} className="stat-bar-item">
                        <div className="stat-bar-label">{item._id}</div>
                        <div className="stat-bar-container">
                          <div 
                            className="stat-bar" 
                            style={{ 
                              width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <div className="stat-bar-value">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No statistics available</div>
            )}
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {showRemindersModal && (
        <div className="modal">
          <div className="modal-content reminders-modal">
            <div className="modal-header">
              <h2>Medication Reminders</h2>
              <button onClick={() => setShowRemindersModal(false)} className="close-btn">&times;</button>
            </div>
            
            <div className="timeframe-selector">
              <button 
                className={`btn ${timeframe === '12h' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTimeframe('12h')}
              >
                12 Hours
              </button>
              <button 
                className={`btn ${timeframe === '24h' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTimeframe('24h')}
              >
                24 Hours
              </button>
              <button 
                className={`btn ${timeframe === '48h' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTimeframe('48h')}
              >
                48 Hours
              </button>
              <button 
                className={`btn ${timeframe === '7d' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTimeframe('7d')}
              >
                7 Days
              </button>
            </div>
            
            {loadingReminders ? (
              <div className="loading">Loading reminders...</div>
            ) : reminders.length > 0 ? (
              <div className="reminders-list">
                {reminders.map((medication) => (
                  <div 
                    key={medication._id} 
                    className={`reminder-card ${isDueSoon(medication.nextAdministration) ? 'due-soon' : ''}`}
                  >
                    <div className="reminder-header">
                      <h3>{medication.name}</h3>
                      <div>
                        <span className={`status-badge ${medication.status.toLowerCase()}`}>
                          {medication.status}
                        </span>
                      </div>
                    </div>
                    <div className="reminder-details">
                      <div>
                        <strong>Dosage:</strong> {medication.dosage}
                      </div>
                      <div>
                        <strong>Route:</strong> {medication.route}
                      </div>
                      <div>
                        <strong>Next Administration:</strong> {formatDate(medication.nextAdministration)}
                      </div>
                      <div>
                        <strong>Patient:</strong> {medication.patientId ? 
                          `${medication.patientId.firstName} ${medication.patientId.lastName} (Room: ${medication.patientId.roomNumber})` : 
                          'Unknown'}
                      </div>
                    </div>
                    <div className="reminder-actions">
                      <button 
                        onClick={() => handleAdministerFromReminders(medication._id)}
                        className="btn btn-success"
                      >
                        Mark as Administered
                      </button>
                      <button 
                        onClick={() => handleEdit(medication)}
                        className="btn btn-primary"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                
                {reminders.length > 1 && (
                  <div className="batch-actions">
                    <button 
                      onClick={() => handleAdministerFromReminders(reminders.map(med => med._id))}
                      className="btn btn-success"
                    >
                      Mark All as Administered
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data">No reminders available for the selected timeframe</div>
            )}
          </div>
        </div>
      )}
      <style>
        {`
        /* General Styles */
        .medical-plan-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .header h1 {
          color: #2c3e50;
          margin: 0;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        /* Button Styles */
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background-color: #2980b9;
        }

        .btn-success {
          background-color: #2ecc71;
          color: white;
        }

        .btn-success:hover {
          background-color: #27ae60;
        }

        .btn-danger {
          background-color: #e74c3c;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c0392b;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #7f8c8d;
        }

        /* Search Form */
        .search-form {
          display: flex;
          gap: 10px;
        }

        .search-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex-grow: 1;
          min-width: 200px;
        }

        /* Alert Styles */
        .alert {
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
        }

        /* Loading Message */
        .loading {
          text-align: center;
          padding: 20px;
          font-size: 18px;
          color: #7f8c8d;
        }

        /* Table Styles */
        .table-container {
          overflow-x: auto; /* Makes table scrollable on small screens */
        }

        .medications-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .medications-table th,
        .medications-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .medications-table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }

        .sortable {
          cursor: pointer;
        }

        .sortable:hover {
          background-color: #e9ecef;
        }

        .no-data {
          text-align: center;
          font-style: italic;
          color: #7f8c8d;
        }

        /* Status Badge */
        .status-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.pending {
          background-color: #f0ad4e;
          color: white;
        }

        .status-badge.administered {
          background-color: #5cb85c;
          color: white;
        }

        .status-badge.skipped {
          background-color: #5bc0de;
          color: white;
        }

        .status-badge.cancelled {
          background-color: #d9534f;
          color: white;
        }

        /* Row styling based on status */
        .status-administered {
          background-color: rgba(92, 184, 92, 0.1);
        }

        .status-cancelled {
          background-color: rgba(217, 83, 79, 0.1);
        }

        /* Action Buttons */
        .actions-cell {
          display: flex;
          gap: 5px;
        }

        /* Dropdown Menu */
        .dropdown {
          position: relative;
          display: inline-block;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          background-color: #f9f9f9;
          min-width: 120px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
        }

        .dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-item {
          background: none;
          border: none;
          padding: 10px;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: #f1f1f1;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
        }

        .page-info {
          font-size: 14px;
        }

        /* Modal */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          color: #2c3e50;
        }

        /* Form Styles */
        .medication-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-row {
          display: flex;
          gap: 15px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .medication-form label {
          font-weight: 500;
        }

        .medication-form input,
        .medication-form select,
        .medication-form textarea {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .actions {
            flex-direction: column;
            width: 100%;
          }
          
          .search-form {
            width: 100%;
          }
          
          .btn {
            width: 100%;
          }
          
          .form-row {
            flex-direction: column;
            gap: 15px;
          }
        }
          
        `}
      </style>
    </div>
  );
};

export default MedicalPlan;