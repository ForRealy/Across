import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { userAuth } from "./AuthContext"; // Importamos el contexto de autenticación
import "../assets/Login-register.css"; // Importar los estilos

const Login: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = userAuth();

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, password }),
      });

      if(response.ok){
        const data = await response.json();
        console.log("Login exitoso", data);

        login({username: data.user.username, email: data.user.email}); // Guardar el usuario en el contexto

        navigate("/");
      }
      else {
        const err = await response.json();
        setError(err.message || "Error en el login");
      }
    }
    catch(error){
      console.error("Error en el login", error);
      setError("Error en el login");
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
    );
  };
  
export default Login;