import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
import '../styles/RegisterPage.css'; // Asegúrate de que el archivo esté correctamente enlazado

const Register: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setMail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !password || !email) {
            setError("Por favor, ingresa tu nombre de usuario, contraseña y email");
        }
        else {
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
                console.log("Respuesta del servidor:", data);
                alert("Usuario creado correctamente");
                navigate("/login"); // Redirige al login después de registrarse
            })
            .catch(error => {
                console.error("Error al registrar:", error);
            });
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2 className="register-title">Regístrate</h2>
                <form onSubmit={handleSubmit}>
                    <div className="register-input-container">
                        <label htmlFor="name">Nombre de usuario:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ingresa tu nombre de usuario"
                        />
                    </div>
                    <div className="register-input-container">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                        />
                    </div>
                    <div className="register-input-container">
                        <label htmlFor="passwordConfirm">Repite la contraseña:</label>
                        <input
                            type="password"
                            id="passwordConfirm"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Confirma tu contraseña"
                        />
                    </div>
                    <div className="register-input-container">
                        <label htmlFor="mail">Email:</label>
                        <input
                            type="email"
                            id="mail"
                            value={email}
                            onChange={(e) => setMail(e.target.value)}
                            placeholder="Ingresa tu email"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="register-btn">Regístrate</button>
                </form>
                <button 
                    type="button" 
                    className="login-btn" 
                    onClick={() => navigate("/login")} // Redirigir al hacer clic
                >
                    ¿Ya tienes cuenta? Inicia sesión
                </button>
            </div>
        </div>
    );
};

export default Register;
