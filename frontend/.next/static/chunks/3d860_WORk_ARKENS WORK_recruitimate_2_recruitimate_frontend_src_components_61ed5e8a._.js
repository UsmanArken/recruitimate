(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "ButtonLink",
    ()=>ButtonLink
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const variants = {
    primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/30",
    secondary: "border border-border bg-card text-foreground hover:bg-background focus-visible:ring-2 focus-visible:ring-border",
    ghost: "text-muted hover:bg-background hover:text-foreground"
};
function Button(param) {
    let { children, className, variant = "primary", type = "button", disabled, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none disabled:opacity-50", variants[variant], className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = Button;
function ButtonLink(param) {
    let { href, children, className, variant = "primary" } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition", variants[variant], className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c1 = ButtonLink;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button");
__turbopack_context__.k.register(_c1, "ButtonLink");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JobAssignmentsPanel",
    ()=>JobAssignmentsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$vocal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic2$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/mic-vocal.js [app-client] (ecmascript) <export default as Mic2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-fetch.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function JobAssignmentsPanel(param) {
    let { jobId, readOnly = false } = param;
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [assignments, setAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [members, setMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [assignmentRole, setAssignmentRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("INTERVIEWER");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [canManage, setCanManage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "JobAssignmentsPanel.useCallback[load]": async ()=>{
            try {
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/jobs/".concat(jobId, "/assignments"));
                var _data_job_assignments;
                setAssignments((_data_job_assignments = data.job.assignments) !== null && _data_job_assignments !== void 0 ? _data_job_assignments : []);
                var _data_members;
                setMembers((_data_members = data.members) !== null && _data_members !== void 0 ? _data_members : []);
                setCanManage(!readOnly && Boolean(data.canManage));
            } catch (e) {
            // silently ignore load errors
            }
        }
    }["JobAssignmentsPanel.useCallback[load]"], [
        jobId,
        readOnly
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JobAssignmentsPanel.useEffect": ()=>{
            void load();
        }
    }["JobAssignmentsPanel.useEffect"], [
        load
    ]);
    async function handleAssign(e) {
        e.preventDefault();
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/jobs/".concat(jobId, "/assignments"), {
                method: "POST",
                body: JSON.stringify({
                    userId,
                    assignmentRole
                })
            });
            setLoading(false);
            setUserId("");
            await load();
            router.refresh();
        } catch (e) {
            setLoading(false);
            setError(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? e.message : "Could not assign");
        }
    }
    async function handleRemove(assignmentId) {
        setError(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/jobs/".concat(jobId, "/assignments/").concat(assignmentId), {
                method: "DELETE"
            });
            await load();
            router.refresh();
        } catch (e) {
            setError(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? e.message : "Could not remove");
        }
    }
    const roleLabel = (role)=>role === "INTERVIEWER" ? "Interviewer" : "Hiring manager";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted",
                children: "Assign interviewers for this requisition. They receive job-scoped access from database ACL rules, including the full decision intelligence layer."
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            assignments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted",
                children: "No one assigned yet. Add an interviewer or hiring manager below."
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-2",
                children: assignments.map((a)=>{
                    var _a_user_name;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-card px-4 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ".concat(a.assignmentRole === "INTERVIEWER" ? "bg-interview-bg text-interview" : "bg-brand/10 text-brand"),
                                        children: a.assignmentRole === "INTERVIEWER" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$vocal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic2$3e$__["Mic2"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                            lineNumber: 117,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                            lineNumber: 119,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                        lineNumber: 109,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-semibold truncate",
                                                children: (_a_user_name = a.user.name) !== null && _a_user_name !== void 0 ? _a_user_name : a.user.email
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                                lineNumber: 123,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted",
                                                children: roleLabel(a.assignmentRole)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                                lineNumber: 124,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                        lineNumber: 122,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                lineNumber: 108,
                                columnNumber: 15
                            }, this),
                            canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleRemove(a.id),
                                className: "shrink-0 rounded p-1 text-muted hover:bg-risk-bg hover:text-risk",
                                "aria-label": "Remove assignment",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                    lineNumber: 134,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                lineNumber: 128,
                                columnNumber: 17
                            }, this)
                        ]
                    }, a.id, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                        lineNumber: 104,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this),
            canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleAssign,
                className: "rounded-lg border border-border bg-background/50 p-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            "Assign teammate"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 sm:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block sm:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold uppercase tracking-wide text-muted",
                                        children: "Team member"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: userId,
                                        onChange: (e)=>setUserId(e.target.value),
                                        required: true,
                                        className: "input-hr mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Select…"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this),
                                            members.map((m)=>{
                                                var _m_user_name;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: m.user.id,
                                                    children: [
                                                        (_m_user_name = m.user.name) !== null && _m_user_name !== void 0 ? _m_user_name : m.user.email,
                                                        " (",
                                                        m.role.name,
                                                        ")"
                                                    ]
                                                }, m.user.id, true, {
                                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 19
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold uppercase tracking-wide text-muted",
                                        children: "Role on this job"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: assignmentRole,
                                        onChange: (e)=>setAssignmentRole(e.target.value),
                                        className: "input-hr mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "INTERVIEWER",
                                                children: "Interviewer"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                                lineNumber: 178,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "HIRING_MANAGER",
                                                children: "Hiring manager"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                                lineNumber: 179,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                                lineNumber: 167,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-risk",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                        lineNumber: 184,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "submit",
                        disabled: loading || !userId,
                        children: loading ? "Assigning…" : "Assign to job"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                        lineNumber: 186,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
                lineNumber: 143,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/job-assignments-panel.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_s(JobAssignmentsPanel, "gxZy+z6eD0TR7EJC/SU7jDhtres=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = JobAssignmentsPanel;
var _c;
__turbopack_context__.k.register(_c, "JobAssignmentsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileDropZone",
    ()=>FileDropZone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function FileDropZone(param) {
    let { onFiles, accept, disabled, hint, label = "Drop files here", sublabel } = param;
    _s();
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [dragOver, setDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    function handleFiles(fileList) {
        const files = Array.from(fileList !== null && fileList !== void 0 ? fileList : []);
        if (files.length > 0) onFiles(files);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "button",
        tabIndex: disabled ? -1 : 0,
        onKeyDown: (e)=>{
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
                var _inputRef_current;
                e.preventDefault();
                (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.click();
            }
        },
        onClick: ()=>{
            var _inputRef_current;
            return !disabled && ((_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.click());
        },
        onDragOver: (e)=>{
            e.preventDefault();
            if (!disabled) setDragOver(true);
        },
        onDragLeave: ()=>setDragOver(false),
        onDrop: (e)=>{
            e.preventDefault();
            setDragOver(false);
            if (!disabled) handleFiles(e.dataTransfer.files);
        },
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("drop-zone", dragOver && "drop-zone--active", disabled && "pointer-events-none opacity-60"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: inputRef,
                type: "file",
                className: "sr-only",
                accept: accept,
                multiple: true,
                disabled: disabled,
                onChange: (e)=>{
                    handleFiles(e.target.files);
                    e.target.value = "";
                }
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-2 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                            className: "h-6 w-6",
                            strokeWidth: 1.75
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold text-foreground",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    sublabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "max-w-sm text-xs leading-relaxed text-muted",
                        children: sublabel
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                        lineNumber: 75,
                        columnNumber: 22
                    }, this),
                    hint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] text-muted-foreground",
                        children: hint
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                        lineNumber: 76,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(FileDropZone, "9brVLshiJTLaU0P7JkmkKn9Dg8k=");
_c = FileDropZone;
var _c;
__turbopack_context__.k.register(_c, "FileDropZone");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/avatar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Avatar",
    ()=>Avatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Avatar(param) {
    let { name, size = "md", className } = param;
    const initials = name.split(" ").map((n)=>n[0]).slice(0, 2).join("").toUpperCase();
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand", sizes[size], className),
        "aria-hidden": true,
        children: initials
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/avatar.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c = Avatar;
var _c;
__turbopack_context__.k.register(_c, "Avatar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BulkImportResultCard",
    ()=>BulkImportResultCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/candidates/avatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
;
;
;
;
;
function BulkImportResultCard(param) {
    let { row } = param;
    const href = "/candidates/".concat(row.candidateId, "/applications/").concat(row.applicationId);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        className: "flex items-center gap-3 rounded-xl border border-border-subtle bg-card p-3.5 shadow-sm transition hover:border-primary/35 hover:bg-background hover:shadow-md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$candidates$2f$avatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Avatar"], {
                name: row.candidateName,
                size: "sm"
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "truncate font-semibold text-foreground",
                        children: row.candidateName
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "truncate text-xs text-muted",
                        children: row.fileName
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    row.status === "duplicate" && row.message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-xs text-warning",
                        children: row.message
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 text-right",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-bold tabular-nums ".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scoreColor"])(row.roleFitScore)),
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatScore"])(row.roleFitScore)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] text-muted",
                        children: "role fit"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    row.hireConfidence != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-[11px] text-muted",
                        children: [
                            Math.round(row.hireConfidence * 100),
                            "% confidence"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                className: "h-4 w-4 shrink-0 text-muted"
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = BulkImportResultCard;
var _c;
__turbopack_context__.k.register(_c, "BulkImportResultCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BulkResumeUploadPanel",
    ()=>BulkResumeUploadPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$file$2d$drop$2d$zone$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/file-drop-zone.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/files.js [app-client] (ecmascript) <export default as Files>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
(()=>{
    const e = new Error("Cannot find module '@/lib/resume/extract-text'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$jobs$2f$bulk$2d$import$2d$result$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-import-result-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-fetch.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function pickResumeFiles(files) {
    return files.filter((f)=>isAllowedResumeFile(f.name, f.type));
}
function BulkResumeUploadPanel(param) {
    let { jobId } = param;
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const folderInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [skippedCount, setSkippedCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    function setPickedFiles(all) {
        const resumes = pickResumeFiles(all);
        setFiles(resumes);
        setSkippedCount(Math.max(0, all.length - resumes.length));
        setResults(null);
        setError(resumes.length === 0 && all.length > 0 ? "No PDF or DOCX files found. Only .pdf and .docx are supported." : null);
    }
    function openFolderPicker() {
        const el = folderInputRef.current;
        if (!el) return;
        el.setAttribute("multiple", "");
        el.setAttribute("webkitdirectory", "");
        el.setAttribute("directory", "");
        el.removeAttribute("accept");
        el.click();
    }
    function onFolderPick(e) {
        var _e_target_files;
        setPickedFiles(Array.from((_e_target_files = e.target.files) !== null && _e_target_files !== void 0 ? _e_target_files : []));
        e.target.value = "";
    }
    async function upload() {
        if (files.length === 0) {
            setError("Add resumes using the drop zone or folder picker.");
            return;
        }
        setLoading(true);
        setProgress(15);
        setError(null);
        setResults(null);
        const form = new FormData();
        for (const f of files)form.append("files", f);
        const timer = window.setInterval(()=>{
            setProgress((p)=>p < 85 ? p + 5 : p);
        }, 800);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/jobs/".concat(jobId, "/bulk-resumes"), {
                method: "POST",
                body: form
            });
            window.clearInterval(timer);
            setProgress(100);
            setLoading(false);
            const rows = Array.isArray(data.results) ? data.results : [];
            setResults(rows);
            setTimeout(()=>setProgress(0), 600);
            router.refresh();
        } catch (e) {
            window.clearInterval(timer);
            setProgress(0);
            setLoading(false);
            setError(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? e.message : "Bulk upload failed.");
        }
    }
    var _results_filter;
    const created = (_results_filter = results === null || results === void 0 ? void 0 : results.filter((r)=>r.status === "created")) !== null && _results_filter !== void 0 ? _results_filter : [];
    var _results_filter1;
    const duplicates = (_results_filter1 = results === null || results === void 0 ? void 0 : results.filter((r)=>r.status === "duplicate")) !== null && _results_filter1 !== void 0 ? _results_filter1 : [];
    var _results_filter2;
    const failed = (_results_filter2 = results === null || results === void 0 ? void 0 : results.filter((r)=>r.status === "failed")) !== null && _results_filter2 !== void 0 ? _results_filter2 : [];
    const canImport = files.length > 0 && !loading;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: folderInputRef,
                type: "file",
                className: "sr-only",
                onChange: onFolderPick,
                disabled: loading
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$file$2d$drop$2d$zone$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileDropZone"], {
                disabled: loading,
                label: "Drop resumes here",
                sublabel: "PDF or DOCX — we'll screen each file against this role and rank applicants below.",
                hint: "Tip: use Choose folder for a full batch in Chrome or Edge",
                onFiles: setPickedFiles,
                accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "secondary",
                        disabled: loading,
                        onClick: openFolderPicker,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            "Choose folder"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        variant: "secondary",
                        disabled: loading,
                        onClick: ()=>{
                            var _document_getElementById;
                            return (_document_getElementById = document.getElementById("bulk-files-".concat(jobId))) === null || _document_getElementById === void 0 ? void 0 : _document_getElementById.click();
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__["Files"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this),
                            "Choose files"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "bulk-files-".concat(jobId),
                        type: "file",
                        className: "sr-only",
                        multiple: true,
                        disabled: loading,
                        accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        onChange: (e)=>{
                            var _e_target_files;
                            setPickedFiles(Array.from((_e_target_files = e.target.files) !== null && _e_target_files !== void 0 ? _e_target_files : []));
                            e.target.value = "";
                        }
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-foreground",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold",
                        children: files.length
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this),
                    " resume",
                    files.length !== 1 ? "s" : "",
                    " ready",
                    skippedCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-muted",
                        children: [
                            " · ",
                            skippedCount,
                            " other file(s) skipped"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 161,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 157,
                columnNumber: 9
            }, this),
            loading && progress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-1 flex justify-between text-xs text-muted",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Screening resumes…"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    progress,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "progress-hr",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "progress-hr__bar",
                            style: {
                                width: "".concat(progress, "%")
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                            lineNumber: 173,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 167,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                type: "button",
                onClick: upload,
                disabled: !canImport,
                className: "shadow-sm",
                children: loading ? "Screening…" : files.length > 0 ? "Screen ".concat(files.length, " resume").concat(files.length !== 1 ? "s" : "") : "Screen resumes"
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-risk",
                children: error
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 186,
                columnNumber: 17
            }, this),
            results && created.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-success/25 bg-success-bg/40 px-4 py-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold text-success",
                        children: [
                            created.length,
                            " applicant",
                            created.length !== 1 ? "s" : "",
                            " screened — see ranked pipeline below"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 190,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "#job-pipeline",
                        className: "mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
                        children: [
                            "Jump to pipeline",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                className: "h-3 w-3"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 199,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, this),
            results && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-semibold",
                        children: [
                            "Imported ",
                            created.length,
                            " · Skipped ",
                            duplicates.length,
                            " duplicate",
                            duplicates.length !== 1 ? "s" : "",
                            " · Failed ",
                            failed.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 206,
                        columnNumber: 11
                    }, this),
                    (created.length > 0 || duplicates.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-2 sm:grid-cols-2",
                        children: [
                            ...created,
                            ...duplicates
                        ].map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$features$2f$jobs$2f$bulk$2d$import$2d$result$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BulkImportResultCard"], {
                                row: row
                            }, "".concat(row.applicationId, "-").concat(row.fileName), false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 214,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 212,
                        columnNumber: 13
                    }, this),
                    failed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-risk/20 bg-risk-bg/30 p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-risk",
                                children: "Could not import"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 221,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "mt-2 space-y-1 text-xs text-muted",
                                children: failed.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-foreground",
                                                children: r.fileName
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                                lineNumber: 225,
                                                columnNumber: 21
                                            }, this),
                                            " — ",
                                            r.error
                                        ]
                                    }, r.fileName, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                        lineNumber: 224,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                                lineNumber: 222,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                        lineNumber: 220,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/bulk-resume-upload-panel.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(BulkResumeUploadPanel, "jT6ES7ZeoYwQsvdmlgKlpyAgLFw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = BulkResumeUploadPanel;
var _c;
__turbopack_context__.k.register(_c, "BulkResumeUploadPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InterviewQuestionBankPanel",
    ()=>InterviewQuestionBankPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/list-checks.js [app-client] (ecmascript) <export default as ListChecks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/api-fetch.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const categoryLabels = {
    technical: "Technical",
    behavioral: "Behavioral",
    situational: "Situational",
    role_fit: "Role fit",
    culture: "Culture"
};
const categoryStyles = {
    technical: "bg-interview/10 text-interview",
    behavioral: "bg-talent-bg text-talent",
    situational: "bg-warning-bg text-warning",
    role_fit: "bg-brand/10 text-brand",
    culture: "bg-success-bg text-success"
};
const difficultyStyles = {
    easy: "bg-background text-muted ring-1 ring-border",
    medium: "bg-warning-bg text-warning",
    hard: "bg-risk-bg text-risk"
};
function InterviewQuestionBankPanel(param) {
    let { jobId, jobTitle, compact = false } = param;
    _s();
    const [focus, setFocus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bank, setBank] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [copiedId, setCopiedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function generate() {
        setLoading(true);
        setError(null);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiFetch"])("/api/jobs/".concat(jobId, "/interview-questions"), {
                method: "POST",
                body: JSON.stringify({
                    focus,
                    count: compact ? 8 : 12
                })
            });
            setBank(data);
        } catch (e) {
            setError(e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$api$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] ? e.message : "Could not generate questions");
        } finally{
            setLoading(false);
        }
    }
    async function copyQuestion(question) {
        await navigator.clipboard.writeText(question.question);
        setCopiedId(question.id);
        setTimeout(()=>setCopiedId(null), 2000);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: compact ? "rounded-lg border border-border-subtle bg-card/50 p-4" : "rounded-lg border-2 border-primary/20 bg-card p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex flex-wrap items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "flex items-center gap-2 text-sm font-semibold",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__["ListChecks"], {
                                        className: "h-4 w-4 text-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                        lineNumber: 85,
                                        columnNumber: 13
                                    }, this),
                                    "Interview question bank",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary",
                                        children: "Phase 2"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-muted",
                                children: [
                                    "AI-generated, role-specific questions for ",
                                    jobTitle,
                                    ". Pick what fits your interview style."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "button",
                        className: "h-8 px-3 text-xs",
                        disabled: loading,
                        onClick: generate,
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-4 w-4 animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                            lineNumber: 103,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this),
                                "Generate questions"
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-semibold text-muted",
                        children: "Focus:"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    [
                        "all",
                        "technical",
                        "behavioral",
                        "situational",
                        "role_fit",
                        "culture"
                    ].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setFocus(option),
                            className: "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ".concat(focus === option ? "bg-primary text-primary-foreground" : "bg-background text-muted ring-1 ring-border hover:text-foreground"),
                            children: option === "all" ? "All" : categoryLabels[option]
                        }, option, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            bank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "rounded-lg border border-border-subtle bg-background/60 px-3 py-2 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: "Role focus: "
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                lineNumber: 136,
                                columnNumber: 13
                            }, this),
                            bank.roleSummary
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "space-y-2",
                        children: bank.questions.map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "rounded-lg border border-border-subtle bg-card p-3 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-start justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ".concat(categoryStyles[q.category]),
                                                        children: categoryLabels[q.category]
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ".concat(difficultyStyles[q.difficulty]),
                                                        children: q.difficulty
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                                        lineNumber: 153,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                                lineNumber: 147,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                type: "button",
                                                variant: "secondary",
                                                className: "h-7 px-2 text-xs",
                                                onClick: ()=>copyQuestion(q),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                        className: "h-3 w-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                                        lineNumber: 165,
                                                        columnNumber: 21
                                                    }, this),
                                                    copiedId === q.id ? "Copied" : "Copy"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                        lineNumber: 146,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-2 text-sm font-medium leading-relaxed",
                                        children: q.question
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                        lineNumber: 169,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-xs text-muted",
                                        children: q.rationale
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                        lineNumber: 170,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-xs text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium",
                                                children: "Probes for: "
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this),
                                            q.probesFor
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                        lineNumber: 171,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, q.id, true, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                                lineNumber: 142,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this),
                    bank.explanation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs italic text-muted",
                        children: bank.explanation
                    }, void 0, false, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                        lineNumber: 180,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this),
            !bank && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted",
                children: "Click Generate to build a question bank from this role's description and requirements."
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                lineNumber: 186,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-sm text-risk",
                children: error
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
                lineNumber: 191,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/interview-question-bank-panel.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(InterviewQuestionBankPanel, "ko5zJW+NkD1EaS03MWir8hifSKI=");
