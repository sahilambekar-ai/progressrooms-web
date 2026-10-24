import { DashboardTypographyProvider } from "@/components/DashboardTypographyProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardTypographyProvider>{children}</DashboardTypographyProvider>;
}
