'use client'

import React, { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Loader2, Copy, Download } from 'lucide-react'
import clsx from 'clsx'

type ReportState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; markdown: string }

const TESTIMONIALS = [
  {
    quote: 'MeetingBrief shaved hours off my pre-deal research.',
    author: 'Sara P., Horizon Capital',
  },
  {
    quote: 'Knowing everything about the room changes the game.',
    author: 'Jeremy L., Nova Robotics',
  },
  {
    quote: 'Small-Talk topics break the ice with new prospects.',
    author: 'Alicia G., CloudFlux',
  },
]

const WHY = [
  'Real-time public data, never stale databases',
  'AI cross-checks every fact — no hallucinations',
  'Inline citations for instant verification',
]

const HOW = [
  'Type a name & company',
  'MeetingBrief gathers records in seconds',
  'Read, copy, or download the brief (sign-in required)',
]

export default function LandingPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [report, setReport] = useState<ReportState>({ status: 'idle' })
  const [runs, setRuns] = useState(0)

  useEffect(() => {
    setRuns(Number(localStorage.getItem('mb_runs') ?? '0'))
  }, [])

  const blocked = runs >= 3
  const loading = report.status === 'loading'
  const ready = report.status === 'ready'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (blocked) return toast.error('Anonymous limit reached. Sign up to continue.')
    if (!name.trim() || !company.trim()) return toast.error('Enter both fields.')

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
      const next = runs + 1
      setRuns(next)
      localStorage.setItem('mb_runs', String(next))
    }, 2000)
  }

  return (
    <div className="bg-white text-gray-900">
      <Toaster richColors />

      {/* Hero */}
      <section className="py-24 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-[56px] font-bold leading-[72px]">
          Know everything before you enter the room.
        </h1>
        <p className="mt-4 text-[24px] leading-[32px] text-gray-600">
          Instant intelligence—zero prep.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-4 md:flex-row md:gap-2"
        >
          <input
            type="text"
            placeholder="Name"
            className="flex-1 h-12 rounded-xl border border-gray-300 px-4 placeholder-gray-400 focus:ring-2 focus:ring-[#7A3AF9]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || blocked}
          />
          <input
            type="text"
            placeholder="Company"
            className="flex-1 h-12 rounded-xl border border-gray-300 px-4 placeholder-gray-400 focus:ring-2 focus:ring-[#7A3AF9]"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={loading || blocked}
          />
          <button
            type="submit"
            className={clsx(
              'h-12 rounded-xl px-6 font-semibold text-white transition-colors',
              loading || blocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#7A3AF9] hover:bg-[#6933d9]',
            )}
            disabled={loading || blocked}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Generate'}
          </button>
        </form>

        {/* Inline preview / report */}
        {loading && (
          <div className="mt-10 max-w-xl mx-auto border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2 text-left">
            <h3 className="font-semibold">Generating preview…</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Sample bullet one.</li>
              <li>Sample bullet two.</li>
            </ul>
          </div>
        )}

        {ready && (
          <div className="mt-10 max-w-2xl mx-auto border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 text-left">
            <pre className="whitespace-pre-wrap text-[16px] leading-6">
              {report.markdown}
            </pre>
            <div className="flex gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                onClick={() => toast.info('Sign in to copy.')}
              >
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                onClick={() => toast.info('Sign in to download.')}
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Testimonials in cards */}
      <section className="px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {TESTIMONIALS.map(({ quote, author }) => (
            <div
              key={author}
              className="border border-gray-200 rounded-2xl p-6 shadow-sm text-[16px] leading-[1.5]"
            >
              <p className="italic text-gray-800">“{quote}”</p>
              <p className="mt-4 font-semibold text-gray-900">{author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why & How in cards */}
      <section className="px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Why MeetingBrief</h2>
            <ul className="list-disc list-inside space-y-2 text-[16px] text-gray-700">
              {WHY.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">How it works</h2>
            <ol className="space-y-2 text-[16px] text-gray-700">
              {HOW.map((h, i) => (
                <li key={h}>
                  <span className="font-bold text-[#7A3AF9]">{i + 1}.</span>{' '}
                  {h}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Footer */}
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