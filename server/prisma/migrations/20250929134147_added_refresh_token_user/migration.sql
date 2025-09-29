/*
  Warnings:

  - You are about to drop the column `jti` on the `RefreshToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."RefreshToken_jti_key";

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "jti";
