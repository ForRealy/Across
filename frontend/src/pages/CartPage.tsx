import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent"; // Asegúrate de tener el Header correctamente importado
import "../styles/CartPage.css"; // Importa el archivo CSS con los estilos mencionados
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

interface CartItem {
  productId: string;
  quantity: number;
}

interface Cart {
  id: string;
  products: CartItem[];
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ id: 'default', products: [] });
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    name: "",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Cargar el carrito desde el backend (o almacenamiento local)
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/cart", {
          withCredentials: true
        });
        setCart(response.data);
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
      }
    };

    loadCart();
  }, []);

  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:3000/api/cart", {
        withCredentials: true
      });
      setCart({ id: 'default', products: [] });
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
    }
  };

  const removeFromCart = async (game: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/remove/${game}`, {
        withCredentials: true
      });
      setCart({
        ...cart,
        products: cart.products.filter(item => item.productId !== game)
      });
    } catch (error) {
      console.error("Error al eliminar juego del carrito:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handlePayment = async () => {
    const { cardNumber, expirationDate, cvv, name } = paymentData;
    if (cardNumber && expirationDate && cvv && name) {
      setPaymentSuccess(true);
      try {
        // Enviar los juegos comprados al backend
        await axios.post("http://localhost:3000/api/cart/checkout", 
          { cart: cart.products },
          { withCredentials: true }
        );
        clearCart();
      } catch (error) {
        console.error("Error en el pago:", error);
      }
    } else {
      alert("Por favor, completa todos los campos de pago.");
    }
  };

  return (
    <div>
      <Header />
      <div className="page-container">
        <div className="cart-container">
          <main className="cart-content">
            <h1 className="cart-title">Carrito de Compras</h1>

            {cart.products.length === 0 ? (
              <p className="cart-empty-message">Tu carrito está vacío.</p>
            ) : (
              <div className="cart-list-section">
                <ol className="cart-list">
                  {cart.products.map((item, index) => (
                    <li key={index} className="cart-game-item">
                      {item.productId} (x{item.quantity})
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="cart-remove-button"
                      >
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
      </div>
    </div>
  );
};

export default Cart;
