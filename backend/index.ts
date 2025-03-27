import express, { Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const app = express();

app.use(cors());
app.use(express.json());

// Configura el pool de conexiones con MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "usuario",
  database: "across",
});

const saltRounds = 10;

// Endpoint para registrar usuarios
app.post("/api/register", async (req: Request, res: Response): Promise<void> => {
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
});

// Endpoint para hacer login de usuarios
app.post("/api/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  console.log("🔑 Intento de login para:", username);

  if (!username || !password) {
    res.status(400).json({ error: "Faltan datos obligatorios" });
    return;
  }

  try {
    // Realiza la consulta para obtener el usuario por su username
    const [rows]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    console.log("Resultados de la consulta:", rows);

    // Si no se encuentra el usuario, se responde con un error
    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const user = rows[0];

    // Verifica si la contraseña existe en la base de datos antes de compararla
    if (!user.password) {
      console.log("❌ Contraseña no encontrada en la base de datos");
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Compara la contraseña ingresada con la almacenada en la base de datos
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log("❌ Contraseña incorrecta");
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Si el login es exitoso, responde con los datos del usuario
    console.log("✅ Login exitoso para:", username);
    res.json({ message: "Login exitoso", user });
  } catch (error: any) {
    // Si ocurre un error en el proceso, responde con un error 500
    console.error("❌ Error en login:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Error en el servidor", details: error.message });
  }
});

// Configurar puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
