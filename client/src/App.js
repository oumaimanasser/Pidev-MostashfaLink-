import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import HospitalList from "./components/HospitalList";
import HospitalInfo from "./components/HospitalInfo";

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Dashboard />} />
        <Route path="/hospitals" element={<HospitalList />} />
        <Route path="/hospital-info" element={<HospitalInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
