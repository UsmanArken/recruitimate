import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/app-shell";
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
