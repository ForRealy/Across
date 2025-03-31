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

    const changeEmail = () => {
        navigate('/ChangeEmail'); // Redirige a la ruta "/configuration"
    };

    const changeNumber = () => {
        navigate('/ChangeNumber'); // Redirige a la ruta "/configuration"
    };

    const verifyNumber = () => {
        navigate('/verifyNumber'); // Redirige a la ruta "/configuration"
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
                    <h4 style={{ display: "inline" }}>PROFILE NAME :</h4> <span>DAW</span> <button onClick={editProfile}>Edit profile</button>
                </div>
            </div>
            <div className="contactInfo">
                <h3> Contact info </h3> 
                <div>
                    <h4 style={{ display: "inline" }}> EMAIL:</h4> <span>*****@gmail.com</span> <button onClick={changeEmail}>Change email</button>
                </div>
                <div>
                    <h4 style={{ display: "inline" }}>PHONE NUMBER :</h4> <span>Ends in **00</span> <button onClick={changeNumber}>Change number</button> <button onClick={verifyNumber}>Verify number</button>
                </div>
            </div>
            <div className="dangerZone">
                <h3> Danger Zone </h3> 
                <div>
                    <h4 style={{ display: "inline" }}> Eliminar cuenta de forma permanente:</h4> <button>Delete account</button>
                </div>
            </div>
            <div>
                <button onClick={viewProfile}> Confirm changes </button>
            </div>
        </div>
    );
};

export default Configuration;
