/*
  Warnings:

  - Made the column `absoluteExpiry` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "absoluteExpiry" SET NOT NULL;
