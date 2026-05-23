import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertCandidateAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { CreateNoteInput } from "@/lib/validators/note";

const noteInclude = {
  author: { select: { id: true, name: true, email: true } },
} as const;

export async function listNotesForCandidate(ctx: AuthContext, candidateId: string) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  await assertCandidateAccess(ctx, candidateId);

  return db.note.findMany({
    where: { candidateId, candidate: organizationFilter(ctx) },
    include: noteInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(
  ctx: AuthContext,
  candidateId: string,
  input: CreateNoteInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertCandidateAccess(ctx, candidateId);

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
    select: { id: true },
  });
  if (!candidate) throw notFound("Candidate");

  return db.note.create({
    data: {
      candidateId,
      authorId: ctx.userId,
      content: input.content,
      tags: input.tags,
    },
    include: noteInclude,
  });
}

export async function deleteNote(ctx: AuthContext, candidateId: string, noteId: string) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertCandidateAccess(ctx, candidateId);

  const note = await db.note.findFirst({
    where: {
      id: noteId,
      candidateId,
      candidate: organizationFilter(ctx),
    },
  });
  if (!note) throw notFound("Note");

  await db.note.delete({ where: { id: noteId } });
}
