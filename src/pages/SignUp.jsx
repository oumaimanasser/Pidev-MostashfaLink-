import React, { useState } from "react";
import "../styles/Auth.css"; // Make sure to add the styles!
import Navbar from "../components/Navbar"; // Adjust the path as necessary
import Footer from "../components/Footer"; // Adjust the path as necessary
const SignUp = () => {
  const [role, setRole] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
   

    <div className="auth-container">
      <h2>Sign Up</h2>
      <form>
        <div className="input-group">
          <input type="text" id="fullname" required />
          <label htmlFor="fullname">Full Name</label>
        </div>

        <div className="input-group">
          <input type="email" id="email" required />
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-group">
          <input
            type={passwordVisible ? "text" : "password"}
            id="password"
            required
          />
          <label htmlFor="password">Password</label>
          <span className="eye-icon" onClick={togglePasswordVisibility}>
            {passwordVisible ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="input-group">
          <select value={role} onChange={handleRoleChange} required>
            <option value="" disabled>Select Role</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="triage">Triage</option>
            <option value="department-head">Department Head</option>
          </select>
        </div>

        <button type="submit" className="auth-btn">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
