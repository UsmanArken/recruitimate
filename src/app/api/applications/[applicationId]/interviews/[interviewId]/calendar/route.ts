import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/errors";
import { handleRouteError } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import { buildInterviewIcs } from "@/lib/calendar/ics";
import * as interviewService from "@/lib/services/interview.service";

export async function GET(
  req: Request,
  {
    params,
  }: { params: Promise<{ applicationId: string; interviewId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId, interviewId } = await params;
      const interview = await interviewService.getInterviewForApplication(
        ctx,
        applicationId,
        interviewId
      );

      if (!interview.scheduledAt) {
        return handleRouteError(badRequest("Interview is not scheduled", "NOT_SCHEDULED"));
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const ics = buildInterviewIcs({
        uid: interview.id,
        title: interview.title,
        description: `Recruitimate interview for ${interview.application.candidate.name} — ${interview.application.job.title}\n\nOpen campaign: ${appUrl}/candidates/${interview.application.candidateId}/applications/${applicationId}`,
        start: interview.scheduledAt,
        durationMinutes: interview.durationMinutes ?? 60,
        location: interview.meetingUrl ?? undefined,
        organizerEmail: ctx.userEmail,
      });

      return new NextResponse(ics, {
        status: 200,
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": `attachment; filename="interview-${interviewId}.ics"`,
        },
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
