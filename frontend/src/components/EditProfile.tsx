import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/EditProfile.css";

const EditProfile: React.FC = () => {
  const [profileName, setProfileName] = useState('');
  const [realName, setRealName] = useState('');
  const [username, setUsername] = useState('');
  const [biography, setBiography] = useState('');
  const [country, setCountry] = useState('spain');
  const [encendido, setEncendido] = useState<boolean>(false);
  const navigate = useNavigate();
  const idUser = 1; // Replace with actual user ID logic

  const mapCountryToIdLanguage = (country: string): number => {
    switch (country.toLowerCase()) {
      case 'spain':
        return 1;
      case 'english':
        return 2;
      case 'france':
        return 3;
      default:
        return 1;
    }
  };

  const handleConfirm = async () => {
    const idLanguage = mapCountryToIdLanguage(country);
    const payload = {
      profile_name: profileName,
      real_name: realName,
      username,
      biography,
      idLanguage,
    };
  
    try {
      const response = await fetch(`http://localhost:3000/profile/${idUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || 'Error updating profile');
        } else {
          throw new Error('Error updating profile');
        }
      }
  
      navigate('/Configuration');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Hubo un problema actualizando el perfil.');
    }
  };
  
  

  const toggleEncendido = () => {
    setEncendido(!encendido);
  };

  return (
    <div className="edit-profile-container">
      <Header />
      
      {/* General Section */}
      <div className="edit-profile-section general">
        <h2 className="edit-profile-header">GENERAL</h2>
        <form className="edit-profile-form">
          <label htmlFor="profile_name">PROFILE NAME:</label>
          <input
            type="text"
            id="profile_name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="edit-profile-input"
          />

          <label htmlFor="real_name">REAL NAME:</label>
          <input
            type="text"
            id="real_name"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="edit-profile-input"
          />

          <label htmlFor="username">USERNAME:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="edit-profile-input"
          />

          <label htmlFor="biography">BIOGRAPHY:</label>
          <input
            type="text"
            id="biography"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            className="edit-profile-input"
          />
        </form>
      </div>
      
      {/* Location Section */}
      <div className="edit-profile-section location">
        <h2 className="edit-profile-header">LOCATION</h2>
        <form>
          <label htmlFor="country">COUNTRY:</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="edit-profile-input"
          >
            <option value="spain">Spain</option>
            <option value="italy">Italy</option>
            <option value="france">France</option>
            <option value="germany">Germany</option>
          </select>
        </form>
      </div>
      
      {/* Preferences Section */}
      <div className="edit-profile-section preferences">
        <h2 className="edit-profile-header">PREFERENCES</h2>
        <div className="preference-container">
          <p>{encendido ? 'Store preferences enabled' : 'Store preferences disabled'}</p>
          <div
            className={`preference-switch ${encendido ? 'on' : 'off'}`}
            onClick={toggleEncendido}
          >
            <div className="slider"></div>
          </div>
        </div>
      </div>
      
      <button className="confirm-button" onClick={handleConfirm}>
        Change
      </button>
    </div>
  );
};

export default EditProfile;