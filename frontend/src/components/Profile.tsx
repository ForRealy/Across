import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import Header from "./Header";
import "../assets/Profile.css";
import Foto_Perfil from "../media/Foto_Perfil.jpg"; // Importando la imagen

const Profile: React.FC = () => {
    const navigate = useNavigate(); // Hook para navegar a otras rutas

    // Función para redirigir a la página de configuración
    const handleRedirect = () => {
        navigate('/configuration'); // Redirige a la ruta "/configuration"
    };

    return (
        <div className="container">
            <Header username="Player123" />
            <div>
                <img src={Foto_Perfil} alt="Foto de perfil" className="profile-img" />
                <p> Nombre: Player123 </p>
                <button onClick={handleRedirect}>Configuración</button> {/* Cambié el onclick por onClick y la función handleRedirect */}
            </div>
        </div>
    );
};

export default Profile;
