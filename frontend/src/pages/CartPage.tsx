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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
  let formattedValue = value;

    switch (name) {
      case "name":
        // Solo letras y espacios, máximo 100 caracteres
        formattedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 100);
        break;
      case "cardNumber":
        // Solo números, agrupar cada 4 dígitos
        formattedValue = value.replace(/\D/g, '')
          .slice(0, 16)
          .replace(/(\d{4})(?=\d)/g, '$1 ');
        break;
      case "expirationDate":
        // Formato MM/YY
        formattedValue = value.replace(/\D/g, '')
          .slice(0, 4)
          .replace(/(\d{2})(?=\d)/, '$1/');
        break;
      case "cvv":
        // Solo 3 dígitos
        formattedValue = value.replace(/\D/g, '').slice(0, 3);
        break;
    }

    setPaymentData({ ...paymentData, [name]: formattedValue });
  };

  const handlePayment = async () => {
    const { cardNumber, expirationDate, cvv, name } = paymentData;
  
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const cleanExpirationDate = expirationDate.replace(/\D/g, '');
  
    if (
      name.length < 3 ||
      cleanCardNumber.length !== 16 ||
      cleanExpirationDate.length !== 4 ||
      cvv.length !== 3
    ) {
      alert("Por favor, completa correctamente todos los campos de pago.");
      return;
    }
  
    setIsProcessingPayment(true); // Show spinner
  
    // Simulate 5s delay
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
  
        await axios.post("http://localhost:3000/api/cart/checkout", 
          { cart: cartItems },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
  
        clearCart();
        setPaymentSuccess(true);
      } catch (error) {
        console.error("Error en el pago:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsProcessingPayment(false); // Hide spinner
      }
    }, 5000);
  };
  

  return (
    <div>
      <Header />
      <div className="page-container">
        <div className="cart-container">
          <main className="cart-content">
            <h1 className="cart-title">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <p className="cart-empty-message">Your cart is empty.</p>
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
                        Delete
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="cart-total">
                  <span>Total: ${total}</span>
                </div>
                <button className="cart-clear-button" onClick={clearCart}>
                Empty Cart
                </button>
              </div>
            )}

            <div className="cart-payment-section">
              <h2 className="cart-payment-title">Payment Data</h2>
              <form className="cart-payment-form">
                <div className="cart-form-group">
                  <label htmlFor="name">Card Owner</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={paymentData.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="cart-form-group">
                  <label htmlFor="cardNumber">Card number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="cart-form-row">
                  <div className="cart-form-group">
                    <label htmlFor="expirationDate">Expiration date</label>
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
                  className="cart-pay-button"
                  onClick={handlePayment}
                  disabled={cartItems.length === 0}
                >
                  Pay ${total}
                </button>
                {isProcessingPayment && (
  <div className="cart-spinner-overlay">
    <div className="cart-spinner-box">
      <div className="spinner"></div>
    
    </div>
  </div>
)}


              </form>
            </div>

            {paymentSuccess && (
              <div className="cart-payment-success">
                <h3>Payment successful!</h3>
                <p>Thank you for your purchase. Your order will be processed.</p>
              </div>
            )}

            <button className="cart-back-button" onClick={() => navigate("/library")}>
            Return to Library
            </button>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Cart;