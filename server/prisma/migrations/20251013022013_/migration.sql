-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_absoluteExpiry_idx" ON "public"."RefreshToken"("absoluteExpiry");
