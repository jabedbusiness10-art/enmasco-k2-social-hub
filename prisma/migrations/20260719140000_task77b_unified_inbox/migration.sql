-- TASK-77B: additive social inbox persistence, idempotency, notes, and AI audit.
ALTER TABLE "Conversation"
  ADD COLUMN "externalParticipantId" TEXT,
  ADD COLUMN "participantUsername" TEXT,
  ADD COLUMN "inboxUnreadCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "hasReplied" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isSpam" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "firstContactAt" TIMESTAMP(3),
  ADD COLUMN "lastInboundAt" TIMESTAMP(3),
  ADD COLUMN "lastOutboundAt" TIMESTAMP(3),
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "consentStatus" TEXT,
  ADD COLUMN "providerMetadata" JSONB;

ALTER TABLE "Message"
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "senderType" TEXT NOT NULL DEFAULT 'INTERNAL_USER',
  ADD COLUMN "senderExternalId" TEXT,
  ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN "deliveryStatus" TEXT NOT NULL DEFAULT 'SENT',
  ADD COLUMN "readStatus" TEXT NOT NULL DEFAULT 'UNREAD',
  ADD COLUMN "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "providerMetadata" JSONB,
  ADD COLUMN "replyToExternalId" TEXT,
  ADD COLUMN "failureReason" TEXT,
  ADD COLUMN "isInternalNote" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "SocialCustomer"
  ADD COLUMN "providerAccountId" TEXT,
  ADD COLUMN "username" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "consentStatus" TEXT,
  ADD COLUMN "providerMetadata" JSONB;

ALTER TABLE "ConversationAssignment"
  ALTER COLUMN "assignedToId" DROP NOT NULL,
  ADD COLUMN "action" TEXT NOT NULL DEFAULT 'ASSIGNED';

CREATE TABLE "ConversationNote" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "editHistory" JSONB,
  "editedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ConversationNote_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "InboxWebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "externalEventId" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "conversationId" TEXT,
  "error" TEXT,
  "occurredAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "InboxWebhookEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InboxWebhookEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "InboxAiAudit" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "language" TEXT,
  "tone" TEXT,
  "provider" TEXT,
  "model" TEXT,
  "promptTokens" INTEGER,
  "resultHash" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InboxAiAudit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InboxAiAudit_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Conversation_platformAccountId_externalId_key" ON "Conversation"("platformAccountId", "externalId");
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX "Conversation_inboxUnreadCount_idx" ON "Conversation"("inboxUnreadCount");
CREATE INDEX "Conversation_hasReplied_idx" ON "Conversation"("hasReplied");
CREATE INDEX "Conversation_isSpam_idx" ON "Conversation"("isSpam");
CREATE UNIQUE INDEX "Message_conversationId_externalId_key" ON "Message"("conversationId", "externalId");
CREATE INDEX "Message_externalId_idx" ON "Message"("externalId");
CREATE INDEX "Message_direction_idx" ON "Message"("direction");
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");
CREATE UNIQUE INDEX "SocialCustomer_platform_providerAccountId_externalId_key" ON "SocialCustomer"("platform", "providerAccountId", "externalId");
CREATE INDEX "ConversationNote_conversationId_createdAt_idx" ON "ConversationNote"("conversationId", "createdAt");
CREATE INDEX "ConversationNote_authorId_idx" ON "ConversationNote"("authorId");
CREATE UNIQUE INDEX "InboxWebhookEvent_provider_providerAccountId_externalEventId_key" ON "InboxWebhookEvent"("provider", "providerAccountId", "externalEventId");
CREATE INDEX "InboxWebhookEvent_status_receivedAt_idx" ON "InboxWebhookEvent"("status", "receivedAt");
CREATE INDEX "InboxWebhookEvent_conversationId_idx" ON "InboxWebhookEvent"("conversationId");
CREATE INDEX "InboxAiAudit_conversationId_createdAt_idx" ON "InboxAiAudit"("conversationId", "createdAt");
CREATE INDEX "InboxAiAudit_userId_createdAt_idx" ON "InboxAiAudit"("userId", "createdAt");
