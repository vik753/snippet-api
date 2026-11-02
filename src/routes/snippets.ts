import { Router } from "express";
import { validate } from "../middleware/validate";
import { createSnippetSchema, updateSnippetSchema } from "../schemas/snippet.schema";
import { authenticateToken } from "../middleware/auth.middleware";
import {
	getSnippets,
	getSnippetById,
	getMySnippets,
	createSnippet,
	updateSnippet,
	deleteSnippet,
} from "../controllers/snippet.controller";

const router = Router();

/**
 * @openapi
 * /api/snippets:
 *   get:
 *     summary: Get all public snippets
 *     tags: [Snippets]
 *     responses:
 *       200:
 *         description: Array of snippets
 */
router.get("/", getSnippets);

/**
 * @openapi
 * /api/snippets/my:
 *   get:
 *     summary: Get snippets belonging to authenticated user
 *     tags: [Snippets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of user snippets
 *       401:
 *         description: Authentication required
 */
router.get("/my", authenticateToken, getMySnippets);

/**
 * @openapi
 * /api/snippets/{id}:
 *   get:
 *     summary: Get snippet by ID
 *     tags: [Snippets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Snippet object
 *       404:
 *         description: Snippet not found
 */
router.get("/:id", getSnippetById);

/**
 * @openapi
 * /api/snippets:
 *   post:
 *     summary: Create a new snippet
 *     tags: [Snippets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, code, language]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Custom Hook
 *               code:
 *                 type: string
 *                 example: const useToggle = () => {};
 *               language:
 *                 type: string
 *                 example: typescript
 *     responses:
 *       201:
 *         description: Snippet created
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateToken, validate(createSnippetSchema), createSnippet);

/**
 * @openapi
 * /api/snippets/{id}:
 *   put:
 *     summary: Update an existing snippet owned by user
 *     tags: [Snippets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Snippet updated
 *       404:
 *         description: Snippet not found or access denied
 */
router.put("/:id", authenticateToken, validate(updateSnippetSchema), updateSnippet);

/**
 * @openapi
 * /api/snippets/{id}:
 *   delete:
 *     summary: Delete a snippet owned by user
 *     tags: [Snippets]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Snippet deleted
 *       404:
 *         description: Snippet not found or access denied
 */
router.delete("/:id", authenticateToken, deleteSnippet);

export default router;
