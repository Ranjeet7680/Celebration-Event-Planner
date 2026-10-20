import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EventProvider } from "@/context/EventContext";

export const metadata: Metadata = {
  title: "PromptWars — AI-Powered Celebration & Event Planner",
  description: "Every celebration starts with a spark. AI assistance, budget tracking, guest management, and vendor marketplace for extraordinary events.",
};

export const viewport: Viewport = {
  themeColor: "#0B1020",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#0B1020] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
        <EventProvider>{children}</EventProvider>
      </body>
    </html>
  );
}
