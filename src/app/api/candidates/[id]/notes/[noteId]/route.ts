import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as noteService from "@/lib/services/note.service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id, noteId } = await params;
    await noteService.deleteNote(ctx, id, noteId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
