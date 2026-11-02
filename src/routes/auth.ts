import { Response, Router } from "express";
import { login, logout, register } from "../controllers/auth.controller";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@example.com
 *               password:
 *                 type: string
 *                 example: secretpassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already in use
 */
router.post("/register", validate(registerSchema), register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@example.com
 *               password:
 *                 type: string
 *                 example: secretpassword123
 *     responses:
 *       200:
 *         description: Login successful and HttpOnly cookie set
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Cookie cleared successfully
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user object
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
	res.json({ user: req.user });
});

export default router;
