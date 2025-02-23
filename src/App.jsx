import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const Layout = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === "/sign-in" || location.pathname === "/sign-up";

  return (
    <div className="app-container">
      {!hideSidebar && <Navbar />} {/* Afficher Navbar si ce n'est pas SignIn/SignUp */}
      <div className="main-content">
        {!hideSidebar && <Sidebar />} {/* Afficher Sidebar si ce n'est pas SignIn/SignUp */}
        <div className="content">
          <Outlet /> {/* Afficher le contenu des routes ici */}
        </div>
      </div>
      {!hideSidebar && <Footer />} {/* Afficher Footer si ce n'est pas SignIn/SignUp */}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
