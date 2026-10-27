import { Pool } from "pg";
import dotenv from "dotenv";

// Загружаем переменные из .env файла
dotenv.config();

// Создаем пул подключений, используя строку подключения
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// Проверяем соединение при инициализации файла
pool
	.connect()
	.then(() => console.log("Connected to PostgreSQL successfully!"))
	.catch((err) => console.error("Database connection error", err.stack));

// Экспортируем пул для использования в наших роутах
export default pool;
