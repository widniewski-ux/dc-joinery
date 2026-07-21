import type { Metadata } from "next";
import KitchenDesignerWizard from "./wizard";

export const metadata: Metadata = {
  title: "AI Kitchen Designer",
  description:
    "Upload your kitchen photo and get an AI-generated concept, design summary, indicative cost, and downloadable PDF report.",
};

export default function AiKitchenDesignerPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        <p className="uppercase tracking-[0.35em] text-sm text-amber-400 mb-4">
          New Feature
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Kitchen Designer</h1>
        <p className="text-neutral-300 text-lg max-w-3xl mb-10 leading-relaxed">
          Upload your current kitchen, choose style and budget, and receive a premium AI
          concept with realistic visualization, professional project summary, and an
          indicative UK cost range.
        </p>

        <KitchenDesignerWizard />
      </div>
    </main>
  );
}
