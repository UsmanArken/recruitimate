module.exports = [
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/.next-internal/server/app/jobs/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "ButtonLink",
    ()=>ButtonLink
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
;
;
;
const variants = {
    primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30",
    secondary: "border border-border bg-card text-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-border",
    ghost: "text-muted hover:bg-background hover:text-foreground"
};
function Button({ children, className, variant = "primary", type = "button", disabled, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none disabled:opacity-50", variants[variant], className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
function ButtonLink({ href, children, className, variant = "primary" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition", variants[variant], className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyState",
    ()=>EmptyState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-rsc] (ecmascript)");
;
;
;
;
function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("py-14 text-center", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: "h-7 w-7 text-brand",
                    strokeWidth: 1.75
                }, void 0, false, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-medium text-foreground",
                children: title
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted",
                children: description
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            (primaryAction || secondaryAction) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 flex flex-wrap items-center justify-center gap-3",
                children: [
                    primaryAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ButtonLink"], {
                        href: primaryAction.href,
                        children: primaryAction.label
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                        lineNumber: 31,
                        columnNumber: 13
                    }, this),
                    secondaryAction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: secondaryAction.href,
                        className: "text-sm font-semibold text-primary hover:underline",
                        children: secondaryAction.label
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                        lineNumber: 34,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JobsPage,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$empty$2d$state$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/empty-state.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-rsc] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-rsc] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/plus.js [app-rsc] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/users.js [app-rsc] (ecmascript) <export default as Users>");
;
;
;
;
;
;
;
;
const dynamic = "force-dynamic";
async function JobsPage() {
    const jobs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverFetch"])("/api/jobs");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageHeader"], {
                title: "Open roles",
                description: "Define positions to power role-fit scoring and keep candidates organized by requisition.",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ButtonLink"], {
                    href: "/jobs/new",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        "Post new role"
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageBody"], {
                children: jobs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "p-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$empty$2d$state$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EmptyState"], {
                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"],
                            title: "No open roles yet",
                            description: "Every hiring campaign starts with a requisition. Add the role title, description, and requirements so Recruitimate can score role fit on resumes.",
                            primaryAction: {
                                href: "/jobs/new",
                                label: "Post your first role"
                            },
                            secondaryAction: {
                                href: "/",
                                label: "Back to dashboard"
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                            lineNumber: 35,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                        lineNumber: 34,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                    lineNumber: 33,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid gap-4 md:grid-cols-2",
                    children: jobs.map((job)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: `/jobs/${job.id}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                                className: "transition hover:border-primary/30 hover:shadow-md",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-start gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                                                className: "h-5 w-5 text-brand"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                                lineNumber: 53,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                            lineNumber: 52,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                                    children: job.title
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                                    lineNumber: 56,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                                    className: "mt-1 line-clamp-2",
                                                                    children: job.description
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                                    lineNumber: 57,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                            lineNumber: 55,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                    lineNumber: 51,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    className: "h-4 w-4 shrink-0 text-muted"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                    lineNumber: 62,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                            lineNumber: 50,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                        lineNumber: 49,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "pt-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5 text-sm font-medium text-muted",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                                    lineNumber: 67,
                                                    columnNumber: 23
                                                }, this),
                                                job.applicationCount,
                                                " applicant",
                                                job.applicationCount !== 1 ? "s" : "",
                                                " ",
                                                "in pipeline · Manage team →"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                            lineNumber: 66,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                        lineNumber: 65,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                                lineNumber: 48,
                                columnNumber: 17
                            }, this)
                        }, job.id, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                            lineNumber: 47,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                    lineNumber: 45,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/jobs/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b2d9d8b2._.js.map