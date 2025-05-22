import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "./AddToCartButtonComponent";
import "../styles/GameHeaderComponent.css";

interface GameHeaderProps {
  title: string;
  gameId?: number;
  daysRemaining?: number;
  releaseDate?: string; 
}


const GameHeader: React.FC<GameHeaderProps> = ({ title, gameId, daysRemaining, releaseDate }) => {  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>();
  const [error, setError] = useState<string>("");

  const goBack = () => navigate(-1);

  const isPurchasable = gameId !== undefined && (daysRemaining === undefined || daysRemaining <= 0);

  return (
    <div className="gamepage-header">
      <h1 className="gamepage-title">{title}</h1>
      <div className="gamepage-action-buttons">
        <button onClick={goBack} className="btn-back">Go Back</button>
        {isPurchasable ? (
          <AddToCartButton 
          gameId={gameId} 
          status={status} 
          setStatus={setStatus} 
          setError={setError} 
          releaseDate={releaseDate}
        />
        ) : (
          <p className="gamepage-preorder-warning">
            Not available for purchase yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
