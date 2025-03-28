import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/EditProfile.css";


const editProfile: React.FC = () => {
    const navigate = useNavigate(); 

    const confirm = () => {
        navigate('/EditProfile'); // Redirige a la ruta "/configuration"
    };

    return (
        <div className="container">
          <Header username="Player123" />
          <div className="general">
            <h2> GENERAL </h2>
            <form>
                <label htmlFor="profile_name">PROFILE NAME:</label>
                <input type="text" id="profile_name" name="profile_name" />

                <label htmlFor="real_name">REAL NAME:</label>
                <input type="text" id="real_name" name="real_name" />

                <label htmlFor="username">USERNAME:</label>
                <input type="text" id="username" name="username" />

                <label htmlFor="biography">BIOGRAPHY:</label>
                <input type="text" id="biography" name="biography" />

            </form>
          </div>
          <div className="location">
            <h2> LOCATION </h2>
            <form>
                <label htmlFor="country">COUNTRY:</label>
                <select id="country" name="country">
                    <option value="spain">Spain</option>
                    <option value="france">France</option>
                    <option value="germany">Germany</option>
                </select>
            </form>
          </div>
      </div>
    );
};



export default editProfile;
