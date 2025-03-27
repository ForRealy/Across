import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import Header from "./Header";

const Configuration: React.FC = () => {
    const navigate = useNavigate(); // Hook para navegar a otras rutas

    // Función para redirigir a la página de configuración
    const handleRedirect = () => {
        navigate('/profile'); // Redirige a la ruta "/configuration"
    };

    return (
        <div className="container">
            <Header username="Player123" />
            <h1>Configuración</h1>
            <form >
                <label htmlFor="username">Nombre de usuario:</label>
                <input type="text" id="username" name="username" />
                <label htmlFor="email">Correo electrónico:</label>
                <input type="email" id="email" name="email" />
                <label htmlFor="password">Contraseña:</label>
                <input type="password" id="password" name="password" />
                <button type="submit" onClick={handleRedirect}>Guardar</button>
            </form>
        </div>
    );
};

export default Configuration;
