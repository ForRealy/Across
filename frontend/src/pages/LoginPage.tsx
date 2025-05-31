import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { userAuth } from "./AuthContext"; // Import the authentication context
import "../styles/LoginPage.css"; // Import the styles

const Login: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = userAuth(); // Use the login function from the context

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError("Please enter your username and password");
      return;
    }

    setError("");
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": "http://localhost:5173"
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ username: name, password }),
      });

      if(response.ok){
        const data = await response.json();
        console.log("Login successful", data);

        // Save the token
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Save all user data including idUser
        login({ 
          username: data.user.username, 
          email: data.user.email,
          idUser: data.user.idUser
        });

        navigate("/");
      }
      else {
        const err = await response.json();
        console.error("Error in the response:", err);
        setError(err.error || err.message || "Login error");
      }
    } catch(error) {
      console.error("Login error:", error);
      setError("Error connecting to the server. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-input-container">
            <label htmlFor="name">Username:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div className="login-input-container">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
        <button
          type="button"
          className="register-btn"
          onClick={() => navigate("/register")}
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
};

export default Login;
