"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Shield,
  Link as LinkIcon,
  Clock,
  Coffee,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface BriefResponse {
  brief: string;
  citations: string[];
  smallTalk: string[];
}

/* -------------------------------------------------------------------------- */

export default function MeetingBriefPage(): JSX.Element {
  /* ------------------------------ hero state ------------------------------ */
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [briefHtml, setBriefHtml] = useState<string | null>(null);
  const [smallTalkQueue, setSmallTalkQueue] = useState<string[]>([]);
  const [demoShown, setDemoShown] = useState(false);

  const formValid = name.trim() !== "" && company.trim() !== "";

  /* ------------------------------ fetch util ------------------------------ */
  const fetchBrief = useCallback(
    async (override?: { name: string; company: string }): Promise<void> => {
      const payload = override ?? { name, company };
      setIsLoading(true);
      setBriefHtml(null);

      try {
        const res = await fetch("/api/meetingbrief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BriefResponse = await res.json();

        setBriefHtml(data.brief);
        setSmallTalkQueue(data.smallTalk);
        toast.success("Brief generated");
        setDemoShown(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate brief");
      } finally {
        setIsLoading(false);
      }
    },
    [name, company]
  );

  /* -------------------- cycle small‑talk during loading ------------------- */
  useEffect(() => {
    if (!isLoading || smallTalkQueue.length === 0) return;
    const id = setInterval(() => {
      setSmallTalkQueue((q) => [...q.slice(1), q[0]]);
    }, 3000);
    return () => clearInterval(id);
  }, [isLoading, smallTalkQueue]);

  /* ------------------------------ UI data --------------------------------- */
  const features = [
    { title: "Linked citations", desc: "Every claim traces back to the source.", icon: LinkIcon },
    { title: "Real‑time data", desc: "News, filings, social pulled live.", icon: Clock },
    { title: "AI‑verified summaries", desc: "Multiple sources cross‑checked to prevent hallucination.", icon: Shield },
    { title: "Secure infra", desc: "Encrypt‑in‑transit & at‑rest; SOC 2 Type II hosting.", icon: Database },
    { title: "Small‑Talk topics", desc: "Ice‑breakers generated from fresh info.", icon: Coffee },
  ] as const;

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "VP of Sales, TechCorp",
      quote: "MeetingBrief saved me hours of prep before critical client calls.",
    },
    {
      name: "Michael Chen",
      title: "Investment Analyst, Capital Partners",
      quote: "The depth of information is impressive—I'm always the most prepared person in the room.",
    },
    {
      name: "Aisha Patel",
      title: "Business Development, Innovate Inc",
      quote: "Small‑Talk generator is a game‑changer for breaking the ice.",
    },
  ] as const;

  /* ------------------------------- render --------------------------------- */
  return (
    <>
      {/* ─────────────────────────── Hero ─────────────────────────── */}
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0b0b16] via-[#161629] to-[#12121e] px-4 py-20 text-white">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">Arrive informed—deep research made effortless</h1>
          <p className="mt-4 text-lg text-gray-300">
            Type a name and company, get a fully‑sourced brief in under a minute.
          </p>

          {!briefHtml && (
            <div className="mt-10 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="e.g. Jensen Huang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="e.g. Nvidia"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-500"
                disabled={!formValid || isLoading}
                onClick={() => fetchBrief()}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Generate my brief →"}
              </Button>

              {!demoShown && !isLoading && (
                <button
                  type="button"
                  className="text-sm text-gray-400 underline-offset-4 hover:underline"
                  onClick={() => fetchBrief({ name: "Jensen Huang", company: "Nvidia" })}
                >
                  See a sample brief instead
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="mt-16 flex flex-col items-center gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <AnimatePresence>
                {smallTalkQueue[0] && (
                  <motion.p
                    key={smallTalkQueue[0]}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="max-w-lg text-sm text-gray-300"
                  >
                    {smallTalkQueue[0]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {briefHtml && (
            <article
              className="prose prose-invert mx-auto mt-16 text-left"
              dangerouslySetInnerHTML={{ __html: briefHtml }}
            />
          )}
        </div>
      </section>

      {/* ────────────────────────── Features ───────────────────────── */}
      <section className="bg-[#0e0e18] px-4 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center">Powerful features for better meetings</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, desc, icon: Icon }) => (
              <Card
                key={title}
                className="rounded-2xl border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              >
                <CardHeader>
                  <Icon className="h-8 w-8 text-indigo-400" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">{desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Testimonials ─────────────────────── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-12 text-3xl font-bold">Trusted by professionals</h2>
          <div className="space-y-10">
            {testimonials.map((t) => (
              <figure key={t.name} className="mx-auto max-w-md">
                <blockquote className="text-xl italic">“{t.quote}”</blockquote>
                <figcaption className="mt-4 font-semibold">
                  {t.name} – <span className="text-gray-600">{t.title}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Footer ────────────────────────── */}
      <footer className="bg-gray-100 py-8 text-center text-gray-600">
        © {new Date().getFullYear()} MeetingBrief
      </footer>

      <Toaster />
    </>
  );
}
