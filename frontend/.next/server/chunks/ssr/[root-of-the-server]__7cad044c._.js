module.exports = [
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/.next-internal/server/app/candidates/[id]/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/icon.svg.mjs { IMAGE => \"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/icon.svg (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/icon.svg.mjs { IMAGE => \"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/icon.svg (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthUser",
    ()=>getAuthUser,
    "serverFetch",
    ()=>serverFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$redirect$2d$error$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/components/redirect-error.js [app-rsc] (ecmascript)");
;
;
;
const TOKEN_KEY = "recruitimate_token";
// Server-side: always needs an absolute URL — use FASTAPI_URL (server-only env var)
const API_BASE = process.env.FASTAPI_URL ?? ("TURBOPACK compile-time value", "") ?? "http://localhost:8000";
async function serverFetch(path, options = {}) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(TOKEN_KEY)?.value;
    if (!token) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/login?callbackUrl=${encodeURIComponent(path)}`);
    }
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        },
        cache: "no-store"
    });
    if (res.status === 401) {
        // Redirect through the sign-out route so the stale cookie is cleared before
        // hitting /login — otherwise middleware sees the cookie and bounces back here.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/auth/signout");
    }
    if (!res.ok) {
        const body = await res.json().catch(()=>({
                detail: res.statusText
            }));
        throw new Error(body.detail ?? "Request failed");
    }
    return res.json();
}
async function getAuthUser() {
    try {
        return await serverFetch("/api/auth/me");
    } catch (err) {
        // Re-throw Next.js redirect errors — swallowing them would break the redirect
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$redirect$2d$error$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRedirectError"])(err)) throw err;
        // For network errors (backend down), clear cookie and redirect
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/auth/signout");
    }
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatScore",
    ()=>formatScore,
    "scoreBarColor",
    ()=>scoreBarColor,
    "scoreColor",
    ()=>scoreColor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/clsx/dist/clsx.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-rsc] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatScore(score) {
    if (score == null) return "—";
    return `${Math.round(score)}%`;
}
function scoreColor(score, invert = false) {
    if (score == null) return "text-muted";
    const effective = invert ? 100 - score : score;
    if (effective >= 75) return "text-success";
    if (effective >= 50) return "text-warning";
    return "text-risk";
}
function scoreBarColor(score, invert = false) {
    if (score == null) return "bg-border";
    const effective = invert ? 100 - score : score;
    if (effective >= 75) return "bg-success";
    if (effective >= 50) return "bg-warning";
    return "bg-risk";
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageBody",
    ()=>PageBody,
    "PageHeader",
    ()=>PageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function PageHeader({ title, description, children, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("border-b border-border bg-card/80 px-8 py-6 backdrop-blur-sm", className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap items-start justify-between gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this),
                        description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 max-w-2xl text-sm leading-relaxed text-muted",
                            children: description
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
                            lineNumber: 27,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                children && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex shrink-0 items-center gap-2",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
                    lineNumber: 30,
                    columnNumber: 22
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
function PageBody({ children, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("p-8", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx",
        lineNumber: 43,
        columnNumber: 10
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/stage-badge.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StageBadge",
    ()=>StageBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
const stageStyles = {
    NEW: "bg-slate-100 text-slate-700",
    TALENT_REVIEW: "bg-violet-50 text-violet-800 ring-1 ring-violet-200/80",
    SHORTLISTED: "bg-teal-50 text-teal-800 ring-1 ring-teal-200/80",
    INTERVIEW_SCHEDULED: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
    INTERVIEWED: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80",
    DECISION: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
    HIRED: "bg-success-bg text-success ring-1 ring-emerald-200/80",
    REJECTED: "bg-risk-bg text-risk ring-1 ring-red-200/60"
};
const stageLabels = {
    NEW: "New applicant",
    TALENT_REVIEW: "Talent review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview scheduled",
    INTERVIEWED: "Interviewed",
    DECISION: "Decision pending",
    HIRED: "Hired",
    REJECTED: "Rejected"
};
function StageBadge({ stage }) {
    const key = stage.toUpperCase();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", stageStyles[key] ?? stageStyles.NEW),
        children: stageLabels[key] ?? stage.replace(/_/g, " ").toLowerCase()
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/stage-badge.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/avatar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Avatar",
    ()=>Avatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function Avatar({ name, size = "md", className }) {
    const initials = name.split(" ").map((n)=>n[0]).slice(0, 2).join("").toUpperCase();
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("flex shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand", sizes[size], className),
        "aria-hidden": true,
        children: initials
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/avatar.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ApplyToPosition",
    ()=>ApplyToPosition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ApplyToPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ApplyToPosition() from the server but ApplyToPosition is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx <module evaluation>", "ApplyToPosition");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ApplyToPosition",
    ()=>ApplyToPosition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ApplyToPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ApplyToPosition() from the server but ApplyToPosition is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx", "ApplyToPosition");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$apply$2d$to$2d$position$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$apply$2d$to$2d$position$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$apply$2d$to$2d$position$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "CandidateNotesPanel",
    ()=>CandidateNotesPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CandidateNotesPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CandidateNotesPanel() from the server but CandidateNotesPanel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx <module evaluation>", "CandidateNotesPanel");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "CandidateNotesPanel",
    ()=>CandidateNotesPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CandidateNotesPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CandidateNotesPanel() from the server but CandidateNotesPanel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx", "CandidateNotesPanel");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$candidate$2d$notes$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$candidate$2d$notes$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$candidate$2d$notes$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "LinkedInEnrichPanel",
    ()=>LinkedInEnrichPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LinkedInEnrichPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LinkedInEnrichPanel() from the server but LinkedInEnrichPanel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx <module evaluation>", "LinkedInEnrichPanel");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "LinkedInEnrichPanel",
    ()=>LinkedInEnrichPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LinkedInEnrichPanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LinkedInEnrichPanel() from the server but LinkedInEnrichPanel is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx", "LinkedInEnrichPanel");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$linkedin$2d$enrich$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$linkedin$2d$enrich$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$linkedin$2d$enrich$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
function Card({ className, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-1 border-b border-border-subtle px-6 py-5", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("text-base font-bold tracking-tight text-foreground", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("text-sm leading-relaxed text-muted", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 57,
        columnNumber: 10
    }, this);
}
function CardContent({ className, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("p-6", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 67,
        columnNumber: 10
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "DeleteCandidateButton",
    ()=>DeleteCandidateButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const DeleteCandidateButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call DeleteCandidateButton() from the server but DeleteCandidateButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx <module evaluation>", "DeleteCandidateButton");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "DeleteCandidateButton",
    ()=>DeleteCandidateButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const DeleteCandidateButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call DeleteCandidateButton() from the server but DeleteCandidateButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx", "DeleteCandidateButton");
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$delete$2d$candidate$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$delete$2d$candidate$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$delete$2d$candidate$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CandidatePersonPage,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$stage$2d$badge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/stage-badge.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/avatar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$apply$2d$to$2d$position$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/apply-to-position.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$candidate$2d$notes$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/candidate-notes-panel.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$linkedin$2d$enrich$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/linkedin-enrich-panel.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$delete$2d$candidate$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/delete-candidate-button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-rsc] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/mail.js [app-rsc] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-rsc] (ecmascript) <export default as Briefcase>");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const dynamic = "force-dynamic";
function decisionStatusLabel(recommendation, hireConfidence) {
    if (recommendation === "pending_interview") return "Awaiting interview";
    if (hireConfidence != null) return `${Math.round(hireConfidence * 100)}% confidence`;
    return "—";
}
async function CandidatePersonPage({ params }) {
    const { id } = await params;
    const [candidate, jobs] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverFetch"])(`/api/candidates/${id}`).catch(()=>null),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverFetch"])("/api/jobs")
    ]);
    if (!candidate) (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const appliedJobIds = candidate.applications.map((a)=>a.jobId);
    const openJobs = jobs.map((j)=>({
            id: j.id,
            title: j.title
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-border bg-card px-8 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/candidates",
                        className: "mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            "Back to candidates"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-start gap-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$avatar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Avatar"], {
                                name: candidate.name,
                                size: "lg"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-1 flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-2xl font-bold tracking-tight",
                                                children: candidate.name
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                lineNumber: 77,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$delete$2d$candidate$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DeleteCandidateButton"], {
                                                candidateId: candidate.id,
                                                candidateName: candidate.name
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                lineNumber: 78,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    candidate.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 flex items-center gap-1.5 text-sm text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                className: "h-3.5 w-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                lineNumber: 82,
                                                columnNumber: 17
                                            }, this),
                                            candidate.email
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted",
                                        children: "One resume, multiple hiring campaigns. Each open position has its own role fit, interviews, and hire recommendation."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                        lineNumber: 86,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageBody"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardHeader"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "text-base",
                                            children: "Open position reviews"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                            lineNumber: 98,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardDescription"], {
                                            children: "Select a campaign to view talent screening, interviews, and decision intelligence for that requisition."
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                            lineNumber: 99,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "p-0",
                                    children: candidate.applications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "px-6 py-8 text-sm text-muted",
                                        children: "No positions linked yet. Apply this person to an open position below."
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                        lineNumber: 106,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: candidate.applications.map((app)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "border-t border-border-subtle first:border-t-0",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/candidates/${candidate.id}/applications/${app.id}`,
                                                    className: "flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                                            className: "h-5 w-5 text-brand"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0 flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "font-semibold text-foreground",
                                                                    children: app.job?.title ?? "Unknown role"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                                    lineNumber: 122,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm text-muted",
                                                                    children: decisionStatusLabel(app.decision?.recommendation, app.decision?.hireConfidence)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                                    lineNumber: 123,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                            lineNumber: 121,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$stage$2d$badge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StageBadge"], {
                                                            stage: app.stage
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                            lineNumber: 130,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-sm font-bold tabular-nums ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["scoreColor"])(app.talentProfile?.roleFitScore)}`,
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatScore"])(app.talentProfile?.roleFitScore)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                            lineNumber: 131,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                    lineNumber: 116,
                                                    columnNumber: 23
                                                }, this)
                                            }, app.id, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                        lineNumber: 110,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$linkedin$2d$enrich$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LinkedInEnrichPanel"], {
                            candidateId: candidate.id,
                            linkedInUrl: candidate.linkedInUrl
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$candidate$2d$notes$2d$panel$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CandidateNotesPanel"], {
                            candidateId: candidate.id,
                            initialNotes: candidate.notes,
                            readOnly: false
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardHeader"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "text-base",
                                            children: "Apply to another position"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                            lineNumber: 163,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardDescription"], {
                                            children: "Reuse the same resume for a different hiring campaign — role fit and decisions are computed per position."
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                            lineNumber: 164,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                    lineNumber: 162,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$apply$2d$to$2d$position$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ApplyToPosition"], {
                                        candidateId: candidate.id,
                                        excludeJobIds: appliedJobIds,
                                        initialJobs: openJobs
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                            lineNumber: 161,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/candidates/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7cad044c._.js.map