import type { OutreachCampaignStats, OutreachTrackingEvent } from "../types";

export type MessageStatusRow = {
  status: string;
};

export function computeCampaignStats(messages: MessageStatusRow[]): OutreachCampaignStats {
  const counts = {
    total: messages.length,
    draft: 0,
    generated: 0,
    sent: 0,
    opened: 0,
    replied: 0,
    bounced: 0,
    failed: 0,
  };

  for (const m of messages) {
    switch (m.status) {
      case "DRAFT":
        counts.draft += 1;
        break;
      case "GENERATED":
      case "SCHEDULED":
        counts.generated += 1;
        break;
      case "SENT":
      case "DELIVERED":
        counts.sent += 1;
        break;
      case "OPENED":
        counts.opened += 1;
        break;
      case "REPLIED":
        counts.replied += 1;
        break;
      case "BOUNCED":
        counts.bounced += 1;
        break;
      case "FAILED":
        counts.failed += 1;
        break;
      default:
        break;
    }
  }

  const sentBase =
    counts.sent + counts.opened + counts.replied + messages.filter((m) => m.status === "DELIVERED").length;
  const openRate =
    sentBase > 0 ? (counts.opened + counts.replied) / sentBase : null;
  const replyRate = sentBase > 0 ? counts.replied / sentBase : null;

  return { ...counts, openRate, replyRate };
}

const STATUS_ORDER = [
  "DRAFT",
  "GENERATED",
  "SCHEDULED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "REPLIED",
  "BOUNCED",
  "FAILED",
] as const;

export type OutreachMessageStatus = (typeof STATUS_ORDER)[number];

export function nextStatusForEvent(
  current: OutreachMessageStatus,
  event: OutreachTrackingEvent["type"]
): OutreachMessageStatus {
  switch (event) {
    case "sent":
      return "SENT";
    case "delivered":
      return current === "REPLIED" || current === "OPENED" ? current : "DELIVERED";
    case "opened":
      return current === "REPLIED" ? "REPLIED" : "OPENED";
    case "replied":
      return "REPLIED";
    case "bounced":
      return "BOUNCED";
    case "failed":
      return "FAILED";
    default:
      return current;
  }
}

export function canTransitionStatus(from: OutreachMessageStatus, to: OutreachMessageStatus): boolean {
  if (from === to) return true;
  if (to === "FAILED" || to === "BOUNCED") return true;
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  return toIdx >= fromIdx;
}
