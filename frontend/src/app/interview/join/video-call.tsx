"use client";

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useRouter } from "next/navigation";
import { LiveAssistPanel } from "./live-assist-panel";

interface Props {
  token: string;
  serverUrl: string;
  interviewTitle: string;
  returnTo: string;
  interviewId: string;
  applicationId: string;
}

export function VideoCall({ token, serverUrl, interviewTitle, returnTo, interviewId, applicationId }: Props) {
  const router = useRouter();
  const showPanel = Boolean(interviewId && applicationId);

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <span className="text-sm font-medium text-white">{interviewTitle}</span>
      </div>
      <div className="flex min-h-0 flex-1">
        {/* Video — takes remaining width */}
        <div className={showPanel ? "flex-1 min-w-0" : "flex-1"}>
          <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={() => router.push(returnTo)}
            data-lk-theme="default"
            style={{ height: "100%" }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>

        {/* Live transcript + suggest panel */}
        {showPanel && (
          <div className="w-80 shrink-0">
            <LiveAssistPanel interviewId={interviewId} applicationId={applicationId} />
          </div>
        )}
      </div>
    </div>
  );
}
