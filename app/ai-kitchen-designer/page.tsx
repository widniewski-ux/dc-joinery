import type { Metadata } from "next";
import KitchenDesignerWizard from "./wizard";

export const metadata: Metadata = {
  title: "AI Kitchen Designer",
  description:
    "Upload your kitchen photo and build a brochure-aligned concept using supplier options from Howdens, Wren, IKEA and B&Q.",
  alternates: {
    canonical: "/ai-kitchen-designer",
  },
};

type PageProps = {
  searchParams?: Promise<{ step?: string }>;
};

export default async function AiKitchenDesignerPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const rawStep = Number(params?.step ?? "1");
  const initialStep =
    Number.isInteger(rawStep) && rawStep >= 1 && rawStep <= 10
      ? (rawStep as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)
      : 1;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
          New Feature
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Kitchen Designer</h1>
        <p className="text-neutral-300 text-lg max-w-3xl mb-10 leading-relaxed">
          Upload your current kitchen, select supplier brochure options (style, colours,
          worktops, handles and appliances), and receive a premium AI concept with
          realistic visualization and a professional project summary.
        </p>

        <KitchenDesignerWizard initialStep={initialStep} />
      </div>
    </main>
  );
}
