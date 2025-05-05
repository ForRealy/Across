import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/HeaderComponent";
import "../styles/GamesPage.css";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

const GamesPage: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const gameTitle = title?.replace(/-/g, ' ') || "Game";

  const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_6c4054e39017ssdc920df2d00515f1d6782b23845b.1920x1080.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0sKsssvELKFQWecENideIjHmw&s",
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_eaeb91e0f042d1733d2f13f1c3a8490438f2ef56.1920x1080.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const savedCartId = localStorage.getItem("cartId");

        if (savedCartId) {
          await axios.get(`http://localhost:3000/api/carts/${savedCartId}`, {
            withCredentials: true
          });
          setCartId(savedCartId);
        } else {
          const response = await axios.post("http://localhost:3000/api/carts", {}, {
            withCredentials: true
          });
          const newCartId = response.data.id;
          localStorage.setItem("cartId", newCartId);
          setCartId(newCartId);
        }
      } catch (error) {
        console.error("Error initializing cart:", error);
        const response = await axios.post("http://localhost:3000/api/carts", {}, {
          withCredentials: true
        });
        const newCartId = response.data.id;
        localStorage.setItem("cartId", newCartId);
        setCartId(newCartId);
      }
    };

    initializeCart();
  }, []);

  const addToCart = async () => {
    if (!cartId) return;

    try {
      const productId = title || "";
      await axios.post(`http://localhost:3000/api/carts/${cartId}/product/${productId}`, {
        quantity: 1
      });

      alert("Producto añadido al carrito correctamente");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al añadir al carrito");
    }
  };

  return (
    <div className="gamepage-container">
      <Header />

      <div className="gamepage-header">
        <h1 className="gamepage-title">{gameTitle}</h1>
        <div className="gamepage-action-buttons">
          <button className="btn-gray">Ignore</button>
          <button className="btn-gray">Follow</button>
          <button className="btn-gray">Wishlist ❤️</button>
          <button className="btn-gray">Browse All DLCs</button>
          <button className="btn-gray">Community Hub</button>
        </div>
      </div>

      <div className="gamepage-main-content">
        <div className="gamepage-left-column">
          <div className="gamepage-media-section">
            <img src={images[currentImageIndex]} alt="Juego" className="gamepage-main-image" />
            <div className="gamepage-cart-buttons">
              <button onClick={addToCart} className="btn-cart">Add to cart</button>
            </div>
          </div>

          <div className="gamepage-thumbnails-section">
            <div className="gamepage-thumbnail-row">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index}`}
                  className={`gamepage-thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="gamepage-edition-info">
            <p><strong>{gameTitle}</strong></p>
            <p>WEEKEND DEAL! Offer ends 19 October</p>

            <p><strong>{gameTitle} Deluxe Edition</strong></p>
            <p>WEEKEND DEAL! Offer ends 19 October</p>

            <p><strong>Includes:</strong></p>
            <p>{gameTitle} (full game)</p>
            <p>Digital Artbook & Original Soundtrack</p>
          </div>
        </div>

        <div className="gamepage-right-column">
          <img src={images[0]} alt={gameTitle} className="gamepage-side-image" />
          <p className="gamepage-description">
            THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the {gameTitle}.
          </p>
          <div className="gamepage-info-panel">
            <p><strong>Reviews:</strong> Very Positive</p>
            <p><strong>Release Date:</strong> February 25, 2022</p>
            <p><strong>Developer:</strong> FromSoftware</p>
            <p><strong>Publisher:</strong> Bandai Namco</p>
            <p><strong>Tags:</strong> Souls-like, Dark Fantasy, Open World</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
