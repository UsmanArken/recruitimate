/**
 * HTTP smoke tests — requires a running app (npm run dev or npm start).
 * Set QA_BASE_URL (default http://localhost:3000).
 */

const BASE_URL = (process.env.QA_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

type Check = { name: string; ok: boolean; detail?: string };

async function fetchStatus(
  path: string,
  init?: RequestInit
): Promise<{ status: number; url: string }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    redirect: "manual",
  });
  return { status: res.status, url };
}

async function main(): Promise<Check[]> {
  const checks: Check[] = [];

  try {
    const login = await fetchStatus("/login");
    checks.push({
      name: "GET /login",
      ok: login.status === 200,
      detail: `status ${login.status}`,
    });

    const signup = await fetchStatus("/signup");
    checks.push({
      name: "GET /signup",
      ok: signup.status === 200,
      detail: `status ${signup.status}`,
    });

    const home = await fetchStatus("/");
    checks.push({
      name: "GET / (unauthenticated)",
      ok: home.status === 307 || home.status === 302 || home.status === 401,
      detail: `status ${home.status} (expect redirect or 401)`,
    });

    const candidatesApi = await fetchStatus("/api/candidates");
    checks.push({
      name: "GET /api/candidates (protected)",
      ok: candidatesApi.status === 401 || candidatesApi.status === 403,
      detail: `status ${candidatesApi.status}`,
    });

    const badSignup = await fetchStatus("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });
    checks.push({
      name: "POST /api/auth/signup (invalid body)",
      ok: badSignup.status >= 400 && badSignup.status < 500,
      detail: `status ${badSignup.status}`,
    });
  } catch (e) {
    checks.push({
      name: "Server reachable",
      ok: false,
      detail: `${e instanceof Error ? e.message : e}. Start app: npm run dev`,
    });
  }

  return checks;
}

main()
  .then((checks) => {
    console.log(`API smoke against ${BASE_URL}\n`);
    let failed = 0;
    for (const c of checks) {
      if (c.ok) console.log(`✓ ${c.name}${c.detail ? ` (${c.detail})` : ""}`);
      else {
        failed += 1;
        console.error(`✗ ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
      }
    }
    if (failed > 0) process.exit(1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
