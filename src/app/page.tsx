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
  '“MeetingBrief shaved hours off my pre-deal research.” — Sara P., Horizon Capital',
  '“Walking into demos knowing everything about the room changes the game.” — Jeremy L., Nova Robotics',
  '“Small-Talk topics break the ice with new prospects.” — Alicia G., CloudFlux',
]

const WHY_HOW = [
  'Real-time public data, never stale databases',
  'AI cross-checks every fact — no hallucinations',
  'Inline citations for instant source verification',
  '1  Type a name & company',
  '2  MeetingBrief gathers public records in seconds',
  '3  Read, copy, or download the brief (sign-in required)',
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
      <section className="py-24 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-[56px] font-bold leading-tight">
          Know everything before you enter the room.
        </h1>
        <p className="mt-4 text-[22px] text-gray-600">
          Instant intelligence—zero prep.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-4 md:flex-row md:gap-2"
        >
          <input
            type="text"
            placeholder="Name"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-[#7A3AF9]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || blocked}
          />
          <input
            type="text"
            placeholder="Company"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-[#7A3AF9]"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={loading || blocked}
          />
          <button
            type="submit"
            className={clsx(
              'rounded-lg px-6 py-3 font-semibold text-white transition-colors',
              loading || blocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#7A3AF9] hover:bg-[#6933d9]',
            )}
            disabled={loading || blocked}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Generate'}
          </button>
        </form>

        {/* Inline preview */}
        {loading && (
          <div className="mt-8 text-left text-[16px] leading-6 max-w-xl mx-auto">
            <h3 className="font-semibold mb-2">Generating preview…</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Sample bullet one.</li>
              <li>Sample bullet two.</li>
            </ul>
          </div>
        )}

        {ready && (
          <div className="mt-8 border border-gray-200 rounded-lg p-6 space-y-4 text-left text-[16px] leading-6 max-w-2xl mx-auto">
            <pre className="whitespace-pre-wrap">{report.markdown}</pre>
            <div className="flex gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => toast.info('Sign in to copy.')}
              >
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => toast.info('Sign in to download.')}
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20">
        <ul className="space-y-8 max-w-3xl mx-auto text-[16px] leading-[1.5]">
          {TESTIMONIALS.map((t) => (
            <li key={t} className="italic text-gray-800">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Why / How */}
      <section className="px-4 py-20">
        <ul className="max-w-3xl mx-auto space-y-3 text-[16px] text-gray-700">
          {WHY_HOW.map((line) => (
            <li key={line} className="list-disc list-inside">
              {line}
            </li>
          ))}
        </ul>
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