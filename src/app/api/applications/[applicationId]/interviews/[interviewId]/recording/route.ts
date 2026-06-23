import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/errors";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import { readInterviewRecording, mimeForPath } from "@/lib/storage/interview-recordings";
import * as interviewService from "@/lib/services/interview.service";
export async function GET(
  _req: Request,
  {
    params,
  }: { params: Promise<{ applicationId: string; interviewId: string }> }
) {
  return runApiRoute(_req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId, interviewId } = await params;
      const interview = await interviewService.getInterviewForApplication(
        ctx,
        applicationId,
        interviewId
      );
      if (!interview.recordingPath) {
        return handleRouteError(badRequest("No recording uploaded", "NO_RECORDING"));
      }
      const buffer = await readInterviewRecording(interview.recordingPath);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": mimeForPath(interview.recordingPath),
          "Cache-Control": "private, no-store",
        },
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ applicationId: string; interviewId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId, interviewId } = await params;
      const form = await req.formData();
      const file = form.get("recording");
      if (!(file instanceof File)) {
        return handleRouteError(badRequest("Recording file required", "NO_FILE"));
      }
      const interview = await interviewService.uploadInterviewRecording(
        ctx,
        applicationId,
        interviewId,
        file
      );
      return jsonOk(interview);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
