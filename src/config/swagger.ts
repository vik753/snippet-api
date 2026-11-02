import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Snippet API Documentation",
			version: "1.0.0",
			description: "REST API for code snippet management with JWT cookie authentication",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				cookieAuth: {
					type: "apiKey",
					in: "cookie",
					name: "token",
					description: "JWT token stored in HttpOnly cookie",
				},
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "Fallback JWT Bearer token header",
				},
			},
		},
	},
	apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
