import { NextFunction, Request, Response } from "express";
import pool from "../db";

export const getSnippets = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Execute a SQL query to get all snippets, newest first
		const result = await pool.query("SELECT * FROM snippets ORDER BY id ASC");
		// Send the rows returned by the database
		res.json(result.rows);
	} catch (error) {
		// Pass unexpected database errors to the global error middleware
		next(error);
	}
};

export const getSnippetById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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
		// Pass unexpected database errors to the global error middleware
		next(error);
	}
};

export const createSnippet = async (req: Request, res: Response, next: NextFunction) => {
	const { title, code, language } = req.body;

	try {
		// Use parameterized queries ($1, $2, $3) to prevent SQL Injection
		const result = await pool.query("INSERT INTO snippets (title, code, language) VALUES ($1, $2, $3) RETURNING *", [
			title,
			code,
			language || "plaintext",
		]);

		// Return 201 Created and the newly inserted row
		res.status(201).json(result.rows[0]);
	} catch (error) {
		// Pass unexpected database errors to the global error middleware
		next(error);
	}
};

export const updateSnippet = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
	const id = parseInt(req.params.id, 10);
	const { title, code, language } = req.body;

	if (isNaN(id)) {
		res.status(400).json({ error: "Invalid ID format" });
		return;
	}

	try {
		// COALESCE keeps the existing database value if the incoming parameter is NULL
		const result = await pool.query(
			`UPDATE snippets
             SET title = COALESCE($1, title),
                 code = COALESCE($2, code),
                 language = COALESCE($3, language)
             WHERE id = $4
             RETURNING *`,
			[title ?? null, code ?? null, language ?? null, id],
		);

		// If no row was matched, the snippet with this ID does not exist
		if (result.rows.length === 0) {
			res.status(404).json({ error: "Snippet not found" });
			return;
		}

		res.json(result.rows[0]);
	} catch (error) {
		// Pass unexpected database errors to the global error middleware
		next(error);
	}
};

export const deleteSnippet = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
	const id = parseInt(req.params.id, 10);

	if (isNaN(id)) {
		res.status(400).json({ error: "Invalid ID format" });
		return;
	}

	try {
		const result = await pool.query("DELETE FROM snippets WHERE id = $1", [id]);

		// result.rowCount tells us how many rows were deleted by the SQL query
		if (result.rowCount === 0) {
			res.status(404).json({ error: "Snippet not found" });
			return;
		}

		res.status(204).send();
	} catch (error) {
		// Pass unexpected database errors to the global error middleware
		next(error);
	}
};
