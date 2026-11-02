import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import "./db";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth";
import snippetsRouter from "./routes/snippets";

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());
app.use(cookieParser());

// Interactive Swagger UI documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Custom middleware to log incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	// Pass control to the next middleware or route handler
	next();
});

// 2. Mount auth routes under the /api/auth base path
app.use("/api/auth", authRouter);
app.use("/api/snippets", snippetsRouter);

app.use("/", (req, res) => {
	res.json({ message: "Welcome on SnippetsAPI!" });
});

// Global Error Handler MUST be registered after all routes and routers
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});
