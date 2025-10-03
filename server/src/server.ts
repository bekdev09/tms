import app from "./app.ts";
import { env } from "./configs/env.ts";
import { cleanupExpiredTokens } from "./jobs/cleanupRefreshToken.ts";
import { jobManager } from "./jobs/jobManager.ts";
import { connectWithRetry, setupGracefulShutdown } from "./utils/db.ts";

let server: ReturnType<typeof app.listen>;

async function startServer() {
  try {
    await connectWithRetry();


    jobManager.startJob("cleanupTokens", {
      schedule: "0 2 * * *",
      task: cleanupExpiredTokens,
    });

    server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
    setupGracefulShutdown(server);

  } catch (err) {
    console.error("❌ Unexpected startup error:", err);
    process.exit(1);
  }
}

startServer();