import { Request, Response, Router } from "express";
import { validate } from "../middleware/validate";
import { createSnippetSchema, updateSnippetSchema } from "../schemas/snippet.schema";

const router = Router();

// Temporary array to act as our database until we connect PostgreSQL
let snippets = [
	{
		id: 1,
		title: "Hello World in TS",
		code: 'console.log("Hello, World!");',
		language: "typescript",
	},
];

//GET: Get all snippets
router.get("/", (req: Request, res: Response) => {
	res.json(snippets);
});

// POST: Create a new snippet
router.post("/", validate(createSnippetSchema), (req: Request, res: Response) => {
	// Extract data from the request body
	const { title, code, language } = req.body;

	const newSnippet = {
		// Simple ID generation for our temporary array
		id: snippets.length > 0 ? snippets[snippets.length - 1].id + 1 : 1,
		title,
		code,
		language: language || "plaintext",
	};

	snippets.push(newSnippet);
	// Return 201 Created status code and the new object
	res.status(201).json(newSnippet);
});

// PUT: Udate snippet by id
router.put("/:id", validate(updateSnippetSchema), (req: Request<{ id: string }>, res: Response) => {
	const id = parseInt(req.params.id, 10);
	const { title, code, language } = req.body;

	const snippetIndex = snippets.findIndex((s) => s.id === id);

	if (snippetIndex === -1) {
		res.status(404).json({ error: "Snippet not found" });
		return;
	}

	snippets[snippetIndex] = {
		...snippets[snippetIndex],
		title: title ?? snippets[snippetIndex].title,
		code: code ?? snippets[snippetIndex].code,
		language: language ?? snippets[snippetIndex].language,
	};

	res.json(snippets[snippetIndex]);
});

//DELETE: Delete snippet by id
router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
	const id = parseInt(req.params.id, 10);
	const isSnippetExists = snippets.some((s) => s?.id === id);

	if (!isSnippetExists) {
		res.status(404).json({ error: "Snippet not found" });
		return;
	}

	snippets = snippets.filter((s) => s.id !== id);
	res.status(204).send();
});

export default router;
