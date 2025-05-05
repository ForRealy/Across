import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

interface SessionRequest extends Request {
  session?: {
    user?: {
      username: string;
    };
  };
}

// Se define el número de "salt rounds" para bcrypt, determinando el coste computacional del hash.
const saltRounds = 10;

// Función para registrar un nuevo usuario.
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  // Se extraen de req.body los campos esperados para el registro del usuario.
  const { 
    profile_name, 
    email, 
    password,
    real_name,
    username,
    biography 
  } = req.body;
  // Se valida que los campos obligatorios estén presentes.
  if (!profile_name || !email || !password || !username) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  try {
    // Se hashea la contraseña utilizando bcrypt y el coste definido en saltRounds.
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Se realiza una consulta SQL para insertar un nuevo usuario en la tabla 'users'.
    // Los campos opcionales (real_name y biography) se asignan a null si no se proporcionan.
    const [result]: any = await pool.query(
      "INSERT INTO users (profile_name, email, password, real_name, username, biography) VALUES (?, ?, ?, ?, ?, ?)",
      [
        profile_name,
        email, 
        hashedPassword, 
        real_name || null, 
        username, 
        biography || null
      ]
    );
    // Si la inserción es exitosa, se envía una respuesta con código 201 (creado) y se retorna el id del nuevo usuario.
    res.status(201).json({ message: "Usuario registrado", id: result.insertId });
  } catch (error: any) {
    
    // Se maneja el error específico de clave duplicada.
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "El email o username ya están en uso" });
      return;
    }
    // Para cualquier otro error, se retorna un error 500 con detalles del problema.
    res.status(500).json({ error: "Error al registrar el usuario", details: error.message });
  }
};

// Función para el login del usuario.
export const loginUser = async (req: SessionRequest, res: Response): Promise<void> => {
  // Se extraen del cuerpo de la solicitud los campos necesarios.
  const { username, password } = req.body;

  // Se verifica que se hayan proporcionado ambos datos obligatorios.
  if (!username || !password) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  try {
    // Se realiza una consulta a la base de datos para obtener el usuario que coincida con el username.
    const [rows]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    // Si no se encuentra ningún usuario con ese username, se devuelve un error 401.
    if (rows.length === 0) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }

    const user = rows[0];

    // Se utiliza bcrypt.compare para verificar que la contraseña proporcionada coincida con la contraseña hasheada almacenada.
    const validPassword = await bcrypt.compare(password, user.password);

    // Si la contraseña no es válida, se retorna un error 401.
    if (!validPassword) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

    // Set user in session
    req.session!.user = {
      username: user.username
    };

    // En caso de cualquier error inesperado durante el proceso, se devuelve un error 500 con detalles.
    res.json({ message: "Login exitoso", user });
  } catch (error: any) {
    res.status(500).json({ error: "Error en el login", details: error.message });
  }
};