import React from 'react';  // Correction ici : supprimer le 'import' en trop
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HospitalizedPatients from './components/HospitalizedPatients';
import AddPatient from './components/AddPatient';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/hospitalized-patients" element={<HospitalizedPatients />} />
        <Route path="/add-patient" element={<AddPatient />} />
      </Routes>
    </Router>
  );
}

export default App;
