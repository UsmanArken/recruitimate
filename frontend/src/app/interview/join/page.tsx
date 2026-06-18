import { notFound } from "next/navigation";
import { VideoCall } from "./video-call";

interface Props {
  searchParams: Promise<{ token?: string; title?: string }>;
}

export default async function InterviewJoinPage({ searchParams }: Props) {
  const { token, title } = await searchParams;

  if (!token) {
    notFound();
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

  return (
    <VideoCall
      token={token}
      serverUrl={serverUrl}
      interviewTitle={title ?? "Interview"}
    />
  );
}
