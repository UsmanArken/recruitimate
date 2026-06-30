import { Sidebar } from "@/components/layout/sidebar";
import { PlatformOperatorBanner } from "@/components/layout/platform-operator-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="app-canvas flex flex-1 flex-col overflow-y-auto">
        <PlatformOperatorBanner />
        {children}
      </div>
    </div>
  );
}
