// server.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import cartRoutes from './routes/cartRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Usa las rutas correctamente
app.use("/api/auth", authRoutes);  // Rutas de autenticación
app.use("/api/cart", cartRoutes);  // Rutas del carrito

export default app;
