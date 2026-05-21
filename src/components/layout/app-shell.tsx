import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="app-canvas flex min-h-screen flex-1 flex-col overflow-auto">
        {children}
      </div>
    </div>
  );
}
