import { Request, Response, Router } from "express";
import pool from "../db";
import { validateData } from "../middleware/validate";
import { createSnippetSchema, updateSnippetSchema } from "../schemas/snippet.schema";
import {
	createSnippet,
	deleteSnippet,
	getSnippetById,
	getSnippets,
	updateSnippet,
} from "../controllers/snippet.controller";

const router = Router();

// GET: Retrieve all snippets from PostgreSQL
router.get("/", getSnippets);

// GET by ID: Retrieve one snippet by ID from PostgreSQL
router.get("/:id", getSnippetById);

// POST: Create a new snippet in PostgreSQL
router.post("/", validateData(createSnippetSchema), createSnippet);

// PUT: Update an existing snippet in PostgreSQL
router.put("/:id", validateData(updateSnippetSchema), updateSnippet);

// DELETE: Remove a snippet from PostgreSQL
router.delete("/:id", deleteSnippet);

export default router;
