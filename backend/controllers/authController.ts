import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import jwt from "jsonwebtoken";

// Define tipos para sesiones si estás usando express-session (opcional)
import { Session, SessionData } from "express-session";

interface SessionRequest extends Request {
  session: Session & Partial<SessionData> & {
    user?: {
      id: number;
      username: string;
      email: string;
    };
  };
}

const saltRounds = 10;

// --- REGISTER USER ---
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { profile_name, email, password, real_name, username, biography } = req.body;

  if (!profile_name || !email || !password || !username) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result]: any = await pool.query(
      "INSERT INTO users (profile_name, email, password, real_name, username, biography) VALUES (?, ?, ?, ?, ?, ?)",
      [profile_name, email, hashedPassword, real_name || null, username, biography || null]
    );

    res.status(201).json({ message: "Usuario registrado", id: result.insertId });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "El email o username ya están en uso" });
      return;
    }
    res.status(500).json({ error: "Error al registrar el usuario", details: error.message });
  }
};

// --- LOGIN USER ---
export const loginUser = async (req: SessionRequest, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  try {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length === 0) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }

    const user = rows[0];

    if (!user.password) {
      res.status(500).json({ error: "Contraseña no encontrada en base de datos" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

    // Genera el token JWT
    const token = jwt.sign(
      { idUser: user.idUser, username: user.username, email: user.email },
      "tu_secreto_super_seguro",
      { expiresIn: "24h" }
    );

    if (req.session) {
      req.session.user = {
        id: user.idUser,
        username: user.username,
        email: user.email
      };
    }

    res.json({
      message: "Login exitoso",
      token,
      user: {
        idUser: user.idUser,
        username: user.username,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ error: "Error en el login", details: error.message });
  }
};
