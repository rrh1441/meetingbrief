/* eslint-disable react/no-danger */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { marked } from "marked";

/* ───────────────────────────── helper */
function prettifyBrief(md: string): string {
  // Bold numeric headings even if preceded by up-to-3 “#”
  md = md.replace(/^(#{0,3}\s*)(\d+)\.\s+/gm, (_, hashes, n) => {
    return `${hashes}**${n}.** `;
  });

  // Insert blank line before any heading (“###” or “**1.**” we just created)
  md = md.replace(/\n(?=(?:\*\*\d+\.\*\*|###))/g, "\n\n");

  // In Executive Summary strip leading * or - bullets
  md = md.replace(
    /###\s*1.*?Executive Summary[\s\S]*?(?=\n###|\n\*\*2|\n\*\*\d|\n*$)/,
    blk => blk.replace(/^[ \t]*[-*]\s+/gm, "")
  );

  return md.trim();
}

/* ───────────────────────────── full Jensen Huang brief (scrollable) */
const sampleBriefMd = `## Meeting Brief: Jensen Huang · NVIDIA

### 1. Executive Summary
* Jensen Huang co-founded Nvidia in 1993 and has served as its President and CEO since inception, guiding the company to a dominant position in GPUs and AI accelerators.
* Nvidia invented the modern GPU in 1999, redefining PC graphics and laying the groundwork for today’s deep-learning boom.
* Huang’s strategic expansion into data-center AI, autonomous vehicles, and edge computing transformed Nvidia from a gaming-centric firm into an end-to-end accelerated-computing platform provider.
* Net worth **≈ \$107 B** (May 2025) on ~3.6 % Nvidia stake.
* Nvidia’s market cap topped **\$3 T** (June 2024), briefly the world’s most valuable public company.
* Revered for “vision + ruthless execution,” Huang is among the longest-tenured Silicon Valley founders still running their company (> 30 yrs).

### 2. Conversational Hooks
* Founded Nvidia at a roadside **Denny’s** in San Jose; Huang also waited tables at a Denny’s in his teens.
* Signature **black leather jacket** at every keynote.

### 3. Headlines (last 12 mo)
1. “Nvidia declares **AI factories** the next industrial era” — *Financial Times*, 2025-04-12  
2. “Blackwell GPU smashes MLPerf records” — *AnandTech*, 2025-03-27  
3. “FTC scrutinises Nvidia–XXXX tie-up” — *Bloomberg*, 2024-11-08

### 4. Detailed Research Notes
* **Early Life & Education**  
  * Born Jen-Hsun Huang, 1963, Tainan City, Taiwan; emigrated to the US after political unrest in Thailand.  
  * Oneida Baptist Institute (KY) at 14; BS-EE Oregon State ’84; MS-EE Stanford ’92.
* **Pre-Nvidia Career**  
  * Micro-architecture roles at AMD (’84-’85) and LSI Logic (’85-’93, Director of CoreLogic group).
* **Nvidia Milestones**  
  * April 5 1993: founded with Chris Malachowsky & Curtis Priem — initial \$40 K capital.  
  * 1999: launched **GeForce 256**, marketed as the world’s first GPU.  
  * 2006: introduced **CUDA**, enabling general-purpose computing on GPUs.  
  * 2020-present: full-stack AI platform (hardware, CUDA, cuDNN, TensorRT, Omniverse).  
  * 2024: announced **Blackwell** architecture; claims 2× performance/W over Hopper.
* **Leadership Style**  
  * Known for weekly “Wednesday Product Reviews” — deep dives that can last six hours.  
  * Persists with “one P&L” model to avoid divisional turf wars.  
* **Philanthropy & Board Roles**  
  * \$50 M to Oregon State Engineering Complex (2022).  
  * Trustee, Stanford University Board.
* **Reputation / Media**  
  * Time “100 Most Influential People” 2024.  
  * Frequently compared to Jobs & Musk for showmanship + technical depth.

_Sign up to generate a full, source-linked report for any executive._`;

/* Utility: marked.parse may return string | Promise<string>. Always await. */
async function mdToHtml(md: string): Promise<string> {
  return (await marked.parse(md)) as string;
}

export default function Page() {
  /* ─────────────── state */
  const [form, setForm] = useState({ name: "", organization: "" });
  const [loading, setLoading] = useState(false);
  const [briefHtml, setBriefHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ─────────────── submit */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBriefHtml(null);

    try {
      const res = await fetch("/api/meetingbrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, maxTokens: 4096 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { brief } = (await res.json()) as { brief: string };
      const pretty = prettifyBrief(brief);
      setBriefHtml(await mdToHtml(pretty));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────── view */
  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-xl">
            MeetingBrief
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="#features" className="hover:text-indigo-600">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-indigo-600">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-indigo-600">
              FAQ
            </Link>
            <Link href="/signin" className="text-sm font-medium">
              Sign&nbsp;in
            </Link>
            <Button size="sm" asChild>
              <Link href="#generate">Generate Brief</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO + FORM + DEMO */}
      <header className="bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col gap-10 text-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Instant&nbsp;intel for every meeting
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Auto-generated deep research with{" "}
              <strong>sources, hooks, and risk flags</strong> — ready in seconds.
            </p>
          </div>

          {/* FORM */}
          <motion.form
            id="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            onSubmit={submit}
            className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <Label htmlFor="name" className="w-20">
                Person
              </Label>
              <Input
                id="name"
                value={form.name}
                placeholder="Jensen Huang"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="org" className="w-20">
                Company
              </Label>
              <Input
                id="org"
                value={form.organization}
                placeholder="NVIDIA"
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Generate Brief"
              )}
            </Button>
          </motion.form>

          {/* DEMO / LOADER / OUTPUT */}
          <div className="w-full max-w-5xl mx-auto">
            {loading && (
              <Card className="animate-pulse">
                <CardHeader>
                  <CardTitle>Generating brief…</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-3 w-full bg-slate-200 rounded" />
                  ))}
                </CardContent>
              </Card>
            )}

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {!loading && briefHtml && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Brief ready{" "}
                    <CheckCircle2 className="inline h-5 w-5 text-green-600" />
                  </CardTitle>
                  <CardDescription>Scroll or copy as needed</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-lg prose-slate max-w-none text-left prose-li:marker:text-slate-600">
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: briefHtml }} />
                </CardContent>
              </Card>
            )}

            {!loading && !briefHtml && (
              <Card>
                <CardHeader>
                  <CardTitle>Real Example Brief</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg prose-slate max-w-none text-left max-h-96 overflow-auto prose-li:marker:text-slate-600">
                  {/* eslint-disable-next-line react/no-danger */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(
                        prettifyBrief(sampleBriefMd)
                      ) as string,
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid gap-8 grid-cols-1 sm:grid-cols-3">
          {[
            {
              title: "Deep open source coverage",
              desc: "LinkedIn, filings, press, podcasts & more in one pass.",
            },
            {
              title: "Footnoted sources",
              desc: "Every claim backed by a link — no hidden hallucinations.",
            },
            {
              title: "Conversational hooks",
              desc: "2–3 rapport-building facts to break the ice.",
            },
          ].map((f) => (
            <Card key={f.title} className="shadow-sm">
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                <p>{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* USE-CASES */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <h2 className="text-3xl font-semibold text-center">
            Built for every high-stakes meeting
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Investors",
                icon: "💼",
                blurb: "Vet founders before they pitch.",
              },
              {
                name: "Recruiters",
                icon: "🎯",
                blurb: "Assess executive candidates in minutes.",
              },
              {
                name: "Founders",
                icon: "🚀",
                blurb: "Know your counterpart’s angle before negotiations.",
              },
              {
                name: "Sales",
                icon: "📈",
                blurb: "Skip the research rabbit hole and open with insight.",
              },
            ].map((u) => (
              <Card key={u.name} className="text-center shadow-sm">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{u.icon}</span>
                    {u.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{u.blurb}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <h2 className="text-3xl font-semibold">Flexible plans</h2>
          <p className="text-slate-600">Start free, upgrade when you need scale.</p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Free",
                price: "$0",
                meetings: "3 meetings / mo",
                cta: "Start free",
              },
              {
                name: "Starter",
                price: "$99",
                meetings: "20 meetings / mo",
                cta: "Choose starter",
              },
              {
                name: "Growth",
                price: "$199",
                meetings: "60 meetings / mo",
                cta: "Choose growth",
              },
              {
                name: "Unlimited",
                price: "$299",
                meetings: "Unlimited meetings",
                cta: "Choose unlimited",
              },
            ].map((p) => (
              <Card key={p.name} className="flex flex-col shadow-sm">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription className="text-4xl font-bold">
                    {p.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <p>{p.meetings}</p>
                  <Button className="mt-auto w-full">{p.cta}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl font-semibold text-center">FAQ</h2>
          {[
            {
              q: "How long does a brief take?",
              a: "Typically 15–30 s for public figures; up to 60 s for very obscure or private subjects.",
            },
            {
              q: "What data sources are used?",
              a: "Real-time web search, corporate filings, reputable news, podcasts, social-media posts, and public databases from the last 24 months.",
            },
            {
              q: "Is my input stored or shared?",
              a: "No. Inputs and generated briefs are auto-purged within 24 hours and never sold or shared with third parties.",
            },
            {
              q: "Do you guarantee zero hallucinations?",
              a: "Each claim is footnoted with a source so you can verify yourself. While LLMs can err, transparent citations keep errors detectable.",
            },
            {
              q: "Can I request deletion immediately?",
              a: "Yes — click “Delete now” on the result card or email privacy@meetingbrief.ai.",
            },
          ].map((f) => (
            <div key={f.q} className="border-b border-slate-200 pb-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-slate-600 mt-2">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} MeetingBrief</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="/privacy">Privacy</Link>
            <Link href="https://twitter.com/meetingbrief">X/Twitter</Link>
            <Link href="https://github.com/yourorg/meetingbrief">GitHub</Link>
            <Link href="/status">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}