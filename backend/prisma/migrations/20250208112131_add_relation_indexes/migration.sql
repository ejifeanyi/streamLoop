/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform]` on the table `connected_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "connected_accounts_userId_platform_accountId_key";

-- CreateIndex
CREATE UNIQUE INDEX "connected_accounts_userId_platform_key" ON "connected_accounts"("userId", "platform");
