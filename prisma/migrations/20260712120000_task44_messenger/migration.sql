-- Repair: enum types referenced below were missing from this migration file.
-- (They exist in schema.prisma and were applied via db push; added here so the
-- migration chain is reproducible on a fresh shadow database.)
CREATE TYPE "ConversationKind" AS ENUM ('DIRECT', 'GROUP', 'BROADCAST', 'CEO', 'SUPPORT');
CREATE TYPE "PresenceStatus" AS ENUM ('ONLINE', 'AWAY', 'BUSY', 'OFFLINE');
CREATE TYPE "MsgStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');
CREATE TYPE "AttachmentKind" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'VOICE');
CREATE TYPE "ReactionEmoji" AS ENUM ('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY');

CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "kind" "ConversationKind" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "avatarUrl" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "isCeoChannel" BOOLEAN NOT NULL DEFAULT false,
    "isBroadcast" BOOLEAN NOT NULL DEFAULT false,
    "departmentId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "typingAt" TIMESTAMP(3),

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MsgStatus" NOT NULL DEFAULT 'SENT',
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editHistory" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "isRecalled" BOOLEAN NOT NULL DEFAULT false,
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "translations" JSONB,
    "encryptedContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forwardedFromId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "kind" "AttachmentKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" DOUBLE PRECISION,
    "encryptedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "transcript" TEXT,
    "waveform" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "encryptedUrl" TEXT,

    CONSTRAINT "VoiceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" "ReactionEmoji" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadReceipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MsgStatus" NOT NULL DEFAULT 'DELIVERED',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "departmentId" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlinePresence" (
    "userId" TEXT NOT NULL,
    "status" "PresenceStatus" NOT NULL DEFAULT 'ONLINE',
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socketId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlinePresence_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
