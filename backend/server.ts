import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Monta rutas existentes
app.use("/api/", authRoutes);
app.use("/api/games", gamesRoutes);

export default app;