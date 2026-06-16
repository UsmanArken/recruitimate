import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { badRequest } from "@/lib/api/errors";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import { absoluteRecordingPath } from "@/lib/storage/interview-recordings";
import * as interviewService from "@/lib/services/interview.service";

function mimeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".webm": "video/webm",
    ".mp4": "video/mp4",
    ".mpeg": "audio/mpeg",
    ".mpga": "audio/mpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

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
      const absolute = absoluteRecordingPath(interview.recordingPath);
      const buffer = await readFile(absolute);
      return new NextResponse(buffer, {
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
