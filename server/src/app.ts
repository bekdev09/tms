import express, { Application } from "express";
import { setupSecurity } from "./middlewares/security.ts";
import mainRouter from "./routes/index.ts";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.ts";

const app: Application = express();

setupSecurity(app);

app.use("/api/v1", mainRouter);
app.use(errorHandlerMiddleware);

export default app
