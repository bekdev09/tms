import express, { Application } from "express";

import { setupSecurity } from "./middlewares/security.ts";
import mainRouter from "./routes/index.ts";

const app: Application = express();

setupSecurity(app);

app.use("/api/v1", mainRouter);

export default app
