import { z } from "zod";

export const createSnippetSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters long"),
	code: z.string().min(1, "Code can't be empty"),
	language: z.string().optional(),
});

export const updateSnippetSchema = createSnippetSchema
	.partial()
	.refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });
