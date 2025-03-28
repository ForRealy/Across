import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import Header from "./Header";
import "../assets/Configuration.css";

const Configuration: React.FC = () => {
    const navigate = useNavigate(); // Hook para navegar a otras rutas

    // Función para redirigir a la página de configuración
    const editProfile = () => {
        navigate('/EditProfile'); // Redirige a la ruta "/configuration"
    };

    const viewProfile = () => {
        navigate('/profile'); // Redirige a la ruta "/configuration"
    };

    return (
        <div className="container">
            <Header username="Player123" />
            <h1>Configuración</h1>
            <div className="profile">
                <h3> Profile </h3> 
                <div>
                    <h4 style={{ display: "inline" }}>ACCOUNT NAME:</h4> <span>*******</span> you can't change your account name.
                </div>
                <div>
                    <h4 style={{ display: "inline" }}>PROFILE NAME :</h4> <span>DAW</span> <button onClick={editProfile}>Edit profile</button> <button onClick={viewProfile}>View Profile</button>
                </div>
            </div>
        </div>
    );
};

export default Configuration;
