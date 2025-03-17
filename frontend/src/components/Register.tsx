import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import '../assets/Login.css';

const Login: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [email, setMail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate(); // Inicializar useNavigate
    

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !password || !email) {
            setError("Por favor, ingresa tu nombre de usuario, contraseña y email");
        }
        else {
            setError("");
            console.log("Nombre: ", name);
            console.log("Contraseña: ", password);
            console.log("Repite la contraseña: ", password);
            console.log("Email: ", email);

        }
    };

    return (
        <div className="login-container">
            <h2> Registrate </h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label htmlFor="name"> Nombre de usuario: </label>
                    <input
                        type="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ingresa tu nombre de usuario"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="password"> Contraseña: </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="password"> Repite la contraseña: </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Confirma tu contraseña"
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="mail"> Email: </label>
                    <input
                        type="mail"
                        id="mail"
                        value={email}
                        onChange={(e) => setMail(e.target.value)}
                        placeholder="INgresa tu email"
                    />
                </div>
                {error && <p className="error-message"> {error} </p>}
                <button type="submit" className="register-btn"> Registrate </button>
                <button 
                    type="button" 
                    className="login-btn" 
                    onClick={() => navigate("/")} // Redirigir al hacer clic
                >
                    ¿No tienes cuenta? Regístrate
                </button>
            </form>
        </div>
    );
};

export default Login;

