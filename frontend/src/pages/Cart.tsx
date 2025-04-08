import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Cart.css";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    name: "",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const removeFromCart = (game: string) => {
    const updatedCart = cart.filter(item => item !== game);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handlePayment = () => {
    const { cardNumber, expirationDate, cvv, name } = paymentData;
    if (cardNumber && expirationDate && cvv && name) {
      setPaymentSuccess(true);
      const purchasedGames = JSON.parse(localStorage.getItem("purchasedGames") || "[]");
      const newPurchasedGames = [...purchasedGames, ...cart];
      localStorage.setItem("purchasedGames", JSON.stringify(newPurchasedGames));
      clearCart();
    } else {
      alert("Por favor, completa todos los campos de pago.");
    }
  };

  return (
    <div className="cart-container">
      <Header />
      <main className="cart-content">
        <h1 className="cart-title">Carrito de Compras</h1>

        {cart.length === 0 ? (
          <p className="cart-empty-message">Tu carrito está vacío.</p>
        ) : (
          <div className="cart-list-section">
            <ol className="cart-list">
              {cart.map((game, index) => (
                <li key={index} className="cart-game-item">
                  {game}
                  <button onClick={() => removeFromCart(game)} className="cart-remove-button">
                    Eliminar
                  </button>
                </li>
              ))}
            </ol>
            <button className="cart-clear-button" onClick={clearCart}>
              Vaciar Carrito
            </button>
          </div>
        )}

        <div className="cart-payment-section">
          <h2 className="cart-payment-title">Datos de Pago</h2>
          <form className="cart-payment-form">
            <div className="cart-form-group">
              <label htmlFor="name">Nombre en la tarjeta</label>
              <input
                type="text"
                id="name"
                name="name"
                value={paymentData.name}
                onChange={handleInputChange}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="cart-form-group">
              <label htmlFor="cardNumber">Número de tarjeta</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                placeholder="**** **** **** ****"
                required
              />
            </div>
            <div className="cart-form-group">
              <label htmlFor="expirationDate">Fecha de expiración</label>
              <input
                type="text"
                id="expirationDate"
                name="expirationDate"
                value={paymentData.expirationDate}
                onChange={handleInputChange}
                placeholder="MM/AA"
                required
              />
            </div>
            <div className="cart-form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentData.cvv}
                onChange={handleInputChange}
                placeholder="***"
                required
              />
            </div>
            <button
              type="button"
              className="cart-pay-button"
              onClick={handlePayment}
            >
              Pagar
            </button>
          </form>
        </div>

        {paymentSuccess && (
          <div className="cart-payment-success">
            <h3>¡Pago exitoso!</h3>
            <p>Gracias por tu compra. Tu pedido será procesado.</p>
          </div>
        )}
        
        <button className="cart-back-button" onClick={() => navigate("/home")}>
          Volver a la Biblioteca
        </button>
      </main>
    </div>
  );
};

export default Cart;
