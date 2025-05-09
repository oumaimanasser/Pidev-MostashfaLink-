import React from "react";
import { BrowserRouter, Route, Routes,Navigate } from "react-router-dom";
import Hero from "./Component/Hero/Hero";
import About from "./Component/About/About";
import Contact from "./Component/Contact/Conatct";
import Footer from "./Component/Footer/Footer";
import Login from "./Component/Login";
import SignUp from "./Component/Signup";
import ForgotPassword from "./Component/ForgotPassword";
import Studentdashboard from "./Component/student/Studentdashboard";
import Dashboard from "./Component/Dashboard";
import HospitalList from "./Component/HospitalList";
import HospitalInfo from "./Component/HospitalInfo";
import HospitalizedPatients from './Component/HospitalizedPatients';
import MedicationPlan from './Component/MedicationPlan';
import UserCRUD from './Component/UserCRUD';
import Equipment from './Component/Equipment';
import Personnel from './Component/Personnel';
import MedicalRecords from './Component/medicalrecords';

import Profile from './Component/Profile';

import 'leaflet/dist/leaflet.css';
import Sentiment from "./Component/Sentiment";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Hero />} />
          <Route path="/home" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/dashboard" element={<Studentdashboard />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/hospitals" element={<HospitalList />} />
          <Route path="/hospital-info" element={<HospitalInfo />} />
          <Route path="/hospitalized-patients" element={<HospitalizedPatients />} />
          <Route path="/MedicationPlan" element={<MedicationPlan fetchPatients={() => {}} />} />
          <Route path="/Sentiment" element={<Sentiment />} />


<Route path="/profile" element={<Profile />} />
          <Route path="/test-usercrud" element={<UserCRUD />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          {/* 🚀 Routes ajoutées pour la gestion des patients hospitalisés et du plan de médication */                }

          {/* 🚀 Routes ajoutées pour Equipment et Personnel */}
          <Route path="/equipments" element={<Equipment />} />
          <Route path="/personnels" element={<Personnel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
