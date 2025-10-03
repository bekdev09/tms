import { jobManager } from "../jobs/jobManager.ts";
import { prisma } from "../prisma/client.ts"; // your prisma client
import type { Server } from "http";

// --- DB connection with retry/backoff ---
export async function connectWithRetry(
  retries = 5,
  delayMs = 2000
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      jobManager.stopJob("cleanupTokens");
      await prisma.$connect();
      console.log("✅ Database connected");
      return;
    } catch (err) {
      console.error(
        `❌ Database connection failed (attempt ${i + 1}):`,
        err
      );
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error("💥 All retries failed. Exiting process.");
        process.exit(1);
      }
    }
  }
}

// --- Graceful shutdown ---
export function setupGracefulShutdown(server?: Server): void {
  const shutdown = async () => {
    console.log("🛑 Shutting down server...");
    try {
      await prisma.$disconnect();
      console.log("✅ Database disconnected");
      if (server) {
        server.close(() => console.log("Server closed"));
      }
    } catch (err) {
      console.error("❌ Error disconnecting DB:", err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);  // Ctrl+C
  process.on("SIGTERM", shutdown); // Docker/K8s termination
}
