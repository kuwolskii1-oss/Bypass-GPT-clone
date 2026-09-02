import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your usage, plan and history.",
  robots: { index: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
