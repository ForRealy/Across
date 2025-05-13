import React from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "../styles/AddToCartButtonComponent.css"; // Importar el CSS específico

interface AddToCartButtonProps {
  gameId: number;
  status: 'loading' | 'success' | 'error' | undefined;
  setStatus: (status: 'loading' | 'success' | 'error' | undefined) => void;
  setError: (error: string) => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  gameId, 
  status, 
  setStatus,
  setError
}) => {
  const navigate = useNavigate();

  const handleAddToCart = async () => {
  setStatus("loading");

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Verificar si el juego ya está en Downloads antes de agregarlo al carrito
    const checkDownloads = await axios.get(`http://localhost:3000/api/downloads/check/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (checkDownloads.status === 200 && checkDownloads.data.isDownloaded) {
      window.alert("Este juego ya está en tu lista de descargas.");
      setStatus(undefined); // Restablecer estado
      return;
    }

    // ✅ Intentar agregar al carrito
    const response = await axios.post(
      "http://localhost:3000/api/cart/add",
      { productId: gameId },
      { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
    );

    if (response.status === 409) {
      window.alert("Este juego ya está en tu carrito.");
      setStatus(undefined); // Restablecer estado
      return;
    }

    if (response.data.success) {
      setStatus("success");
      setTimeout(() => setStatus(undefined), 2000);
    } else {
      throw new Error(response.data.message || "Error al agregar al carrito");
    }
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error("Error adding to cart:", err);
      setStatus("error");
      setError(err.response?.data?.message || "Error al agregar al carrito");
      setTimeout(() => setStatus(undefined), 3000);
    }
  }
};



  return (
    <button
      className={`add-to-cart-button ${
        status === 'loading' ? 'loading' : 
        status === 'success' ? 'success' :
        status === 'error' ? 'error' : ''
      }`}
      onClick={handleAddToCart}
      disabled={status === 'loading'}
    >
      {status === 'loading' ? 'Añadiendo...' :
       status === 'success' ? '✓ Añadido' :
       status === 'error' ? 'Error' : 'Añadir al carrito'}
    </button>
  );
};

export default AddToCartButton;
