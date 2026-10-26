import { Request, Response, Router } from "express";
import pool from "../db";
import { validateData } from "../middleware/validate";
import { createSnippetSchema, updateSnippetSchema } from "../schemas/snippet.schema";

const router = Router();

// GET: Retrieve all snippets from PostgreSQL
router.get("/", async (req: Request, res: Response) => {
	try {
		// Execute a SQL query to get all snippets, newest first
		const result = await pool.query("SELECT * FROM snippets ORDER BY id ASC");
		// Send the rows returned by the database
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching snippets:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST: Create a new snippet in PostgreSQL
router.post("/", validateData(createSnippetSchema), async (req: Request, res: Response) => {
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
		console.error("Error creating snippet:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PUT: Update an existing snippet in PostgreSQL
router.put("/:id", validateData(updateSnippetSchema), async (req: Request<{ id: string }>, res: Response) => {
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
		console.error("Error updating snippet:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// DELETE: Remove a snippet from PostgreSQL
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
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
		console.error("Error deleting snippet:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
