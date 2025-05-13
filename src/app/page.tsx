/* eslint-disable react/no-danger */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Page() {
  /** ───────────────────────────────────────────────────────── state */
  const [form, setForm] = useState({ name: '', organization: '' })
  const [loading, setLoading] = useState(false)
  const [briefHtml, setBriefHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /** ───────────────────────────────────────────────────────── submit */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/meetingbrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const { brief } = await res.json()
      setBriefHtml(brief)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  /** ───────────────────────────────────────────────────────── view */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─────────── NAV */}
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
              Sign in
            </Link>
            <Button size="sm" asChild>
              <Link href="#generate">Generate Brief</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ─────────── HERO + FORM + DEMO */}
      <header className="bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col gap-10 text-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Instant intelligence for every conversation.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              AI-generated dossiers with sources, small-talk hooks, and risk flags — ready in seconds.
            </p>
          </div>

          {/* ── form */}
          <motion.form
            id="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            onSubmit={submit}
            className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="sr-only">
                Person
              </label>
              <Input
                id="name"
                value={form.name}
                placeholder="Jane Doe"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="org" className="sr-only">
                Organization
              </label>
              <Input
                id="org"
                value={form.organization}
                placeholder="Acme Inc."
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Generate Brief'}
            </Button>
          </motion.form>

          {/* ── demo / skeleton */}
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
                <CardContent
                  className="[&_p]:mb-4 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: briefHtml }}
                />
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* ─────────── FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Deep OSINT coverage',
              desc: 'LinkedIn, filings, press, podcasts & more in one pass.',
            },
            {
              title: 'Footnoted sources',
              desc: 'Every claim backed by a link — no hidden hallucinations.',
            },
            {
              title: 'Small-talk hooks',
              desc: '2–3 light facts to build rapport fast.',
            },
            {
              title: 'Token-efficient',
              desc: 'Typical brief costs ≈ 8¢ in usage fees.',
            },
            {
              title: 'SOC 2 ready',
              desc: 'Runs on compliant infrastructure; Vanta-monitored.',
            },
            {
              title: 'No data retained',
              desc: 'Inputs auto-purged within 24 hours.',
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

      {/* ─────────── USE-CASE STRIP */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <h2 className="text-3xl font-semibold text-center">Built for every high-stakes meeting</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Investors', icon: '💼', blurb: 'Validate founders & markets before the call.' },
              { name: 'Recruiters', icon: '🎯', blurb: 'Screen execs without hours of manual Google-fu.' },
              { name: 'Founders', icon: '🚀', blurb: 'Know your counterpart’s angle ahead of negotiations.' },
              { name: 'Sales', icon: '📈', blurb: 'Skip the research rabbit hole and open with insight.' },
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

      {/* ─────────── PRICING */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-12">
          <h2 className="text-3xl font-semibold">Flexible plans</h2>
          <p className="text-slate-600">Start free, upgrade when you need scale.</p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Free', price: '$0', meetings: '3 meetings / mo', cta: 'Start free' },
              { name: 'Starter', price: '$99', meetings: '20 meetings / mo', cta: 'Choose starter' },
              { name: 'Growth', price: '$199', meetings: '60 meetings / mo', cta: 'Choose growth' },
              { name: 'Unlimited', price: '$299', meetings: 'Unlimited meetings', cta: 'Choose unlimited' },
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

      {/* ─────────── FAQ */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl font-semibold text-center">FAQ</h2>
          {[
            {
              q: 'How long does a brief take?',
              a: 'Typically 15–30 s for public figures; complex subjects up to 60 s.',
            },
            {
              q: 'What sources do you use?',
              a: 'Web search, filings, reputable news, podcasts, and social media (last 24 months).',
            },
            {
              q: 'Do you store my data?',
              a: 'All inputs and briefs are auto-purged within 24 hours.',
            },
            {
              q: 'Is MeetingBrief SOC 2 compliant?',
              a: 'Yes — we run on SOC 2 audited providers and monitor controls via Vanta.',
            },
          ].map((f) => (
            <div key={f.q} className="border-b border-slate-200 pb-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-slate-600 mt-2">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── FOOTER */}
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
  )
}