import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent";
import Spinner from "../components/Spinner";
import "../styles/CartPage.css";
import axios from "axios";

axios.defaults.withCredentials = true;

interface CartItem {
  id: number;
  game_id: number;
  quantity: number;
  gameData?: { title: string; cover: string; price?: number };
}

interface CartResponse { items: CartItem[]; total: string; }

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [loadingCart, setLoadingCart] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<string>("0.00");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    name: "",
  });
  const [expirationValid, setExpirationValid] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true); 
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const { data } = await axios.get<CartResponse>(
          "http://localhost:3000/api/cart",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartItems(data.items);
        setTotal(data.total);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoadingCart(false);
      }
    };
    loadCart();
  }, [navigate]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      await axios.delete("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems([]);
      setTotal("0.00");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const removeFromCart = async (gameId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      await axios.delete(
        `http://localhost:3000/api/cart/remove/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(prev => prev
        .map(item => item.game_id === gameId ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0)
      );
      const { data } = await axios.get<CartResponse>(
        "http://localhost:3000/api/cart",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTotal(data.total);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formatted = value;
    switch (name) {
      case 'name':
        formatted = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 100);
        break;
      case 'cardNumber':
        formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
        break;
      case 'expirationDate':
        formatted = value.replace(/\D/g, '').slice(0,4).replace(/(\d{2})(?=\d)/,'$1/');
        if (formatted.length === 5) {
          const [mm, yy] = formatted.split('/').map(v => parseInt(v,10));
          const now = new Date();
          const currYear = now.getFullYear() % 100;
          const currMonth = now.getMonth()+1;
          const validM = mm>=1 && mm<=12;
          const notExp = validM && (yy>currYear || (yy===currYear && mm>=currMonth));
          setExpirationValid(notExp);
        } else {
          setExpirationValid(true);
        }
        break;
      case 'cvv':
        formatted = value.replace(/\D/g,'').slice(0,3);
        break;
    }
    setPaymentData(prev => ({...prev, [name]: formatted}));
  };

  const handlePayment = async () => {
    const { name, cardNumber, expirationDate, cvv } = paymentData;
    const cleanCard = cardNumber.replace(/\s/g,'');
    const cleanExp = expirationDate.replace(/\D/g,'');

    let valid = true;
    let text = '';
    if (name.length < 3) { text = 'Nombre demasiado corto'; valid=false; }
    else if (cleanCard.length!==16) { text = 'Número de tarjeta incorrecto'; valid=false; }
    else if (cleanExp.length!==4 || !expirationValid) { text = 'Fecha de expiración inválida o expirada'; valid=false; }
    else if (cvv.length!==3) { text = 'CVV inválido'; valid=false; }

    if (!valid) { 
      setMessage({ text, type: 'error' });
      return;
    }

    setIsProcessingPayment(true);
    setMessage(null);
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        await axios.post("http://localhost:3000/api/cart/checkout", { cart: cartItems }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        clearCart();
        setMessage({ text: 'Payment successful! Thank you for your purchase.', type: 'success' });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsProcessingPayment(false);
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

            {loadingCart ? (
              <Spinner/>
            ) : cartItems.length === 0 ? (
              <p className="cart-empty-message">Your cart is empty.</p>
            ) : (
              <div className="cart-list-section">
                <ol className="cart-list">
                  {cartItems.map(item => (
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
              <form className="cart-payment-form" onSubmit={e => e.preventDefault()}>
                <div className="form-group">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    name="name"
                    value={paymentData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Expiration Date (MM/YY)</label>
                    <input
                      type="text"
                      name="expirationDate"
                      value={paymentData.expirationDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                  </div>
                </div>

                {message && (
                  <div
                    className="cart-payment-success"
                    style={{
                      backgroundColor: message.type === 'error' ? '#dc2626' : undefined,
                      marginBottom: '15px'
                    }}
                  >
                    <p>{message.text}</p>
                  </div>
                )}

                <button
                  type="button"
                  className="cart-pay-button"
                  onClick={handlePayment}
                  disabled={cartItems.length === 0 || isProcessingPayment}
                >
                  Pay ${total}
                </button>
                {isProcessingPayment && <Spinner message="Procesando pago..." />}
              </form>
            </div>

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