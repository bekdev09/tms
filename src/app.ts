import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan"
import helmet from "helmet";

const app = express();

app.use(cors())
app.use(helmet())
app.use(express.json());
app.use(morgan('dev'))

app.get("/health", (req: Request, res: Response) => res.json({ ok: true, service: "Task & Work Order API" }))

app.use("/auth", (req: Request, res: Response) => res.json({ msg: "auth" }))
app.use("/users", (req: Request, res: Response) => res.json({ msg: "users" }))
app.use("/tasks", (req: Request, res: Response) => res.json({ msg: "tasks" }))
app.use("/notifications", (req: Request, res: Response) => res.json({ msg: "notifications" }))

export default app
