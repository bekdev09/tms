import { Request, Router, Response } from "express";

const router = Router();

router.get("/register", (_req: Request, res: Response) => { res.json({ msg: "ok" }) })
