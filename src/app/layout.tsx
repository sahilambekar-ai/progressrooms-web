import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Lora } from "next/font/google";
import "./globals.css";
import { FeedbackProvider } from "@/components/FeedbackProvider";
import { DeveloperModeProvider, DeveloperControls } from "@/components/DeveloperModeProvider";
import { CommunicationChannelsControl } from "@/components/CommunicationChannelsControl";
import { CommunicationSettingsProvider } from "@/components/CommunicationSettingsProvider";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Progress Rooms — Virtual Studio Operating System",
  description: "The studio operating system for scheduled classes, independent instructors, and multi-teacher studios.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand/logo-transparent.png", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lora.variable} style={{ "--font-lora": lora.style.fontFamily } as CSSProperties}>
      <body className="min-h-screen antialiased flex flex-col font-sans bg-[#FAF7F2] text-[#212121]">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <DeveloperModeProvider>
          <CommunicationSettingsProvider>
            <FeedbackProvider>{children}</FeedbackProvider>
            <DeveloperControls><CommunicationChannelsControl /></DeveloperControls>
          </CommunicationSettingsProvider>
        </DeveloperModeProvider>
      </body>
    </html>
  );
}
