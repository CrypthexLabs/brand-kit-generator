"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type BrandKit = {
  brandName: string;
  colors: string[];
  headingFont: string;
  bodyFont: string;
  personality: string;
};

type AuthMode = "login" | "signup";

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [adjectives, setAdjectives] = useState("");
  const [audience, setAudience] = useState("");
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Load current user + subscribe to changes
  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(data.user ?? null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowUpgradeMessage(false);

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
          // ignore
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

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (!authEmail || !authPassword) {
        throw new Error("Please enter email and password");
      }

      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage(
          "Check your email to confirm your account. After confirming, you can log in."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage("Logged in!");
        setAuthOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Authentication error");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setAuthError(null);
      setAuthMessage(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setAuthError(
        err.message ||
          "Google login error. Make sure Google is enabled in Supabase."
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setBrandKit(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top nav */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-bold">
              BK
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Brand Kit Generator
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="hidden sm:inline text-slate-400">
              v0.2 • AI-powered
            </span>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-slate-400 max-w-[140px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-700 px-3 py-1 hover:border-slate-500 transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setAuthOpen(true);
                }}
                className="rounded-lg border border-slate-700 px-3 py-1 hover:border-slate-500 transition"
              >
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-8">
        {/* Main column: hero + form + result */}
        <div className="space-y-6">
          {/* Hero copy */}
          <section className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Generate a polished brand kit in{" "}
              <span className="text-indigo-400">seconds</span>.
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl">
              Describe your idea in plain language and let AI suggest a color
              palette, font pairing and brand personality. Perfect for solo
              founders, coaches and small businesses who need a brand fast.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 px-3 py-1">
                ⚡ Free basic kit
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 px-3 py-1">
                🎨 AI color palettes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 px-3 py-1">
                📄 Premium PDF export (coming soon)
              </span>
            </div>
          </section>

          {/* Form + result */}
          <section className="grid md:grid-cols-2 gap-6">
            {/* Form */}
            <form
              onSubmit={handleGenerate}
              className="space-y-4 rounded-2xl border border-slate-900 bg-slate-950/60 p-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-medium">Brand name</label>
                <input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Example: Lunar Studio"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Industry / niche</label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Example: fitness coaching, SaaS, bakery"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">3–5 adjectives</label>
                <input
                  value={adjectives}
                  onChange={(e) => setAdjectives(e.target.value)}
                  placeholder="Example: bold, playful, modern"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Try words like: luxury, playful, minimal, techy, earthy,
                  premium…
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Target audience</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Example: busy founders, Gen Z creatives, new parents"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Generating…" : "Generate free brand kit"}
              </button>

              {error && (
                <p className="text-xs text-red-400 mt-2">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-slate-500">
                Free plan: AI preview in your browser. Premium will unlock saved
                brands, exports and more.
              </p>
            </form>

            {/* Result */}
            <div className="space-y-4 rounded-2xl border border-slate-900 bg-slate-950/60 p-4">
              {!brandKit && !loading && !error && (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center px-4">
                  Generate a free brand kit to see AI-crafted colors, fonts and
                  personality here.
                </div>
              )}

              {loading && (
                <div className="h-full flex items-center justify-center text-slate-300 text-xs text-center px-4">
                  Generating your brand kit with AI…
                </div>
              )}

              {brandKit && !loading && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {brandKit.brandName}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1">
                      AI-generated starter brand kit
                    </p>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Color palette
                    </h3>
                    <div className="flex gap-2">
                      {brandKit.colors.map((color) => (
                        <div
                          key={color}
                          className="flex-1 rounded-xl overflow-hidden border border-slate-800"
                        >
                          <div
                            className="h-10"
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
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Typography
                    </h3>
                    <div className="space-y-1 text-[11px]">
                      <p>
                        <span className="font-semibold">Heading font:</span>{" "}
                        {brandKit.headingFont}
                      </p>
                      <p>
                        <span className="font-semibold">Body font:</span>{" "}
                        {brandKit.bodyFont}
                      </p>
                      <p className="text-slate-400">
                        In a later version we&apos;ll show real Google Font
                        previews.
                      </p>
                    </div>
                  </div>

                  {/* Personality */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Brand personality
                    </h3>
                    <p className="text-[11px] text-slate-200">
                      {brandKit.personality}
                    </p>
                  </div>

                  {/* Premium CTA */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowUpgradeMessage(true)}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-xs font-medium hover:bg-white transition"
                    >
                      Download Premium Brand Kit PDF (coming soon)
                    </button>
                    <p className="text-[10px] text-slate-500">
                      Premium will include exportable PDFs, logo concepts and
                      social media assets built on top of this kit.
                    </p>

                    {showUpgradeMessage && (
                      <p className="text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-700/50 rounded-lg px-2 py-2 mt-1">
                        This is where your paywall goes: we&apos;ll add Stripe
                        payments and real PDF exports so people can pay to
                        unlock the full brand kit.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="h-full flex items-center justify-center text-red-200 text-xs text-center px-4">
                  Something went wrong generating your brand kit. Please try
                  again.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Side column: pricing / monetization story */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-5 space-y-4">
            <h2 className="text-sm font-semibold">
              Simple pricing for founders
            </h2>
            <p className="text-xs text-slate-300">
              Start free, then upgrade when you&apos;re ready to lock in your
              brand and export assets.
            </p>

            <div className="grid gap-3 text-[11px]">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Free</span>
                  <span className="text-slate-400">Today</span>
                </div>
                <p className="text-slate-300">
                  Unlimited AI brand kit previews in your browser.
                </p>
                <ul className="mt-2 space-y-1 text-slate-400">
                  <li>• AI color palette</li>
                  <li>• Font pairing suggestions</li>
                  <li>• Brand personality summary</li>
                </ul>
              </div>

              <div className="rounded-xl border border-indigo-600/70 bg-indigo-950/30 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Premium</span>
                  <span className="text-indigo-300">$X / month (TBD)</span>
                </div>
                <p className="text-slate-200">
                  For serious creators who want exportable, client-ready brand
                  kits.
                </p>
                <ul className="mt-2 space-y-1 text-indigo-100/80">
                  <li>• Save multiple brands</li>
                  <li>• Downloadable brand guide PDFs</li>
                  <li>• Social media & website mockups</li>
                  <li>• Priority AI generations</li>
                </ul>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="mt-3 w-full rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-indigo-400 transition"
                >
                  Join the waitlist (create an account)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Next steps: we&apos;ll plug this into a database so logged-in
              users can save and revisit their brand kits.
            </p>
          </div>
        </aside>
      </div>

      {/* Auth modal */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {authMode === "signup" ? "Create your account" : "Log in"}
              </h2>
              <button
                onClick={() => setAuthOpen(false)}
                className="text-slate-400 text-xs hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="flex text-[11px] rounded-lg border border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError(null);
                  setAuthMessage(null);
                }}
                className={`flex-1 py-1.5 ${
                  authMode === "signup"
                    ? "bg-slate-800 text-slate-50"
                    : "bg-slate-950 text-slate-400"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                  setAuthMessage(null);
                }}
                className={`flex-1 py-1.5 ${
                  authMode === "login"
                    ? "bg-slate-800 text-slate-50"
                    : "bg-slate-950 text-slate-400"
                }`}
              >
                Log in
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-indigo-400 disabled:opacity-60 transition"
              >
                {authLoading
                  ? "Please wait…"
                  : authMode === "signup"
                  ? "Sign up with email"
                  : "Log in with email"}
              </button>
            </form>

            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <div className="h-px flex-1 bg-slate-800" />
              <span>or continue with</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-100 hover:border-slate-500 transition"
            >
              Continue with Google
            </button>

            {authError && (
              <p className="text-[11px] text-red-400">{authError}</p>
            )}
            {authMessage && (
              <p className="text-[11px] text-emerald-400">{authMessage}</p>
            )}

            <p className="text-[10px] text-slate-500">
              No extra fee for login itself. You&apos;ll only pay for your
              OpenAI usage and, later, Stripe fees on payments from your users.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
