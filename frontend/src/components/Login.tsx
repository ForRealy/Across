import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import '../assets/Login.css';

const Login: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate(); // Inicializar useNavigate

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name || !password) {
          setError("Por favor, ingresa tu nombre de usuario y contraseña");
        } else {
          setError("");
          try {
            const response = await fetch("http://localhost:3001/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: name, password })
            });
    
            if (response.ok) {
              const data = await response.json();
              console.log("Login exitoso:", data);
              // Redirige al dashboard o a la ruta deseada después del login
              navigate("/dashboard");
            } else {
              const err = await response.json();
              setError(err.error || "Error en el login");
            }
          } catch (error) {
            console.error(error);
            setError("Error en el servidor");
          }
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
                <button type="submit" className="login-btn">Iniciar sesión</button>
                <button 
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
