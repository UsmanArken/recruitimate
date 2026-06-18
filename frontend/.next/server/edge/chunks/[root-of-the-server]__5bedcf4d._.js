(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__5bedcf4d._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
const RECRUITER_PUBLIC_PATHS = [
    "/login",
    "/signup",
    "/invite",
    "/auth/signout",
    "/interview"
];
const CANDIDATE_PUBLIC_PATHS = [
    "/apply",
    "/candidate/login"
];
const TOKEN_KEY = "recruitimate_token";
const CANDIDATE_TOKEN_KEY = "candidate_token";
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
    } catch  {
        return true;
    }
}
function middleware(request) {
    const { pathname } = request.nextUrl;
    // --- Candidate portal routes ---
    if (pathname.startsWith("/candidate/") || pathname.startsWith("/apply/")) {
        const isCandidatePublic = CANDIDATE_PUBLIC_PATHS.some((p)=>pathname === p || pathname.startsWith(`${p}/`));
        const rawCandidateToken = request.cookies.get(CANDIDATE_TOKEN_KEY)?.value;
        const candidateToken = rawCandidateToken && !isTokenExpired(rawCandidateToken) ? rawCandidateToken : null;
        if (!isCandidatePublic) {
            if (rawCandidateToken && !candidateToken) {
                const loginUrl = request.nextUrl.clone();
                loginUrl.pathname = "/candidate/login";
                loginUrl.searchParams.set("callbackUrl", pathname);
                const response = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
                response.cookies.delete(CANDIDATE_TOKEN_KEY);
                return response;
            }
            if (!candidateToken) {
                const loginUrl = request.nextUrl.clone();
                loginUrl.pathname = "/candidate/login";
                loginUrl.searchParams.set("callbackUrl", pathname);
                return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
            }
        }
        // Redirect already-authenticated candidates away from login
        if (candidateToken && pathname === "/candidate/login") {
            const dashUrl = request.nextUrl.clone();
            dashUrl.pathname = "/candidate/dashboard";
            dashUrl.search = "";
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(dashUrl);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // --- Recruiter routes ---
    const isPublic = RECRUITER_PUBLIC_PATHS.some((p)=>pathname === p || pathname.startsWith(`${p}/`));
    const rawToken = request.cookies.get(TOKEN_KEY)?.value;
    const token = rawToken && !isTokenExpired(rawToken) ? rawToken : null;
    if (rawToken && !token) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        response.cookies.delete(TOKEN_KEY);
        return response;
    }
    if (!isPublic && !token) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    if (token && (pathname === "/login" || pathname === "/signup")) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = "/";
        homeUrl.search = "";
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(homeUrl);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|public|api).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__5bedcf4d._.js.map