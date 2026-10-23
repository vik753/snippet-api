import express, { NextFunction, Request, Response } from "express";
import snippetsRouter from "./routes/snippets";

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Custom middleware to log incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	// Pass control to the next middleware or route handler
	next();
});

// Mount the snippets router at the /api/snippets path
app.use("/api/snippets", snippetsRouter);

app.use("/", (req, res) => {
	res.json({ message: "Welcome on SnippetsAPI!" });
});

app.listen(PORT, () => {
	console.log(`Server is running on: http://localhost:${PORT}`);
});
