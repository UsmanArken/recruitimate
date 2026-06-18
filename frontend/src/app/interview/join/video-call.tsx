"use client";

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useRouter } from "next/navigation";

interface Props {
  token: string;
  serverUrl: string;
  interviewTitle: string;
}

export function VideoCall({ token, serverUrl, interviewTitle }: Props) {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <span className="text-sm font-medium text-white">{interviewTitle}</span>
      </div>
      <div className="min-h-0 flex-1">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={() => router.back()}
          data-lk-theme="default"
          style={{ height: "100%" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
