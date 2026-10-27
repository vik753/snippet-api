"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const snippets_1 = __importDefault(require("./routes/snippets"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Built-in middleware to parse incoming JSON payloads
app.use(express_1.default.json());
// Custom middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // Pass control to the next middleware or route handler
    next();
});
// Mount the snippets router at the /api/snippets path
app.use("/api/snippets", snippets_1.default);
app.use("/", (req, res) => {
    res.json({ message: "Welcome on SnippetsAPI!" });
});
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});
