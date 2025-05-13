'use client'

/* -------------------------------------------------------------------------- */
/*  MeetingBrief landing page – full version                                  */
/*  Uses Sonner directly for toast notifications                              */
/* -------------------------------------------------------------------------- */

import React, { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import {
  Loader2,
  Copy,
  Download,
  ShieldCheck,
  Search,
  ListChecks,
  Sparkles,
  Users,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type ReportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; markdown: string }

interface Testimonial {
  name: string
  title: string
  quote: string
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const testimonials: Testimonial[] = [
  {
    name: 'Sara Patel',
    title: 'Principal · Horizon Capital',
    quote: 'MeetingBrief shaved hours off my pre-deal research. Instant confidence.',
  },
  {
    name: 'Jeremy Lee',
    title: 'CEO · Nova Robotics',
    quote: 'Walking into demos knowing everything about the room changes the game.',
  },
  {
    name: 'Alicia Gómez',
    title: 'VP Sales · CloudFlux',
    quote: 'My team uses Small-Talk topics to break the ice with new prospects.',
  },
]

const features = [
  {
    icon: Search,
    title: 'Real-time data collection',
    text: 'News, filings, social posts & podcasts fetched the moment you click.',
  },
  {
    icon: Sparkles,
    title: 'AI-verified summaries',
    text: 'Cross-checks every fact to eliminate hallucinations.',
  },
  {
    icon: ListChecks,
    title: 'Linked citations',
    text: 'Every bullet traces back to the original source for instant trust.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure infrastructure',
    text: 'Supabase Postgres & storage – SOC 2 Type II audited.',
  },
  {
    icon: Users,
    title: 'Small-Talk generator',
    text: 'Fast trivia to make your intros memorable.',
  },
]

const howItWorks = [
  { step: '1 — Input', text: 'Enter a name & company; hit Generate Brief.' },
  { step: '2 — Live collection', text: 'MeetingBrief gathers public records in seconds.' },
  { step: '3 — AI distillation', text: 'Noise is filtered, facts verified, insights distilled.' },
  { step: '4 — Arrive prepared', text: 'Skim the brief or download once you sign in.' },
]

const smallTalk = [
  'Honey never spoils—pots in Egyptian tombs are still edible.',
  'Octopuses have three hearts and blue blood.',
  'Bananas share ~60 % of their DNA with humans.',
  'The shortest war in history lasted 38 minutes.',
  'New York drifts about an inch farther from London every year.',
]

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [report, setReport] = useState<ReportState>({ status: 'idle' })
  const [runCount, setRunCount] = useState(0)

  /* --- initialise anonymous-use counter --------------------------------- */
  useEffect(() => {
    setRunCount(Number(localStorage.getItem('mb_runs') ?? '0'))
  }, [])

  /* --- generate brief --------------------------------------------------- */
  const generate = (e: React.FormEvent) => {
    e.preventDefault()

    if (runCount >= 3) {
      toast.error('Anonymous limit reached. Create a free account to continue.')
      return
    }
    if (!name.trim() || !company.trim()) {
      toast.error('Please enter both fields.')
      return
    }

    setReport({ status: 'loading' })

    /* -------- mock API call – replace with real endpoint ---------------- */
    setTimeout(() => {
      setReport({
        status: 'ready',
        markdown: `### MeetingBrief for ${name} · ${company}

**Executive Summary**
- Example bullet one.
- Example bullet two.
- Example bullet three.

**Notable Flags**
- None at this time.

**Interesting Facts**
- ${name} and ${company} both appear in Fortune 500 coverage.`,
      })
      const next = runCount + 1
      setRunCount(next)
      localStorage.setItem('mb_runs', String(next))
      /* scroll to the report */
      document
        .getElementById('report-section')
        ?.scrollIntoView({ behavior: 'smooth' })
    }, 2600)
  }

  const blocked = runCount >= 3

  return (
    <div className="flex flex-col">
      <Toaster richColors />

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-32 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0b0b16] via-[#161629] to-[#12121e] text-white">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          Know everything before you enter the room.
        </h1>
        <p className="mt-4 text-xl text-center">
          Arrive informed — deep research made effortless.
        </p>

        {/* --- form -------------------------------------------------------- */}
        <form
          onSubmit={generate}
          className="mt-10 w-full max-w-xl flex flex-col gap-4 md:flex-row md:gap-2"
        >
          <input
            type="text"
            placeholder="Name"
            className="flex-1 rounded-xl bg-white/10 backdrop-blur px-4 py-3 placeholder-gray-400 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={report.status === 'loading' || blocked}
          />
          <input
            type="text"
            placeholder="Company"
            className="flex-1 rounded-xl bg-white/10 backdrop-blur px-4 py-3 placeholder-gray-400 focus:outline-none"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={report.status === 'loading' || blocked}
          />
          <button
            type="submit"
            className={clsx(
              'rounded-xl font-semibold px-6 py-3 transition-colors flex items-center justify-center',
              report.status === 'loading' || blocked
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700',
            )}
            disabled={report.status === 'loading' || blocked}
          >
            {report.status === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Generate Brief'
            )}
          </button>
        </form>

        {/* --- loading: spinner + small-talk ------------------------------ */}
        {report.status === 'loading' && (
          <div className="mt-12 w-full max-w-lg bg-white/5 p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Small-Talk Topics</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              {smallTalk.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="flex justify-center mt-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        )}

        {/* scroll hint */}
        <a
          href="#social-proof"
          className="mt-16 animate-bounce text-gray-400 hover:text-white"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-8 w-8" />
        </a>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Report result                                                     */}
      {/* ------------------------------------------------------------------ */}
      {report.status === 'ready' && (
        <section
          id="report-section"
          className="bg-[#0e0e19] text-white px-4 py-16 flex justify-center"
        >
          <div className="w-full max-w-3xl bg-white/5 p-6 rounded-xl space-y-6">
            <pre className="whitespace-pre-wrap text-sm">
              {report.markdown}
            </pre>
            <div className="flex gap-4 justify-end">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600"
                onClick={() => toast.info('Sign in to copy this report.')}
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600"
                onClick={() => toast.info('Sign in to download this report.')}
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Social proof                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="social-proof"
        className="bg-white text-gray-900 px-4 py-20"
      >
        <h2 className="text-center text-2xl font-semibold">
          Professionals already rely on MeetingBrief
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map(({ name, title, quote }) => (
            <blockquote
              key={name}
              className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <p className="text-sm italic">“{quote}”</p>
              <footer className="mt-4 text-sm font-semibold">
                {name} · <span className="font-normal">{title}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Feature grid                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-[#161629] text-white px-4 py-20">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white/5 p-6 rounded-2xl shadow hover:-translate-y-1 transition"
            >
              <Icon className="h-6 w-6 text-purple-400" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  How it works                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white text-gray-900 px-4 py-20">
        <h2 className="text-center text-2xl font-semibold">How it works</h2>
        <ol className="mt-10 max-w-4xl mx-auto space-y-6">
          {howItWorks.map(({ step, text }) => (
            <li key={step} className="flex gap-4">
              <span className="text-purple-600 font-bold">{step}</span>
              <p className="text-sm">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Secondary CTA                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-[#0b0b16] text-white px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold">
          Run your first brief in&nbsp;
          <span className="text-purple-400">&lt; 60 sec</span>
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
        >
          Generate now <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Footer                                                            */}
      {/* ------------------------------------------------------------------ */}
      <footer className="bg-[#0e0e19] text-gray-400 px-4 py-10 text-center text-sm">
        © {new Date().getFullYear()} MeetingBrief ·{' '}
        <a href="/docs" className="underline">
          Docs
        </a>{' '}
        ·{' '}
        <a href="/privacy" className="underline">
          Privacy
        </a>{' '}
        ·{' '}
        <a href="/pricing" className="underline">
          Pricing
        </a>{' '}
        ·{' '}
        <a href="/contact" className="underline">
          Contact
        </a>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/*  Anonymous limit banner                                            */}
      {/* ------------------------------------------------------------------ */}
      {blocked && (
        <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-4 md:bottom-4 bg-red-600 text-white rounded-xl px-4 py-3 shadow-lg text-sm">
          Anonymous limit reached.{' '}
          <a href="/signup" className="underline font-semibold">
            Create a free account
          </a>{' '}
          to keep generating briefs.
        </div>
      )}
    </div>
  )
}