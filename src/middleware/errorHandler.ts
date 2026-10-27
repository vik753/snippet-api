import { Request, Response, NextFunction } from "express";

// Global error handling middleware signature requires 4 parameters
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: NextFunction,
): void => {
	console.error(`[Global Error] ${err.message}`, err.stack);

	res.status(500).json({
		error: "Internal Server Error",
		message: process.env.NODE_ENV === "development" ? err.message : undefined,
	});
};
