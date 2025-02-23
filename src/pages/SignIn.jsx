import React, { useState } from "react";
import "../styles/Auth.css"; // Make sure to add the styles!
import Navbar from "../components/Navbar"; // Adjust the path as necessary
import Footer from "../components/Footer"; // Adjust the path as necessary
const SignIn = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form>
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

        <button type="submit" className="auth-btn">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignIn;
