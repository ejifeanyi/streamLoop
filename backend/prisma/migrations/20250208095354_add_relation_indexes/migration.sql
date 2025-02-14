/*
  Warnings:

  - You are about to drop the column `metrics` on the `stream_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `platforms` on the `stream_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `customRtmpUrl` on the `stream_settings` table. All the data in the column will be lost.
  - You are about to drop the column `enableChatRelay` on the `stream_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stream_sessions" DROP COLUMN "metrics",
DROP COLUMN "platforms",
ADD COLUMN     "youtubeData" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "stream_settings" DROP COLUMN "customRtmpUrl",
DROP COLUMN "enableChatRelay";
