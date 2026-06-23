import { RouteLoading } from "@/components/ui/route-loading";

export default function JobDetailLoading() {
  return (
    <RouteLoading
      title="Loading role"
      description="Opening pipeline, team, and applicant rankings…"
    />
  );
}
