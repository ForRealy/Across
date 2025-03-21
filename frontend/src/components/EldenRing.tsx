import React, { useState } from "react";
//import { Link } from "react-router-dom";
import Header from "./Header";
import "../assets/EldenRing.css";

const EldenRing: React.FC = () => {
    const images = [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_6c4054e39017dc920df2d00515f1d6782b23845b.1920x1080.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
        "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_eaeb91e0f042d1733d2f13f1c3a8490438f2ef56.1920x1080.jpg"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    return (
        <div className="container">
            <Header username="Player123" />

            {/* Título y botones */}
            <div className="game-header">
                <h1>Elden Ring</h1>
                <div className="buttons">
                    <button className="gray-btn">Ignore</button>
                    <button className="gray-btn">Follow</button>
                    <button className="gray-btn">Wishlist ❤️</button>
                    <button className="gray-btn">Browse All DLCs</button>
                    <button className="gray-btn">Community Hub</button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="game-content">
                {/* Sección Izquierda */}
                <div className="game-left">
                    <img src={images[currentImageIndex]} alt="Juego" className="main-image" />
                    <div className="thumbnails">
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Thumbnail ${index}`}
                                className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                    <div>
                        <p><strong>Elden Ring</strong></p>
                        <p>WEEKEND DEAL! Offer ends 19 October</p>
                    </div>
                    <div>
                        <p><strong>Elden Ring Deluxe Edition</strong></p>
                        <p>WEEKEND DEAL! Offer ends 19 October</p>
                        <div>
                            <p><strong>Includes:</strong></p>
                            <p>Elden ring(full game)</p>
                            <p>Digital Artbook & Original Soundtrack</p>
                        </div>
                    </div>
                    <div>
                    <ul className="game-features">
                        <li>
                            <strong>A Vast World Full of Excitement</strong>
                            <p>A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected. As you explore, the joy of discovering unknown and overwhelming threats await you, leading to a high sense of accomplishment.</p>
                        </li>
                        <li>
                            <strong>Create Your Own Character</strong>
                            <p>In addition to customizing the appearance of your character, you can freely combine the weapons, armor, and magic that you equip. You can develop your character according to your play style, such as increasing your muscle strength to become a strong warrior, or mastering magic.</p>
                        </li>
                        <li>
                            <strong>An Epic Drama Born from a Myth</strong>
                            <p>A multilayered story told in fragments. An epic drama in which the various thoughts of the characters intersect in the Lands Between.</p>
                        </li>
                        <li>
                            <strong>Unique Online Play that Loosely Connects You to Others</strong>
                            <p>In addition to multiplayer, where you can directly connect with other players and travel together, the game supports a unique asynchronous online element that allows you to feel the presence of others.</p>
                        </li>
                    </ul>
                    </div>
                    <div>
                        <p><strong>System Requirements</strong></p>
                        <button>Windows</button>
                        <button>macOS</button>
                        <button>Linux + SteamOS</button>
                    </div>

                    <div className="requirements">
                        <div className="requirement-box">
                            <p><strong>Minimum</strong></p>
                            <p>Requires a 64-bit processor and operating system</p>
                            <p><strong>OS:</strong> Windows 10</p>
                            <p><strong>Processor:</strong> INTEL CORE I5-8400 or AMD RYZEN 3 3300X</p>
                            <p><strong>Memory:</strong> 12GB RAM</p>
                            <p><strong>Graphics:</strong> NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB</p>
                            <p><strong>DirectX:</strong> Version 12</p>
                            <p><strong>Storage:</strong> 60GB available space</p>
                            <p><strong>Sound Card:</strong> Windows Compatible Audio Device</p>
                        </div>

                        <div className="requirement-box">
                            <p><strong>Recommended</strong></p>
                            <p>Requires a 64-bit processor and operating system</p>
                            <p><strong>OS:</strong> Windows 10/11</p>
                            <p><strong>Processor:</strong> INTEL CORE I7-8700K or AMD RYZEN 5 3600X</p>
                            <p><strong>Memory:</strong> 16GB RAM</p>
                            <p><strong>Graphics:</strong> NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB</p>
                            <p><strong>DirectX:</strong> Version 12</p>
                            <p><strong>Storage:</strong> 60GB available space</p>
                            <p><strong>Sound Card:</strong> Windows Compatible Audio Device</p>
                        </div>
                    </div>

                </div>

                {/* Sección Derecha */}
                <div className="game-right">
                    <img src={images[0]} alt="Elden Ring" className="side-image" />
                    <p className="description">
                        THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.
                    </p>
                    <div className="game-info">
                        <p><strong>Reviews:</strong></p>
                        <p><strong>Past Month</strong></p>
                        <p><strong>All Time</strong></p>
                        <p><strong>Release Date:</strong> February 25, 2022</p>
                        <p><strong>Developer:</strong> FromSoftware</p>
                        <p><strong>Publisher:</strong> FromSoftware, Bandai Namco Entertainment</p>
                        <p><strong>Tags:</strong> Souls-like, Dark Fantasy, Open World</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EldenRing;
