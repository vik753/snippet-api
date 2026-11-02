import { Pool } from "pg";
import dotenv from "dotenv";

// Loading data fron .env file
dotenv.config();

// Create a connection pool, using connectionString
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// Check connection when initializing file
pool
	.connect()
	.then(() => console.log("Connected to PostgreSQL successfully!"))
	.catch((err) => console.error("Database connection error", err.stack));

export default pool;
