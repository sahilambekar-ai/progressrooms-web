import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { FeedbackProvider } from "@/components/FeedbackProvider";
import { FontInitializer } from "@/components/FontInitializer";
import { DeveloperModeProvider } from "@/components/DeveloperModeProvider";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProgressNow — Virtual Studio Operating System",
  description: "The sanctuary operating system for scheduled classes, independent instructors, and multi-teacher studios.",
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
    <html lang="en" className={lora.variable}>
      <body className="min-h-screen antialiased flex flex-col font-sans bg-[#FAF7F2] text-[#212121]">
        <FontInitializer />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <DeveloperModeProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </DeveloperModeProvider>
      </body>
    </html>
  );
}
