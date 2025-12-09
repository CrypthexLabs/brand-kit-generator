"use client";

import { useState } from "react";

type BrandKit = {
  brandName: string;
  colors: string[];
  headingFont: string;
  bodyFont: string;
  personality: string;
};

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [adjectives, setAdjectives] = useState("");
  const [audience, setAudience] = useState("");
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-brand-kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandName,
          industry,
          adjectives,
          audience,
        }),
      });

      if (!res.ok) {
        let message = "Failed to generate brand kit";

        try {
          const data = await res.json();
          if (data?.error) {
        message = data.error;
      }
    } catch {
    // ignore JSON parse error and keep default message
    }

  throw new Error(message);
}

      const data = await res.json();

      setBrandKit({
        brandName: brandName || "Your Brand",
        colors: data.colors || [],
        headingFont: data.headingFont || "Poppins",
        bodyFont: data.bodyFont || "Inter",
        personality:
          data.personality ||
          "A distinctive brand with a clear personality and tone of voice.",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setBrandKit(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 py-10">
        {/* Left side: Form */}
        <section className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold">
              Brand Kit Generator
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Describe your brand in a few words and get an instant AI-powered
              starter kit: color palette, font pairing and brand personality.
              <br />
              This version calls a real AI model via a tiny backend route – very
              low maintenance.
            </p>
          </header>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand name</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Example: Lunar Studio"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry / niche</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Example: fitness coaching, SaaS, bakery"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">3–5 adjectives</label>
              <input
                value={adjectives}
                onChange={(e) => setAdjectives(e.target.value)}
                placeholder="Example: bold, playful, modern"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-400">
                Try words like: luxury, playful, minimal, techy, earthy,
                premium…
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target audience</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Example: busy founders, Gen Z creatives, new parents"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Generating…" : "Generate Brand Kit"}
            </button>

            {error && (
              <p className="text-xs text-red-400 mt-2">
                {error}
              </p>
            )}

            <p className="text-xs text-slate-400">
              v0.2 – AI-powered generation, still using a minimal backend for
              low maintenance.
            </p>
          </form>
        </section>

        {/* Right side: Result */}
        <section className="space-y-4">
          {!brandKit && !loading && !error && (
            <div className="h-full border border-slate-800 rounded-2xl bg-slate-900/60 flex items-center justify-center text-slate-400 text-sm text-center px-6 py-10">
              Fill in the form and click &quot;Generate Brand Kit&quot; to see
              your instant AI-crafted starter kit here.
            </div>
          )}

          {loading && (
            <div className="h-full border border-slate-800 rounded-2xl bg-slate-900/60 flex items-center justify-center text-slate-300 text-sm text-center px-6 py-10">
              Generating your brand kit with AI…
            </div>
          )}

          {brandKit && !loading && (
            <div className="space-y-5 border border-slate-800 rounded-2xl bg-slate-900/60 p-5">
              <div>
                <h2 className="text-xl font-semibold">
                  {brandKit.brandName}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  AI-generated brand kit preview
                </p>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Color palette</h3>
                <div className="flex gap-2">
                  {brandKit.colors.map((color) => (
                    <div
                      key={color}
                      className="flex-1 rounded-xl overflow-hidden border border-slate-800"
                    >
                      <div
                        className="h-12"
                        style={{ backgroundColor: color }}
                      />
                      <div className="px-2 py-1 text-[10px] text-center bg-slate-950/60">
                        {color}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Typography</h3>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="font-semibold">Heading font:</span>{" "}
                    {brandKit.headingFont}
                  </p>
                  <p>
                    <span className="font-semibold">Body font:</span>{" "}
                    {brandKit.bodyFont}
                  </p>
                  <p className="text-slate-400">
                    In a later version, we&apos;ll plug in real font previews
                    from Google Fonts.
                  </p>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Brand personality</h3>
                <p className="text-xs text-slate-300">
                  {brandKit.personality}
                </p>
              </div>

              {/* Placeholder for monetization later */}
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <button className="w-full inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-xs font-medium hover:bg-white transition">
                  (Future) Download Premium Brand Kit PDF
                </button>
                <p className="text-[10px] text-slate-500">
                  This will become your first paid feature: export a full brand
                  guide, logo concepts and social media assets.
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="h-full border border-slate-800 rounded-2xl bg-red-950/40 flex items-center justify-center text-red-200 text-sm text-center px-6 py-10">
              Something went wrong generating your brand kit. Please try again.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
