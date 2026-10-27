"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const snippet_schema_1 = require("../schemas/snippet.schema");
const router = (0, express_1.Router)();
// Temporary array to act as our database until we connect PostgreSQL
const snippets = [
    {
        id: 1,
        title: "Hello World in TS",
        code: 'console.log("Hello, World!");',
        language: "typescript",
    },
];
router.get("/", (req, res) => {
    res.json(snippets);
});
// POST: Create a new snippet
router.post("/", (0, validate_1.validate)(snippet_schema_1.createSnippetSchema), (req, res) => {
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
router.put("/:id", (0, validate_1.validate)(snippet_schema_1.updateSnippetSchema), (req, res) => {
    const snippetId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(snippetId)) {
        res.status(400).json({ message: "Invalid snippet id" });
        return;
    }
    const snippetIndex = snippets.findIndex((snippet) => snippet.id === snippetId);
    if (snippetIndex === -1) {
        res.status(404).json({ message: "Snippet not found" });
        return;
    }
    const updatedSnippet = {
        ...snippets[snippetIndex],
        ...req.body,
    };
    snippets[snippetIndex] = updatedSnippet;
    res.json(updatedSnippet);
});
exports.default = router;
