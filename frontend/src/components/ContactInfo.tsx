import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/ChangeEmail.css";

const ChangeEmail: React.FC = () => {
  
    const navigate = useNavigate(); 
    const confirm = () => {
        navigate('/Configuration');
    };

    return (
        <div className="change-email-container">
            <Header />
            
            <div className="change-email-section">
                <h2 className="change-email-title">GENERAL</h2>
                
                <form className="change-contact-form">
                    <label htmlFor="email" className="change-contact-label">Email:</label>
                    <input type="email" id="email" name="email" className="change-email-input" />
                </form>

                <form className="change-contact-form">
                    <label htmlFor="numberPhone" className="change-contact-label">Number phone:</label>
                    <input type="number" id="numberPhone" name="numberPhone" />
                </form>
            </div>
            
            <div className="change-email-button-container">
                <button onClick={confirm} className="change-email-button">Change</button>
            </div>
        </div>
    );
};

export default ChangeEmail;
