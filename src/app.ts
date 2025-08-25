import express, { type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Express + TypeScript server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
