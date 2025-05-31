import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
import '../styles/RegisterPage.css';

const Register: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !password || !email) {
            setError("Please enter your username, password and email.");
        } else {
            setError("");
            fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profile_name: name,
                    email: email,
                    password: password,
                    real_name: name,
                    username: name,
                    biography: ""
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Server response:", data);
                alert("User created successfully");
                navigate("/login");
            })
            .catch(error => {
                console.error("Error registering:", error);
            });
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2 className="register-title">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="register-input-container">
                        <label htmlFor="name">Username:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="register-input-container">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className="register-input-container">
                        <label htmlFor="passwordConfirm">Confirm password:</label>
                        <input
                            type="password"
                            id="passwordConfirm"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Confirm your password"
                        />
                    </div>
                    <div className="register-input-container">
                        <label htmlFor="mail">Email:</label>
                        <input
                            type="email"
                            id="mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="register-btn">Sign Up</button>
                </form>
                <button 
                    type="button" 
                    className="login-btn" 
                    onClick={() => navigate("/login")}
                >
                    Already have an account? Sign in
                </button>
            </div>
        </div>
    );
};

export default Register;
