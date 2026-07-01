import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as careerTrajectoryService from "@/lib/services/career-trajectory.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id: candidateId } = await params;
      const trajectory = await careerTrajectoryService.getCareerTrajectory(ctx, candidateId);
      return jsonOk({ trajectory });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id: candidateId } = await params;
      const trajectory = await careerTrajectoryService.computeAndStoreCareerTrajectory(
        ctx,
        candidateId
      );
      return jsonOk({ trajectory });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
