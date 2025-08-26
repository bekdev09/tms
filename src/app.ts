import express, { type NextFunction, type Request, type Response } from "express";

const app = express();
const PORT: number | string = process.env.PORT || 3000;

// Middleware example with types
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript + NodeNext with types!");
});
// Async initialization using top-level await
const initialize = async (): Promise<void> => {
  // Simulate async setup, e.g., DB connection
  await new Promise<void>((resolve) => setTimeout(resolve, 100));
  console.log("Async initialization completed");
};
await initialize();

export default app;