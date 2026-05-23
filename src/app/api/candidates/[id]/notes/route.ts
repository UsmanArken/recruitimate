import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createNoteSchema } from "@/lib/validators/note";
import * as noteService from "@/lib/services/note.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const notes = await noteService.listNotesForCandidate(ctx, id);
    return jsonOk(notes);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const input = await parseJsonBody(req, createNoteSchema);
    const note = await noteService.createNote(ctx, id, {
      content: input.content,
      tags: input.tags ?? [],
    });
    return jsonCreated(note);
  } catch (error) {
    return handleRouteError(error);
  }
}
