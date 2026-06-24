import { Sidebar } from "@/components/layout/sidebar";
import { PlatformOperatorBanner } from "@/components/layout/platform-operator-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="app-canvas flex min-h-screen flex-1 flex-col">
        <PlatformOperatorBanner />
        {children}
      </div>
    </div>
  );
}
