import React, { useState, FormEvent } from "react";
import '../assets/Login.css';

const Login: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !password) {
            setError("Por favor, ingresa tu nombre de usuario y contraseña");
        }
        else {
            setError("");
            console.log("No,bre: ", name);
            console.log("Contraseña: ", password);
        }
    };

    return (
        <div className="login-container">
            <h2> Iniciar sessión </h2>
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
                {error && <p className="error-message"> {error} </p>}
                <button type="submit" className="login-btn"> Iniciar sessión </button>
                <button type="submit" className="register-btn"> ¿No tienes cuenta? Registrate </button>

            </form>
        </div>
    );
};

export default Login;

