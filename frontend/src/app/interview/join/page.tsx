import { notFound } from "next/navigation";
import { VideoCall } from "./video-call";

interface Props {
  searchParams: Promise<{ token?: string; title?: string; returnTo?: string }>;
}

export default async function InterviewJoinPage({ searchParams }: Props) {
  const { token, title, returnTo } = await searchParams;

  if (!token) {
    notFound();
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

  return (
    <VideoCall
      token={token}
      serverUrl={serverUrl}
      interviewTitle={title ?? "Interview"}
      returnTo={returnTo ?? "/"}
    />
  );
}
