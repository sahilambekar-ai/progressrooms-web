import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProgressRooms — Operating System for Scheduled Classes",
  description: "Industry-agnostic multi-tenant SaaS for teachers, studios, coaches, and academies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
