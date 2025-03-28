import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

const saltRounds = 10;

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { profile_name, email, password, real_name, username, biography } = req.body;

  console.log("📩 Datos recibidos:", req.body);

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
    
    console.log("✅ Usuario registrado con ID:", result.insertId);
    res.status(201).json({ message: "Usuario registrado correctamente", id: result.insertId });
  } catch (error: any) {
    console.error("❌ Error al registrar usuario:", error);
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "El email o username ya están en uso" });
      return;
    }
    res.status(500).json({ error: "Error al registrar el usuario", details: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  console.log("🔑 Intento de login para:", username);

  if (!username || !password) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  try {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log("❌ Contraseña incorrecta");
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    console.log("✅ Login exitoso para:", username);
    res.json({ message: "Login exitoso", user });
  } catch (error: any) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ error: "Error en el servidor", details: error.message });
  }
};