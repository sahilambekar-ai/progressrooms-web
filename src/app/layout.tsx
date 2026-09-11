import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { FeedbackProvider } from "@/components/FeedbackProvider";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
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
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-screen antialiased flex flex-col font-sans bg-[#FAF7F2] text-[#212121]">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <FeedbackProvider>{children}</FeedbackProvider>
      </body>
    </html>
  );
}
