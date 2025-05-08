import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env') });

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'usuario',
    database: process.env.DB_NAME || 'across',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database tables
const initDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Create users table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                idUser INT PRIMARY KEY AUTO_INCREMENT,
                profile_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                real_name VARCHAR(255),
                username VARCHAR(255) NOT NULL UNIQUE,
                number_phone VARCHAR(20),
                biography TEXT,
                foto VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create languages table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS languages (
                idLanguage INT PRIMARY KEY AUTO_INCREMENT,
                language_name VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // Create games table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS games (
                idGame INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                releaseDate DATE NOT NULL,
                publisher VARCHAR(255),
                developer VARCHAR(255),
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                idLanguage INT,
                FOREIGN KEY (idLanguage) REFERENCES languages(idLanguage)
            )
        `);

        // Create review table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS review (
                idReview INT PRIMARY KEY AUTO_INCREMENT,
                idGame INT NOT NULL,
                idUser INT NOT NULL,
                review_type VARCHAR(50),
                description TEXT,
                recommended TINYINT(1),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (idUser) REFERENCES users(idUser),
                FOREIGN KEY (idGame) REFERENCES games(idGame),
                INDEX idx_game_reviews (idGame)
            )
        `);

        // Insert default languages if they don't exist
        await connection.query(`
            INSERT IGNORE INTO languages (language_name) VALUES 
            ('español'),
            ('inglés'),
            ('catalán')
        `);

        connection.release();
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// Run initialization
initDatabase().catch(console.error);

export default pool;