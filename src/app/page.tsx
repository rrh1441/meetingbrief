'use client'

/* -------------------------------------------------------------------------- */
/*  Landing page – MeetingBrief                                              */
/*  Uses Sonner toaster directly. No external toast wrappers or hooks.       */
/* -------------------------------------------------------------------------- */

import React, { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
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
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function MeetingBriefLandingPage() {
  /* ---------------------------------------------------------------------- */
  /*  Local state                                                           */
  /* ---------------------------------------------------------------------- */
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [report, setReport] = useState<ReportState>({ status: 'idle' })
  const [runCount, setRunCount] = useState<number>(0)

  /* ---------------------------------------------------------------------- */
  /*  Initialise anonymous-run counter                                      */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const stored = Number(localStorage.getItem('mb_runs') ?? '0')
    setRunCount(stored)
  }, [])

  /* ---------------------------------------------------------------------- */
  /*  Handler: generate brief                                               */
  /* ---------------------------------------------------------------------- */
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()

    if (runCount >= 3) {
      toast.error('Anonymous limit reached. Create a free account to continue.')
      return
    }
    if (!name.trim() || !company.trim()) {
      toast.error('Please enter both name and company.')
      return
    }

    setReport({ status: 'loading' })

    /* ---- Mock API call (replace with real endpoint) ------------------- */
    setTimeout(() => {
      const markdown = `### MeetingBrief for ${name} · ${company}

**Executive Summary**
- Example bullet one.
- Example bullet two.
- Example bullet three.

**Notable Flags**
- None at this time.

**Interesting Facts**
- ${name} and ${company} both appear in Fortune 500 coverage.`

      setReport({ status: 'ready', markdown })
      const next = runCount + 1
      setRunCount(next)
      localStorage.setItem('mb_runs', String(next))
    }, 2800)
  }

  /* ---------------------------------------------------------------------- */
  /*  Derived helpers                                                       */
  /* ---------------------------------------------------------------------- */
  const showSpinner = report.status === 'loading'
  const showReport = report.status === 'ready'
  const smallTalk = [
    'Honey never spoils—jars found in ancient tombs are still edible.',
    'Octopuses have three hearts and blue blood.',
    'Bananas share ~60 % of their DNA with humans.',
    'The shortest war in history lasted 38 minutes.',
    'New York drifts about one inch farther from London every year.'
  ]

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b16] via-[#161629] to-[#12121e] text-white flex flex-col">
      <Toaster richColors />
      <main className="max-w-4xl mx-auto px-4 py-16 flex-1 flex flex-col items-center">
        {/* ------------------------  Hero  ------------------------------ */}
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          Know everything before you enter the room.
        </h1>
        <p className="mt-4 text-xl text-center">
          Arrive informed — deep research made effortless.
        </p>

        {/* ------------------------  Form  ------------------------------ */}
        <form
          onSubmit={handleGenerate}
          className="mt-10 w-full flex flex-col gap-4 md:flex-row md:gap-2"
        >
          <input
            type="text"
            placeholder="Name"
            className="flex-1 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 placeholder-gray-400 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={showSpinner}
          />
          <input
            type="text"
            placeholder="Company"
            className="flex-1 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 placeholder-gray-400 focus:outline-none"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={showSpinner}
          />
          <button
            type="submit"
            className={clsx(
              'rounded-xl font-semibold px-6 py-3 transition-colors',
              showSpinner
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            )}
            disabled={showSpinner}
          >
            {showSpinner ? 'Generating…' : 'Generate Brief'}
          </button>
        </form>

        {/* -------------  Loading: Small-Talk + spinner  ---------------- */}
        {showSpinner && (
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

        {/* ----------------------  Report  ------------------------------ */}
        {showReport && (
          <div className="mt-12 w-full max-w-3xl bg-white/5 p-6 rounded-xl space-y-6">
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
        )}

        {/* -------------  Anonymous-limit notice (non-modal) ------------ */}
        {runCount >= 3 && (
          <p className="mt-8 text-sm text-red-400">
            Anonymous limit reached.{' '}
            <a href="/signup" className="underline">
              Create a free account
            </a>{' '}
            to keep generating briefs.
          </p>
        )}
      </main>
    </div>
  )
}