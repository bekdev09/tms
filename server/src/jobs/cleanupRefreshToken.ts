
import { prisma } from "../prisma/client.ts";

export async function cleanupExpiredTokens() {
  const now = new Date();
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { absoluteExpiry: { lt: now } },
        { revoked: true },
      ],
    },
  });

  console.log(`🧹 Cleanup job: deleted ${result.count} expired/revoked tokens`);
}
