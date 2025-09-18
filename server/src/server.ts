import app from "./app.ts";
import { env } from "./configs/env.ts";
import { connectWithRetry, setupGracefulShutdown } from "./utils/db.ts";

async function startServer() {
  await connectWithRetry();     // ensures DB is connected before listening
  setupGracefulShutdown();      // handles SIGINT/SIGTERM
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

startServer();