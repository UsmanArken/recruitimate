import { Sidebar } from "@/components/layout/sidebar";
import { DemoWorkspaceBanner } from "@/components/layout/demo-workspace-banner";
import { PlatformOperatorBanner } from "@/components/layout/platform-operator-banner";
import { NavigationProgress } from "@/components/layout/navigation-progress";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="app-canvas relative flex min-h-screen flex-1 flex-col overflow-auto">
        <NavigationProgress />
        <PlatformOperatorBanner />
        <DemoWorkspaceBanner />
        {children}
      </div>
    </div>
  );
}
