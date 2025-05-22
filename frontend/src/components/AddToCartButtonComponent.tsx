import React from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "../styles/AddToCartButtonComponent.css";

interface AddToCartButtonProps {
  gameId: number;
  status: 'loading' | 'success' | 'error' | undefined;
  setStatus: (status: 'loading' | 'success' | 'error' | undefined) => void;
  setError: (error: string) => void;
  releaseDate?: string; 
}

interface ErrorResponse {
  message: string;
}


const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  gameId, 
  status, 
  setStatus,
  setError,
  releaseDate // Recibe aquí
}) => {
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (releaseDate) {
      const release = new Date(releaseDate);
      const today = new Date();
      if (release > today) {
        window.alert("Este juego aún no está disponible para su compra.");
        return;
      }
    }
  
    setStatus("loading");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const checkDownloads = await axios.get(
        `http://localhost:3000/api/downloads/check/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );
      if (checkDownloads.data.isDownloaded) {
        window.alert("Ya está en tus descargas.");
        setStatus(undefined);
        return;
      }

      const resp = await axios.post(
        "http://localhost:3000/api/cart/add",
        { productId: gameId },
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );
      if (resp.status === 409) {
        window.alert("Ya está en tu carrito.");
        setStatus(undefined);
        return;
      }
      if (resp.data.success) {
        setStatus("success");
        setTimeout(() => setStatus(undefined), 2000);
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
    
      console.error("Error adding to cart:", axiosErr);
    
      setStatus("error");
    
      if (
        axiosErr.response?.data &&
        typeof axiosErr.response.data === "object" &&
        "message" in axiosErr.response.data
      ) {
        const data = axiosErr.response.data as ErrorResponse;
        setError(data.message);
      } else {
        setError("Error al agregar al carrito");
      }
      
    
      setTimeout(() => setStatus(undefined), 3000);
    }
    
  };

  return (
    <button
      className={`add-to-cart-button ${status}`}
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