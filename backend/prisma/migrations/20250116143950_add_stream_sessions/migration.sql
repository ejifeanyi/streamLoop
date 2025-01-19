/*
  Warnings:

  - You are about to drop the `ConnectedAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConnectedAccount" DROP CONSTRAINT "ConnectedAccount_userId_fkey";

-- DropTable
DROP TABLE "ConnectedAccount";

-- CreateTable
CREATE TABLE "connected_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "channelData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tokenExpiry" TIMESTAMP(3),
    "lastRefresh" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT DEFAULT 'ready',

    CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_settings" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '1080p',
    "enableAutoStart" BOOLEAN NOT NULL DEFAULT false,
    "enableChatRelay" BOOLEAN NOT NULL DEFAULT true,
    "enableLowLatency" BOOLEAN NOT NULL DEFAULT true,
    "customRtmpUrl" TEXT,

    CONSTRAINT "stream_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'created',
    "title" TEXT,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "platforms" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "stream_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConnectedAccountToStreamSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConnectedAccountToStreamSession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "connected_accounts_userId_platform_accountId_key" ON "connected_accounts"("userId", "platform", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "stream_settings_accountId_key" ON "stream_settings"("accountId");

-- CreateIndex
CREATE INDEX "_ConnectedAccountToStreamSession_B_index" ON "_ConnectedAccountToStreamSession"("B");

-- AddForeignKey
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_settings" ADD CONSTRAINT "stream_settings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "connected_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_sessions" ADD CONSTRAINT "stream_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConnectedAccountToStreamSession" ADD CONSTRAINT "_ConnectedAccountToStreamSession_A_fkey" FOREIGN KEY ("A") REFERENCES "connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConnectedAccountToStreamSession" ADD CONSTRAINT "_ConnectedAccountToStreamSession_B_fkey" FOREIGN KEY ("B") REFERENCES "stream_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
