import { NextFunction, Response } from "express";
import pool from "../db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// GET: Fetch all snippets
export const getSnippets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await pool.query("SELECT * FROM snippets ORDER BY created_at DESC");
		res.json(result.rows);
	} catch (error) {
		next(error);
	}
};

// GET: Fetch snippets belonging exclusively to the authenticated user
export const getMySnippets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const userId = req.user?.userId;

	// Guard check for TypeScript type narrowing
	if (!userId) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	try {
		const result = await pool.query("SELECT * FROM snippets WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
		res.json(result.rows);
	} catch (error) {
		next(error);
	}
};

// GET: Fetch a single snippet by ID
export const getSnippetById = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const id = parseInt(req.params.id, 10);
	if (isNaN(id)) {
		res.status(400).json({ error: "Invalid ID format" });
		return;
	}

	try {
		const result = await pool.query("SELECT * FROM snippets WHERE id = $1", [id]);
		if (result.rows.length === 0) {
			res.status(404).json({ error: "Snippet not found" });
			return;
		}
		res.json(result.rows[0]);
	} catch (error) {
		next(error);
	}
};

// POST: Create a new snippet linked to the logged-in user
export const createSnippet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const { title, code, language } = req.body;
	const userId = req.user?.userId;

	try {
		const result = await pool.query(
			"INSERT INTO snippets (title, code, language, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
			[title, code, language || "plaintext", userId],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		next(error);
	}
};

// PUT: Update an existing snippet (Ownership check)
export const updateSnippet = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const id = parseInt(req.params.id, 10);
	const { title, code, language } = req.body;
	const userId = req.user?.userId;

	if (isNaN(id)) {
		res.status(400).json({ error: "Invalid ID format" });
		return;
	}

	try {
		// Ensure the snippet belongs to the requesting user via user_id = $5
		const result = await pool.query(
			`UPDATE snippets
             SET title = COALESCE($1, title),
                 code = COALESCE($2, code),
                 language = COALESCE($3, language)
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
			[title ?? null, code ?? null, language ?? null, id, userId],
		);

		if (result.rows.length === 0) {
			res.status(404).json({ error: "Snippet not found or access denied" });
			return;
		}

		res.json(result.rows[0]);
	} catch (error) {
		next(error);
	}
};

// DELETE: Remove a snippet (Ownership check)
export const deleteSnippet = async (
	req: AuthenticatedRequest<{ id: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const id = parseInt(req.params.id, 10);
	const userId = req.user?.userId;

	if (isNaN(id)) {
		res.status(400).json({ error: "Invalid ID format" });
		return;
	}

	try {
		const result = await pool.query("DELETE FROM snippets WHERE id = $1 AND user_id = $2", [id, userId]);
		if (result.rowCount === 0) {
			res.status(404).json({ error: "Snippet not found or access denied" });
			return;
		}

		res.status(204).send();
	} catch (error) {
		next(error);
	}
};
