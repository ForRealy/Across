import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent";
import "../styles/CartPage.css";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

interface CartItem {
  id: number;
  game_id: number;
  quantity: number;
  gameData?: {
    title: string;
    cover: string;
    price?: number;
  };
}

interface CartResponse {
  items: CartItem[];
  total: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<string>("0.00");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    name: "",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Cargar el carrito desde el backend
  useEffect(() => {
    const loadCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get<CartResponse>("http://localhost:3000/api/cart", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCartItems(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    loadCart();
  }, [navigate]);

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete("http://localhost:3000/api/cart", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCartItems([]);
      setTotal("0.00");
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const removeFromCart = async (gameId: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    await axios.delete(`http://localhost:3000/api/cart/remove/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    setCartItems(prevItems => {
      return prevItems.map(item => 
        item.game_id === gameId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ).filter(item => item.quantity > 0);
    });

    // Obtener el carrito actualizado
    const response = await axios.get<CartResponse>("http://localhost:3000/api/cart", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setTotal(response.data.total);

  } catch (error) {
    console.error("Error al eliminar juego del carrito:", error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      navigate('/login');
    }
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
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Enviar los juegos comprados al backend
        await axios.post("http://localhost:3000/api/cart/checkout", 
          { cart: cartItems },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        clearCart();
      } catch (error) {
        console.error("Error en el pago:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
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

            {cartItems.length === 0 ? (
              <p className="cart-empty-message">Tu carrito está vacío.</p>
            ) : (
              <div className="cart-list-section">
                <ol className="cart-list">
                  {cartItems.map((item) => (
                    <li key={item.id} className="cart-game-item">
                      {item.gameData?.title || `Juego #${item.game_id}`} (x{item.quantity})
                      {item.gameData?.price && (
                        <span className="cart-item-price">
                          ${item.gameData.price * item.quantity}
                        </span>
                      )}
                      <button
                        onClick={() => removeFromCart(item.game_id)}
                        className="cart-remove-button"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="cart-total">
                  <span>Total: ${total}</span>
                </div>
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
                <div className="cart-form-row">
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
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="cart-payment-button"
                  onClick={handlePayment}
                  disabled={cartItems.length === 0}
                >
                  Pagar ${total}
                </button>
              </form>
            </div>

            {paymentSuccess && (
              <div className="cart-payment-success">
                <h3>¡Pago exitoso!</h3>
                <p>Gracias por tu compra. Tu pedido será procesado.</p>
              </div>
            )}

            <button className="cart-back-button" onClick={() => navigate("/library")}>
              Volver a la Biblioteca
            </button>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Cart; 