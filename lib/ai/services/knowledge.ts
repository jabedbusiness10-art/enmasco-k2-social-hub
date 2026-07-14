// ===========================================================================
// TASK-52 — lib/ai/services/knowledge.ts
// Retrieves company knowledge + answers questions via the K2Kai engine.
// No direct provider calls — routes through generateContent.
// ===========================================================================

import { prisma } from "@/lib/db";
import { generateContent } from "@/services/ai";
import { KNOWLEDGE_SYSTEM, knowledgePrompt } from "../prompts/knowledge";

export async function listCategories() {
  return prisma.knowledgeCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { documents: true } } },
  });
}

export async function listDocuments(categoryId?: string) {
  const where = categoryId ? { isPublished: true, categoryId } : { isPublished: true };
  return prisma.knowledgeDocument.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });
}

export async function searchKnowledge(query: string): Promise<string> {
  if (!query.trim()) return "";
  const docs = await prisma.knowledgeDocument.findMany({
    where: { isPublished: true, OR: [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { tags: { hasSome: query.split(/\s+/).filter(Boolean) } },
    ] },
    take: 5,
  });
  if (!docs.length) return "(no matching company knowledge yet)";
  return docs.map((d) => `## ${d.title}\n${d.content}`).join("\n\n");
}

export async function answerWithKnowledge(
  userId: string,
  question: string,
): Promise<string> {
  const context = await searchKnowledge(question);
  return generateContent(userId, knowledgePrompt(question, context), {
    systemPrompt: KNOWLEDGE_SYSTEM,
    maxTokens: 500,
  });
}
