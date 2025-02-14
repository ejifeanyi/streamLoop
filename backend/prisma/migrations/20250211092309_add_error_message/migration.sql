-- DropForeignKey
ALTER TABLE "_ConnectedAccountToStreamSession" DROP CONSTRAINT "_ConnectedAccountToStreamSession_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConnectedAccountToStreamSession" DROP CONSTRAINT "_ConnectedAccountToStreamSession_B_fkey";

-- DropForeignKey
ALTER TABLE "connected_accounts" DROP CONSTRAINT "connected_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "stream_sessions" DROP CONSTRAINT "stream_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "stream_settings" DROP CONSTRAINT "stream_settings_accountId_fkey";

-- AlterTable
ALTER TABLE "stream_sessions" ADD COLUMN     "errorMessage" TEXT;