_c = InterviewQuestionBankPanel;
var _c;
__turbopack_context__.k.register(_c, "InterviewQuestionBankPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card(param) {
    let { className, children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader(param) {
    let { className, children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-1 border-b border-border-subtle px-6 py-5", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle(param) {
    let { className, children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-base font-bold tracking-tight text-foreground", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription(param) {
    let { className, children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm leading-relaxed text-muted", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 57,
        columnNumber: 10
    }, this);
}
_c3 = CardDescription;
function CardContent(param) {
    let { className, children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-6", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx",
        lineNumber: 67,
        columnNumber: 10
    }, this);
}
_c4 = CardContent;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SignupLinkCard",
    ()=>SignupLinkCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/check-check.js [app-client] (ecmascript) <export default as CheckCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link2$3e$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/node_modules/lucide-react/dist/esm/icons/link-2.js [app-client] (ecmascript) <export default as Link2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/ui/card.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function SignupLinkCard(param) {
    let { signupToken, interviewMode } = param;
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const url = "".concat(("TURBOPACK compile-time truthy", 1) ? window.location.origin : "TURBOPACK unreachable", "/apply/").concat(signupToken);
    async function copy() {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "mb-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link2$3e$__["Link2"], {
                                className: "h-4 w-4 text-primary"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            "Candidate signup link"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                        children: [
                            "Share this link with candidates to apply for this role.",
                            " ",
                            interviewMode === "automated" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-primary",
                                children: "Automated AI interview enabled."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex-1 truncate font-mono text-sm text-foreground",
                            children: url
                        }, void 0, false, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: copy,
                            className: "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted",
                            children: [
                                copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__["CheckCheck"], {
                                    className: "h-3.5 w-3.5 text-green-500"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                                    lineNumber: 45,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$WORk$2f$ARKENS__WORK$2f$recruitimate_2$2f$recruitimate$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                                    lineNumber: 47,
                                    columnNumber: 15
                                }, this),
                                copied ? "Copied!" : "Copy"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/WORk/ARKENS WORK/recruitimate_2/recruitimate/frontend/src/components/features/jobs/signup-link-card.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(SignupLinkCard, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c = SignupLinkCard;
var _c;
__turbopack_context__.k.register(_c, "SignupLinkCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=3d860_WORk_ARKENS%20WORK_recruitimate_2_recruitimate_frontend_src_components_61ed5e8a._.js.map