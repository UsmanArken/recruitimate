import { badRequest } from "@/lib/api/errors";
import { isLinkedInProfileUrl } from "@/lib/linkedin/parse-profile";

/** Best-effort public profile text via reader proxy (no LinkedIn API key). */
export async function fetchLinkedInProfileText(profileUrl: string): Promise<string> {
  if (!isLinkedInProfileUrl(profileUrl)) {
    throw badRequest("Provide a linkedin.com profile URL", "INVALID_LINKEDIN_URL");
  }

  const normalized = profileUrl.startsWith("http") ? profileUrl : `https://${profileUrl}`;
  const readerUrl = `https://r.jina.ai/${normalized}`;

  const res = await fetch(readerUrl, {
    headers: { Accept: "text/plain" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw badRequest(
      "Could not fetch this profile automatically. Paste the profile text from LinkedIn instead.",
      "LINKEDIN_FETCH_FAILED"
    );
  }

  const text = (await res.text()).trim();
  if (text.length < 80) {
    throw badRequest(
      "Fetched profile had too little text. Paste the full profile export from LinkedIn.",
      "LINKEDIN_FETCH_EMPTY"
    );
  }

  return text;
}
