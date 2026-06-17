import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ConditionalShell } from "@/components/layout/conditional-shell";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recruitimate — Hiring Intelligence for HR Teams",
  description: "Talent, interview, and decision intelligence built for recruiters and hiring managers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} min-h-screen antialiased`}>
        <AuthSessionProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
