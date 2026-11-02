import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest<P = ParamsDictionary> extends Request<P> {
	user?: {
		userId: number;
		email: string;
	};
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	// 1. Try to extract token from standard Authorization header (Bearer <token>)
	const authHeader = req.headers.authorization;
	const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

	// 2. Fallback to HttpOnly cookie
	const token = req.cookies?.token || bearerToken;

	if (!token) {
		res.status(401).json({ error: "Access denied. Authentication required." });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
			userId: number;
			email: string;
		};

		req.user = decoded;
		next();
	} catch (error) {
		res.status(403).json({ error: "Invalid or expired token." });
	}
};
