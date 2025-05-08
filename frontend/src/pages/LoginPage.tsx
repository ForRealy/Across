import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { userAuth } from "./AuthContext"; // Importamos el contexto de autenticación
import "../styles/LoginPage.css"; // Importar los estilos

const Login: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = userAuth(); // Usamos la función login del contexto

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError("Por favor, ingresa tu nombre de usuario y contraseña");
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
        console.log("Login exitoso", data);
  
        // Save the token
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
  
        // Guarda todos los datos del usuario incluyendo el idUser
        login({ 
          username: data.user.username, 
          email: data.user.email,
          idUser: data.user.idUser
        });
  
        navigate("/");
      }
      else {
        const err = await response.json();
        console.error("Error en la respuesta:", err);
        setError(err.error || err.message || "Error en el login");
      }
    } catch(error) {
      console.error("Error en el login:", error);
      setError("Error al conectar con el servidor. Por favor, intenta de nuevo.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Inicia sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-input-container">
            <label htmlFor="name">Nombre de usuario:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
          <div className="login-input-container">
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
          <button type="submit" className="login-btn">
            Iniciar sesión
          </button>
        </form>
        <button
          type="button"
          className="register-btn"
          onClick={() => navigate("/register")}
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  );
};

export default Login;
