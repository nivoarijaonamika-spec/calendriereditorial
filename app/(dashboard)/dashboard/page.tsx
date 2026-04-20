import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/data/dashboard-stats";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  if (!stats) {
    redirect("/");
  }
  return <DashboardClient stats={stats} />;
}
