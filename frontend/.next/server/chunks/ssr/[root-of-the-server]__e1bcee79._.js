module.exports = [
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/.next-internal/server/app/admin/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/layout/page-header.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/building-2.js [app-rsc] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-rsc] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/eye.js [app-rsc] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/shield.js [app-rsc] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/users.js [app-rsc] (ecmascript) <export default as Users>");
;
;
;
;
;
;
;
const dynamic = "force-dynamic";
async function AdminPage() {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAuthUser"])();
    if (!user.isPlatformAdmin) (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/");
    const organizations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverFetch"])("/api/admin/organizations");
    const stats = {
        organizations: organizations.length,
        users: organizations.reduce((acc, o)=>acc + o.memberCount, 0),
        jobs: organizations.reduce((acc, o)=>acc + o.jobCount, 0),
        candidates: organizations.reduce((acc, o)=>acc + o.applicationCount, 0)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageHeader"], {
                title: "Platform administration",
                description: "Your home as a SaaS operator — tenant list and platform metrics. Customer signups never receive this access."
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$layout$2f$page$2d$header$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageBody"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                        className: "mb-8 border-primary/20 bg-primary/5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "flex flex-wrap items-center justify-between gap-4 py-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-foreground",
                                            children: "Customer hiring data"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                            lineNumber: 41,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-muted",
                                            children: "Optional read-only view across tenants — no posting roles or changing records."
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                            lineNumber: 42,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/candidates?operatorBrowse=1",
                                    className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                            lineNumber: 50,
                                            columnNumber: 15
                                        }, this),
                                        "Browse hiring pipeline"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8 grid gap-4 sm:grid-cols-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                label: "Organizations",
                                value: stats.organizations,
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"]
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                label: "Users",
                                value: stats.users,
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                label: "Jobs",
                                value: stats.jobs,
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"]
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                label: "Applications",
                                value: stats.candidates,
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"]
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        children: "Tenant organizations"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardDescription"], {
                                        children: [
                                            organizations.length,
                                            " customer workspace",
                                            organizations.length === 1 ? "" : "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                        lineNumber: 66,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: organizations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted",
                                    children: "No customer organizations yet."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                    lineNumber: 72,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "overflow-x-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full text-left text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "border-b border-border text-xs uppercase text-muted",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "py-2 pr-4",
                                                            children: "Name"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                            lineNumber: 78,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "py-2 pr-4",
                                                            children: "Slug"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                            lineNumber: 79,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "py-2 pr-4",
                                                            children: "Members"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                            lineNumber: 80,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "py-2 pr-4",
                                                            children: "Jobs"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                            lineNumber: 81,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "py-2",
                                                            children: "Applications"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                            lineNumber: 82,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                lineNumber: 76,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: organizations.map((org)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-b border-border/60",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-3 pr-4 font-medium",
                                                                children: org.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                                lineNumber: 88,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-3 pr-4 text-muted",
                                                                children: org.slug
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                                lineNumber: 89,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-3 pr-4 tabular-nums",
                                                                children: org.memberCount
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-3 pr-4 tabular-nums",
                                                                children: org.jobCount
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                                lineNumber: 91,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-3 tabular-nums",
                                                                children: org.applicationCount
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                                lineNumber: 92,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, org.id, true, {
                                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                        lineNumber: 87,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                                lineNumber: 85,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                        lineNumber: 75,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                    lineNumber: 74,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
function Stat({ label, value, icon: Icon }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border border-border bg-card p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-2xl font-bold tabular-nums",
                children: value
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx",
        lineNumber: 116,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/app/admin/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e1bcee79._.js.map