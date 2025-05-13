'use client'

/* -------------------------------------------------------------------------- */
/*  MeetingBrief – minimalist ElevenLabs-style landing                        */
/*  Uses Sonner for toast notifications                                       */
/* -------------------------------------------------------------------------- */

import React, { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Loader2, Copy, Download } from 'lucide-react'
import clsx from 'clsx'

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type ReportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; markdown: string }

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const testimonials = [
  '“MeetingBrief shaved hours off my pre-deal research.” — Sara P., Horizon Capital',
  '“Walking into demos knowing everything about the room changes the game.” — Jeremy L., Nova Robotics',
  '“Small-Talk topics break the ice with new prospects.” — Alicia G., CloudFlux',
]

const featureBullets = [
  'Real-time open-source data, never stale databases',
  'AI cross-checks every fact — no hallucinations',
  'Inline citations for instant source verification',
]

const howSteps = [
  'Type a name & company',
  'MeetingBrief gathers public records in seconds',
  'Read, copy, or download the brief (sign-in required)',
]

const smallTalk = [
  'Honey found in Egyptian tombs is still edible.',
  'Octopuses have three hearts and blue blood.',
  'Bananas share about 60 % of their DNA with humans.',
  'The shortest war in history lasted 38 minutes.',
  'New York drifts ~1 inch farther from London each year.',
]

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [report, setReport] = useState<ReportState>({ status: 'idle' })
  const [runCount, setRunCount] = useState(0)

  /* initialise anonymous-use counter */
  useEffect(() => {
    setRunCount(Number(localStorage.getItem('mb_runs') ?? '0'))
  }, [])

  const blocked = runCount >= 3
  const loading = report.status === 'loading'
  const ready = report.status === 'ready'

  /* generate brief (mock) */
  const generate = (e: React.FormEvent) => {
    e.preventDefault()

    if (blocked) {
      toast.error('Anonymous limit reached. Sign up to continue.')
      return
    }
    if (!name.trim() || !company.trim()) {
      toast.error('Enter both fields.')
      return
    }

    setReport({ status: 'loading' })

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
      document
        .getElementById('report-section')
        ?.scrollIntoView({ behavior: 'smooth' })
    }, 2500)
  }

  return (
    <div className="bg-white text-gray-900">
      <Toaster richColors />

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 px-4 text-center">
        <h1 className="text-[40px] md:text-[56px] font-bold leading-tight">
          Know everything before you enter the room.
        </h1>
        <p className="mt-4 text-[18px] text-gray-600">
          Instant intelligence&mdash;zero prep.
        </p>

        {/* form */}
        <form
          onSubmit={generate}
          className="mt-10 w-full max-w-xl mx-auto flex flex-col gap-4 md:flex-row md:gap-2"
        >
          <input
            type="text"
            placeholder="Name"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || blocked}
          />
          <input
            type="text"
            placeholder="Company"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={loading || blocked}
          />
          <button
            type="submit"
            className={clsx(
              'rounded-lg font-semibold px-6 py-3 text-white transition-colors',
              loading || blocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700',
            )}
            disabled={loading || blocked}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Generate'}
          </button>
        </form>

        {/* limit note */}
        {blocked && (
          <p className="mt-3 text-sm text-gray-500">
            Anonymous limit reached&nbsp;&mdash;&nbsp;
            <a href="/signup" className="underline">
              Create a free account
            </a>
            .
          </p>
        )}

        {/* loading small-talk */}
        {loading && (
          <div className="mt-12 max-w-lg mx-auto bg-gray-50 border border-gray-200 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">Small-Talk Topics</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700">
              {smallTalk.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="flex justify-center mt-6 text-purple-600">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Report                                                            */}
      {/* ------------------------------------------------------------------ */}
      {ready && (
        <section id="report-section" className="px-4 py-20">
          <div className="max-w-3xl mx-auto border border-gray-200 rounded-lg p-6 space-y-6">
            <pre className="whitespace-pre-wrap text-sm leading-6">{report.markdown}</pre>
            <div className="flex gap-4 justify-end">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-800"
                onClick={() => toast.info('Sign in to copy this report.')}
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-800"
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
      <section className="px-4 py-20">
        <ul className="max-w-3xl mx-auto space-y-8">
          {testimonials.map((t) => (
            <li key={t} className="text-[17px] leading-[1.5] italic text-gray-800">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Features + How it works                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-4 py-20 grid gap-16 md:grid-cols-2 max-w-5xl mx-auto">
        <div>
          <h2 className="text-xl font-semibold">Why MeetingBrief</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-[17px] text-gray-700">
            {featureBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="mt-4 space-y-2 text-[17px]">
            {howSteps.map((s, i) => (
              <li key={s}>
                <span className="font-bold text-purple-600">{i + 1}.</span>{' '}
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Footer                                                            */}
      {/* ------------------------------------------------------------------ */}
      <footer className="px-4 py-12 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MeetingBrief ·{' '}
        <a href="/privacy" className="underline">
          Privacy
        </a>{' '}
        ·{' '}
        <a href="/contact" className="underline">
          Contact
        </a>
      </footer>
    </div>
  )
}