import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/Cart.css";

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

  // Cargar el carrito desde localStorage al montar el componente
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const clearCart = () => {
    // Limpiar el carrito y actualizar localStorage
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  const handlePayment = () => {
    if (
      paymentData.cardNumber &&
      paymentData.expirationDate &&
      paymentData.cvv &&
      paymentData.name
    ) {
      // Simulación de pago exitoso
      setPaymentSuccess(true);
      // Guardar los juegos comprados en localStorage bajo una clave 'purchasedGames'
      const purchasedGames = JSON.parse(localStorage.getItem("purchasedGames") || "[]");
      const newPurchasedGames = [...purchasedGames, ...cart];
      localStorage.setItem("purchasedGames", JSON.stringify(newPurchasedGames));
      clearCart(); // Vaciar carrito después del pago exitoso
    } else {
      alert("Por favor, completa todos los campos de pago.");
    }
  };

  return (
    <div className="container">
      <Header username="Player123" />
      <main className="content">
        <h1>Carrito de Compras</h1>
        {cart.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            <ul>
              {cart.map((game, index) => (
                <li key={index}>{game}</li>
              ))}
            </ul>
            <button onClick={clearCart}>Vaciar Carrito</button>
          </>
        )}

        {/* Sección de pago */}
        <div className="payment-section">
          <h2>Datos de Pago</h2>
          <form>
            <div className="form-group">
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
            <div className="form-group">
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
            <div className="form-group">
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
            <div className="form-group">
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
            <button type="button" onClick={handlePayment}>
              Pagar
            </button>
          </form>
        </div>

        {/* Mensaje de éxito de pago */}
        {paymentSuccess && (
          <div className="payment-success">
            <h3>¡Pago exitoso!</h3>
            <p>Gracias por tu compra. Tu pedido será procesado.</p>
          </div>
        )}

        <button onClick={() => navigate("/home")}>Volver a la Biblioteca</button>
      </main>
    </div>
  );
};

export default Cart;
