// ===========================================================================
// TASK-53 — lib/team.ts
// Team Collaboration & Assignment service. All access RBAC-checked.
// ===========================================================================

import { prisma } from "@/lib/db";
import type { AssignmentStatus, AssignmentPriority, AssignmentKind } from "@prisma/client";

export async function listAssignments(filter: {
  assignedToId?: string;
  assignedById?: string;
  status?: AssignmentStatus;
  priority?: AssignmentPriority;
  departmentId?: string;
  kind?: AssignmentKind;
  search?: string;
  take?: number;
  skip?: number;
}) {
  return prisma.assignment.findMany({
    where: {
      ...(filter.assignedToId ? { assignedToId: filter.assignedToId } : {}),
      ...(filter.assignedById ? { assignedById: filter.assignedById } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.priority ? { priority: filter.priority } : {}),
      ...(filter.departmentId ? { departmentId: filter.departmentId } : {}),
      ...(filter.kind ? { kind: filter.kind } : {}),
      ...(filter.search
        ? { OR: [{ title: { contains: filter.search, mode: "insensitive" } }, { description: { contains: filter.search, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: filter.take ?? 50,
    skip: filter.skip ?? 0,
    include: {
      assignedBy: { select: { id: true, name: true, avatar: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      department: { select: { id: true, name: true } },
      _count: { select: { comments: true, attachments: true } },
    },
  });
}

export async function getAssignment(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: {
      assignedBy: { select: { id: true, name: true, avatar: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      department: { select: { id: true, name: true } },
      comments: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, avatar: true } } } },
      attachments: true,
      activities: { orderBy: { createdAt: "desc" }, take: 30, include: { actor: { select: { id: true, name: true } } } },
      history: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createAssignment(data: {
  title: string;
  description?: string;
  kind?: AssignmentKind;
  status?: AssignmentStatus;
  priority?: AssignmentPriority;
  tags?: string[];
  dueDate?: string;
  assignedToId: string;
  departmentId?: string;
  assignedById: string;
}) {
  const status = data.status ?? "TODO";
  const a = await prisma.assignment.create({
    data: {
      title: data.title,
      description: data.description,
      kind: data.kind ?? "INTERNAL_TASK",
      status,
      priority: data.priority ?? "MEDIUM",
      tags: data.tags ?? [],
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedToId: data.assignedToId,
      assignedById: data.assignedById,
      departmentId: data.departmentId,
    },
  });
  await prisma.assignmentActivity.create({
    data: { assignmentId: a.id, actorId: data.assignedById, action: "CREATED", meta: JSON.stringify({ title: a.title }) },
  });
  return a;
}

export async function updateAssignment(
  id: string,
  changedById: string,
  data: Partial<{ title: string; description: string; status: AssignmentStatus; priority: AssignmentPriority; tags: string[]; dueDate: string | null; assignedToId: string; departmentId: string | null }>,
) {
  const prev = await prisma.assignment.findUnique({ where: { id } });
  if (!prev) return null;
  const updated = await prisma.assignment.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
      ...(data.assignedToId !== undefined ? { assignedToId: data.assignedToId } : {}),
      ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
    },
  });
  // history for status changes
  if (data.status && data.status !== prev.status) {
    await prisma.assignmentHistory.create({
      data: { assignmentId: id, changedById, field: "status", fromValue: prev.status, toValue: data.status },
    });
    await prisma.assignmentActivity.create({
      data: { assignmentId: id, actorId: changedById, action: "STATUS", meta: JSON.stringify({ from: prev.status, to: data.status }) },
    });
  }
  return updated;
}

export async function addComment(assignmentId: string, userId: string, content: string) {
  const mentions = extractMentions(content);
  return prisma.assignmentComment.create({
    data: { assignmentId, userId, content, mentions },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
}

export async function listActivity(userId: string, take = 30) {
  return prisma.assignmentActivity.findMany({
    where: { assignment: { OR: [{ assignedToId: userId }, { assignedById: userId }] } },
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: { select: { id: true, name: true } }, assignment: { select: { id: true, title: true } } },
  });
}

export async function createApproval(data: { title: string; description?: string; assignmentId?: string; requestedById: string }) {
  const a = await prisma.approvalRequest.create({
    data: { title: data.title, description: data.description, assignmentId: data.assignmentId, requestedById: data.requestedById },
  });
  await prisma.approvalHistory.create({ data: { approvalId: a.id, actorId: data.requestedById, action: "SUBMITTED" } });
  return a;
}

export async function decideApproval(id: string, approvedById: string, approve: boolean, note?: string) {
  const a = await prisma.approvalRequest.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED", approvedById, decidedAt: new Date() },
  });
  await prisma.approvalHistory.create({
    data: { approvalId: id, actorId: approvedById, action: approve ? "APPROVED" : "REJECTED", note },
  });
  return a;
}

export async function listTeamMembers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      role: true,
      department: true,
      presence: true,
    },
  });
}

function extractMentions(text: string): string[] {
  const ids = text.match(/@user:([a-zA-Z0-9]+)/g) ?? [];
  return ids.map((m) => m.replace("@user:", ""));
}
