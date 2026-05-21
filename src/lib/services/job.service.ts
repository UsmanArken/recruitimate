import { db } from "@/lib/db";
import { jobListInclude } from "@/lib/db/includes";
import type { CreateJobInput } from "@/lib/validators/job";

export async function listJobs() {
  return db.job.findMany({
    include: jobListInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createJob(input: CreateJobInput) {
  return db.job.create({ data: input });
}

export async function findJobById(id: string) {
  return db.job.findUnique({ where: { id } });
}
