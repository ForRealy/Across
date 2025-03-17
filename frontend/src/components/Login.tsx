import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import '../assets/Login.css';

const Login: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate(); // Inicializar useNavigate

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !password) {
            setError("Por favor, ingresa tu nombre de usuario y contraseña");
        } else {
            setError("");
            console.log("Nombre: ", name);
            console.log("Contraseña: ", password);
        }
    };

    return (
        <div className="login-container">
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label htmlFor="name">Nombre de usuario:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ingresa tu nombre de usuario"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button 
                    type="button" 
                    className="login-btn" 
                    onClick={() => navigate("/home")} // Redirigir al hacer clic
                >
                    Iniciar sessión
                </button>                <button 
                    type="button" 
                    className="register-btn" 
                    onClick={() => navigate("/register")} // Redirigir al hacer clic
                >
                    ¿No tienes cuenta? Regístrate
                </button>
            </form>
        </div>
    );
};

export default Login;
