import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/security";
export const metadata = { title: "Marketing", robots: { index: false, follow: false } };
export default async function MarketingDashboardPage() {
  if (!await isAdmin()) redirect("/admin/ai-leads");
  return <main className="mx-auto max-w-4xl px-6 py-20 text-white"><h1 className="text-3xl font-bold">Marketing reports</h1><p className="my-6">This dashboard is not connected to a reporting data source. View verified visit and conversion figures in your Google Analytics account.</p><Link href="/admin/ai-leads" className="underline">Back to enquiries</Link></main>;
}
