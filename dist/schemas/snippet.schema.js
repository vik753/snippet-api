"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSnippetSchema = exports.createSnippetSchema = void 0;
const zod_1 = require("zod");
exports.createSnippetSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters long"),
    code: zod_1.z.string().min(1, "Code can't be empty"),
    language: zod_1.z.string().optional(),
});
exports.updateSnippetSchema = exports.createSnippetSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });
