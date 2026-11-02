import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// POST: Register a new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { email, password } = req.body;

	try {
		// Check if user with this email already exists
		const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
		if (existingUser.rows.length > 0) {
			res.status(409).json({ error: "User with this email already exists" });
			return;
		}

		// Hash password with 10 salt rounds
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// Insert new user into PostgreSQL
		const newUser = await pool.query(
			"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
			[email, passwordHash],
		);

		res.status(201).json(newUser.rows[0]);
	} catch (error) {
		next(error);
	}
};

// POST: Login user and issue HttpOnly cookie
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { email, password } = req.body;

	try {
		// Search user by email
		const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
		if (result.rows.length === 0) {
			res.status(401).json({ error: "Invalid email or password" });
			return;
		}

		const user = result.rows[0];

		// Compare plain password with stored hash
		const isPasswordValid = await bcrypt.compare(password, user.password_hash);
		if (!isPasswordValid) {
			res.status(401).json({ error: "Invalid email or password" });
			return;
		}

		// Generate JWT token (expires in 24 hours)
		const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

		// Send token inside an HttpOnly cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
		});

		res.json({
			message: "Login successful",
			user: { id: user.id, email: user.email },
		});
	} catch (error) {
		next(error);
	}
};

// POST: Logout user by clearing the token cookie
export const logout = (req: Request, res: Response): void => {
	res.clearCookie("token");
	res.json({ message: "Logged out successfully" });
};
