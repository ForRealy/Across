import express from 'express';
import cors from 'cors';
import cartRoutes from './routes/cartRoutes'; // Importa las rutas del carrito
const app = express();
// Middlewares
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend
app.use(express.json()); // Habilita el análisis de JSON en las solicitudes
// Rutas
app.use('/api', cartRoutes); // Usa las rutas del carrito bajo el prefijo /api
export default app; // Exporta la instancia de la aplicación para usarla en index.ts
