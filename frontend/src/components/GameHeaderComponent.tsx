import React from "react";

interface GameHeaderProps {
  title: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title }) => {
  return (
    <div className="gamepage-header">
      <h1 className="gamepage-title">{title}</h1>
      <div className="gamepage-action-buttons">
        <button className="btn-gray">Ignore</button>
        <button className="btn-gray">Follow</button>
        <button className="btn-gray">Wishlist ❤️</button>
        <button className="btn-gray">Browse All DLCs</button>
        <button className="btn-gray">Community Hub</button>
      </div>
    </div>
  );
};

export default GameHeader;
