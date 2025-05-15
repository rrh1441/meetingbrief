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
// marked and prettifyBrief are removed as they are no longer needed if API returns HTML
// and the sample is HTML.

// Sample Brief as an HTML string, reflecting your new direct HTML output
const sampleBriefHtmlContent = `
<div>
  <h2><strong>Meeting Brief: Jensen Huang – Nvidia</strong></h2>
  <p>&nbsp;</p>
  <h3><strong>Executive Summary</strong></h3>
  <p>Jensen Huang is the Founder and CEO of NVIDIA since 1993. He holds a Bachelor of Science in Electrical Engineering from Oregon State University and a Master of Science in Electrical Engineering from Stanford University. Prior to founding NVIDIA he worked in various roles including dishwasher busboy and waiter at Denny's. He has led NVIDIA to become a leader in AI and GPU technology over more than three decades of experience in the industry. <sup><a href="#source-placeholder-1" target="_blank" rel="noopener noreferrer">1</a></sup></p>
  <p>&nbsp;</p>
  <h3><strong>Job History</strong></h3>
  <ul class="list-disc pl-5">
    <li>Founder and CEO — NVIDIA (1993 – Present)</li>
    <li>Dishwasher Busboy Waiter — Denny's (1978 – 1983)</li>
  </ul>
  <p>&nbsp;</p>
  <h3><strong>Highlights & Fun Facts</strong></h3>
  <ul class="list-disc pl-5">
    <li>Founded NVIDIA in 1993 and has led the company to become a pioneer in AI and GPU computing. <sup><a href="#source-placeholder-1" target="_blank" rel="noopener noreferrer">1</a></sup></li>
    <li>Delivered keynote presentations at major industry events such as NVIDIA's GPU Technology Conference and CES 2025. <sup><a href="#source-placeholder-6" target="_blank" rel="noopener noreferrer">6</a></sup></li>
    <li>Worked as a dishwasher busboy and waiter at Denny's from 1978 to 1983 before his engineering career. <sup><a href="#source-placeholder-1" target="_blank" rel="noopener noreferrer">1</a></sup></li>
  </ul>
  <p>&nbsp;</p>
  <h3><strong>Detailed Research Notes</strong></h3>
  <ul class="list-disc pl-5">
    <li>Jensen Huang's leadership at NVIDIA has been instrumental in powering the AI revolution through advanced GPU technology. <sup><a href="#source-placeholder-11" target="_blank" rel="noopener noreferrer">11</a></sup></li>
    <li>NVIDIA under Huang's leadership focuses on AI GPU computing and expanding into global markets including China. <sup><a href="#source-placeholder-13" target="_blank" rel="noopener noreferrer">13</a></sup></li>
    <li>Conversation starter: Discuss how Huang's early work experiences influenced his leadership style and vision for NVIDIA. <sup><a href="#source-placeholder-1" target="_blank" rel="noopener noreferrer">1</a></sup></li>
  </ul>
</div>`;
// Note: The placeholder URLs like "#source-placeholder-1" should ideally be replaced
// with actual example URLs if you want the sample links to be clickable to something meaningful.
// The styling of the links (blue, underline) would come from your global CSS or Tailwind's
// default anchor styling, as the `<sup><a>` tags here don't have explicit Tailwind classes.
// Your actual generated brief WILL have the Tailwind classes if `superscriptCitations` in the pipeline adds them.
// The current pipeline's `renderToHtml`'s helpers output `<sup><a href="..." target="_blank" rel="noopener noreferrer">${r.source}</a></sup>`
// which does not include the blue Tailwind classes. If you want those classes in the final output,
// they need to be added in the `formatHtmlSentences` and `formatHtmlBullets` functions.

export default function Page() {
  /* ─────────────── state */
  const [form, setForm] = useState({ name: "", organization: "" });
  const [loading, setLoading] = useState(false);
  const [briefHtml, setBriefHtml] = useState<string | null>(null); // Will store HTML from API
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
        body: JSON.stringify({ ...form }), // Removed maxTokens, assuming API handles it
      });
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json(); // Try to parse as JSON first
        } catch (jsonError) {
          errorData = await res.text(); // Fallback to text
        }
        console.error("API Error Data:", errorData);
        throw new Error(
          typeof errorData === "string"
            ? errorData
            : errorData.message || `Request failed with status ${res.status}`
        );
      }
      // Assuming the API returns { brief: "<html>...", citations: [...] }
      const result = (await res.json()) as { brief: string; citations: any[] };
      // The 'brief' from your API is already HTML from renderToHtml
      setBriefHtml(result.brief);
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
                    Brief ready <CheckCircle2 className="inline h-5 w-5 text-green-600" />
                  </CardTitle>
                  <CardDescription>Scroll or copy as needed</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-lg prose-slate max-w-none text-left prose-li:marker:text-slate-600">
                  {/* The briefHtml from your API is already HTML */}
                  <div dangerouslySetInnerHTML={{ __html: briefHtml }} />
                </CardContent>
              </Card>
            )}

            {/* Display sample HTML brief when no dynamic brief is loaded */}
            {!loading && !briefHtml && (
              <Card>
                <CardHeader>
                  <CardTitle>Real Example Brief</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg prose-slate max-w-none text-left max-h-96 overflow-auto prose-li:marker:text-slate-600">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sampleBriefHtmlContent, // Use the new HTML sample
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* FEATURES (remains the same) */}
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

      {/* USE-CASES (remains the same) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <h2 className="text-3xl font-semibold text-center">Built for every high-stakes meeting</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Investors", icon: "💼", blurb: "Vet founders before they pitch." },
              { name: "Recruiters", icon: "🎯", blurb: "Assess executive candidates in minutes." },
              { name: "Founders", icon: "🚀", blurb: "Know your counterpart’s angle before negotiations." },
              { name: "Sales", icon: "📈", blurb: "Skip the research rabbit hole and open with insight." },
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

      {/* PRICING (remains the same) */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <h2 className="text-3xl font-semibold">Flexible plans</h2>
          <p className="text-slate-600">Start free, upgrade when you need scale.</p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Free",      price: "$0",   meetings: "3 meetings / mo",  cta: "Start free" },
              { name: "Starter",   price: "$99",  meetings: "20 meetings / mo", cta: "Choose starter" },
              { name: "Growth",    price: "$199", meetings: "60 meetings / mo", cta: "Choose growth" },
              { name: "Unlimited", price: "$299", meetings: "Unlimited meetings", cta: "Choose unlimited" },
            ].map((p) => (
              <Card key={p.name} className="flex flex-col shadow-sm">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription className="text-4xl font-bold">{p.price}</CardDescription>
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

      {/* FAQ (remains the same) */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl font-semibold text-center">FAQ</h2>
          {[
            { q: "How long does a brief take to generate?",
              a: "Typically 15–30 s for public figures; up to 60 s for very obscure or private subjects." },
            { q: "What data sources are used?",
              a: "Real-time web search, corporate filings, reputable news, podcasts, social-media posts, and public databases from the last 24 months." },
            { q: "Is my input stored or shared?",
              a: "No. Inputs and generated briefs can be deleted at your direction and never sold or shared with third parties." },
            { q: "Do you guarantee zero hallucinations?",
              a: "Each claim is footnoted with a source so you can verify yourself. While LLMs can err, transparent citations keep errors detectable." },
          ].map((f) => (
            <div key={f.q} className="border-b border-slate-200 pb-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-slate-600 mt-2">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER (remains the same) */}
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