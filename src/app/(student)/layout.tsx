import { DashboardTypographyProvider } from "@/components/DashboardTypographyProvider";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardTypographyProvider>{children}</DashboardTypographyProvider>;
}
