/* -------------------------------------------------------------------------- */
/*  src/app/page.tsx                                                          */
/* -------------------------------------------------------------------------- */
'use client'

import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
} from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardAction,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { UsageTracker, type UsageData } from '@/lib/usage-tracker'

/* -------------------------------------------------------------------------- */
/*  Supabase client (public keys only)                                        */
/* -------------------------------------------------------------------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnon) {
  console.warn('Supabase not configured - some features may not work')
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnon)

/* -------------------------------------------------------------------------- */
/*  Static demo brief (shown when no API data is loaded)                      */
/* -------------------------------------------------------------------------- */
const sampleBriefHtmlContent = `
<div>
  <h2><strong>Meeting Brief: Jensen Huang – NVIDIA</strong></h2>
  <p>&nbsp;</p>
  <h3><strong>Executive Summary</strong></h3>
  <p>
    Jensen Huang is the founder and CEO of NVIDIA, a position he has held since
    founding the company in 1993.<sup><a href="https://nvidianews.nvidia.com/bios/jensen-huang" target="_blank" rel="noopener noreferrer">6</a></sup>
  </p>
  <p>&nbsp;</p>
  <h3><strong>Job History</strong></h3>
  <ul class="list-disc pl-5">
    <li>Founder and CEO — NVIDIA (1993 – Present)</li>
    <li>Dishwasher, Busboy, Waiter — Denny's (1978 – 1983)</li>
  </ul>
  <p>&nbsp;</p>
  <h3><strong>Highlights</strong></h3>
  <ul class="list-disc pl-5">
    <li>
      Jensen Huang co-founded NVIDIA in 1993 and has led it to become the most
      valuable public company in the world as of 2024.<sup><a href="https://www.carnegie.org/awards/honoree/jensen-huang/" target="_blank" rel="noopener noreferrer">14</a></sup>
    </li>
    <li>
      Before founding NVIDIA, Huang worked at Denny's as a dishwasher,
      busboy and waiter from 1978 to 1983.<sup><a href="https://www.dennys.com/jensen-huang-dennys-story-his-favorite-order-how-make-it" target="_blank" rel="noopener noreferrer">16</a></sup>
    </li>
    <li>
      His journey from Denny's to a trillion-dollar tech company inspired
      Denny's to create a special "NVIDIA Breakfast Bytes" menu item.<sup><a href="https://www.dennys.com/news/dennys-debuts-new-nvidiar-breakfast-bytes" target="_blank" rel="noopener noreferrer">17</a></sup>
    </li>
    <li>
      NVIDIA was originally planned in a local Denny's where the founders met.<sup><a href="https://en.wikipedia.org/wiki/Jensen_Huang" target="_blank" rel="noopener noreferrer">18</a></sup>
    </li>
  </ul>
  <p>&nbsp;</p>
  <h3><strong>Detailed Research Notes</strong></h3>
  <ul class="list-disc pl-5">
    <li>
      Huang has served as president, CEO and board member of NVIDIA continuously
      since 1993.<sup><a href="https://nvidianews.nvidia.com/bios/jensen-huang" target="_blank" rel="noopener noreferrer">6</a></sup>
    </li>
    <li>
      He highlighted AI's impact in his GTC 2025 keynote.<sup><a href="https://www.nvidia.com/gtc/keynote/" target="_blank" rel="noopener noreferrer">12</a></sup>
    </li>
    <li>
      Huang stated that China is "not behind" in AI development.<sup><a href="https://www.cnbc.com/2025/04/30/nvidia-ceo-jensen-huang-says-china-not-behind-in-ai.html" target="_blank" rel="noopener noreferrer">9</a></sup>
    </li>
    <li>
      Early Denny's work taught him valuable life lessons.<sup><a href="https://www.dennys.com/jensen-huang-dennys-story-his-favorite-order-how-make-it" target="_blank" rel="noopener noreferrer">16</a></sup>
    </li>
    <li>
      A plaque marks the Denny's where NVIDIA was conceived.<sup><a href="https://blogs.nvidia.com/blog/nvidia-dennys-trillion/" target="_blank" rel="noopener noreferrer">19</a></sup>
    </li>
  </ul>
</div>
`

/* -------------------------------------------------------------------------- */
/*  Countdown status text                                                     */
/* -------------------------------------------------------------------------- */
const STEPS = [
  'Sourcing search results …',
  'Verifying profile …',
  'Expanding coverage …',
  'Pulling page details …',
  'Generating summary …',
  'Wrapping up …',
] as const

/* helpers ------------------------------------------------------------------ */
const normaliseHtml = (html: string) => html.replace(/<p>&nbsp;<\/p>/g, '')

/** keep <a> only inside <sup>; strip href everywhere else */
const prepareHtmlForClipboard = (raw: string) => {
  const div = document.createElement('div')
  div.innerHTML = normaliseHtml(raw)

  div.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
    if (a.closest('sup')) return            // keep citation links blue
    a.removeAttribute('href')
    a.style.textDecoration = 'none'
    a.style.color = 'inherit'
  })

  return {
    html: div.innerHTML,
    text: div.innerText,
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function Page() {
  const { user } = useAuth()

  /* state ------------------------------------------------------------------ */
  const [form, setForm]           = useState({ name: '', organization: '' })
  const [loading,   setLoading]   = useState(false)
  const [briefHtml, setBriefHtml] = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [usage, setUsage]         = useState<UsageData | null>(null)

  const [stepIdx,   setStepIdx]   = useState(0)
  const [remaining, setRemaining] = useState(45)

  const [pdfBusy, setPdfBusy] = useState(false)
  const pdfCooldownUntil = useRef<number>(0)

  const formRef = useRef<HTMLFormElement | null>(null)

  /* load usage data -------------------------------------------------------- */
  useEffect(() => {
    const loadUsage = async () => {
      const usageData = await UsageTracker.getUsageData(!!user);
      setUsage(usageData);
    };
    loadUsage();
  }, [user]);

  /* countdown ticker ------------------------------------------------------- */
  useEffect(() => {
    if (!loading) { setStepIdx(0); setRemaining(45); return }
    const t0 = Date.now()
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - t0) / 1000)
      setRemaining(Math.max(5, 45 - elapsed))
      if (elapsed < 45 && elapsed % 9 === 0) {
        setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
      }
      if (elapsed >= 45) clearInterval(id)
    }, 1_000)
    return () => clearInterval(id)
  }, [loading])

  /* analytics -------------------------------------------------------------- */
  const logSearchEvent = async (name: string, organization: string) => {
    try { await supabase.from('search_events').insert([{ name, organization }]) }
    catch (err) { console.error('Supabase log error:', err) }
  }

  /* submit ----------------------------------------------------------------- */
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check if user can generate
    if (usage?.needsSignup) {
      toast("You've used your 2 free briefs! Sign up for 5 free briefs per month.");
      return;
    }

    if (usage && usage.count >= usage.limit) {
      if (usage.isAuthenticated) {
        toast("Monthly brief limit reached. Please upgrade your plan to generate more briefs.");
      } else {
        toast("You've used your 2 free briefs! Sign up for 5 free briefs per month.");
      }
      return;
    }

    formRef.current
      ?.querySelectorAll<HTMLInputElement>('input')
      .forEach(el => (el.defaultValue = el.value))

    setLoading(true); setError(null); setBriefHtml(null)
    void logSearchEvent(form.name.trim(), form.organization.trim())

    try {
      const res = await fetch('/api/meetingbrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const { brief } = (await res.json()) as { brief: string }
      setBriefHtml(brief)

      // Update usage after successful generation
      if (!user) {
        // For anonymous users, increment local storage
        UsageTracker.incrementAnonymousUsage();
        const updatedUsage = await UsageTracker.getUsageData(false);
        setUsage(updatedUsage);
      } else {
        // For authenticated users, refresh from API
        const updatedUsage = await UsageTracker.getUsageData(true);
        setUsage(updatedUsage);
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  /* copy ------------------------------------------------------------------- */
  const copyHtml = async () => {
    if (!briefHtml) return
    const { html, text } = prepareHtmlForClipboard(briefHtml)

    try {
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html':  new Blob([html],  { type: 'text/html'  }),
            'text/plain': new Blob([text],  { type: 'text/plain' }),
          }),
        ])
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      toast('Brief copied to clipboard')
    } catch (err) {
      console.error('copyHtml() error:', err); toast('Copy failed')
    }
  }

  /* download PDF ----------------------------------------------------------- */
  const downloadPdf = async () => {
    if (pdfBusy || Date.now() < pdfCooldownUntil.current) return
    setPdfBusy(true)
    pdfCooldownUntil.current = Date.now() + 10_000

    if (!briefHtml) { toast('Nothing to export'); setPdfBusy(false); return }

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: normaliseHtml(briefHtml) }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = 'meeting-brief.pdf'
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast('PDF downloaded')
    } catch (err) {
      console.error('downloadPdf() error:', err)
      toast('PDF export failed')
    } finally {
      setPdfBusy(false)
    }
  }

  /* view ------------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR ------------------------------------------------------------- */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-xl">
            MeetingBrief
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="#how-it-works" className="hover:text-indigo-600">How It Works</Link>
            <Link href="#why-meetingbrief" className="hover:text-indigo-600">Why MeetingBrief</Link>
            <Link href="#pricing" className="hover:text-indigo-600">Pricing</Link>
            <Link href="#faq" className="hover:text-indigo-600">FAQ</Link>
            {user ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            {user ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO + FORM + DEMO ------------------------------------------------- */}
      <header className="bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col gap-4 text-center">
          {/* Hero */}
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Instant&nbsp;intel for every meeting
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Stop digging for info – gain back valuable hours and arrive prepared for every conversation
            </p>
          </div>

          {/* Try it Now */}
          <div className="mb-2">
            <p className="text-xl font-bold text-black">
              Try it Now
            </p>
          </div>

          {/* FORM */}
          <motion.form
            ref={formRef}
            id="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            onSubmit={submit}
            className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <Label htmlFor="name" className="w-20">Person</Label>
              <Input
                id="name"
                placeholder="Jensen Huang"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="org" className="w-20">Company</Label>
              <Input
                id="org"
                placeholder="NVIDIA"
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Get Your Brief'}
            </Button>

            {/* Usage Display */}
            {usage && (
              <div className="text-sm text-slate-600 text-center">
                {usage.isAuthenticated ? (
                  <span>
                    {usage.count}/{usage.limit} briefs used this month
                  </span>
                ) : (
                  <span>
                    {usage.count}/{usage.limit} free briefs used
                    {usage.needsSignup && (
                      <span> • <Link href="/auth/signup" className="text-indigo-600 hover:underline">Sign up for 5 free briefs/month</Link></span>
                    )}
                  </span>
                )}
              </div>
            )}
          </motion.form>

          {/* DEMO / LOADER / OUTPUT */}
          <div className="w-full max-w-5xl mx-auto">
            {loading && (
              <Card>
                <CardHeader>
                  <CardTitle>{STEPS[stepIdx]}</CardTitle>
                  <CardDescription>
                    {remaining > 5 ? `${remaining}s remaining` : '≈ 5 s remaining'}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            )}

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {!loading && briefHtml && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Brief ready <CheckCircle2 className="inline h-5 w-5 text-green-600" />
                  </CardTitle>
                  <CardDescription>Scroll, copy, or export</CardDescription>
                  <CardAction className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyHtml}>
                      Copy Brief
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadPdf}
                      disabled={pdfBusy}
                    >
                      {pdfBusy ? <Loader2 className="animate-spin h-4 w-4" /> : 'Download PDF'}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="prose prose-lg prose-slate max-w-none text-left prose-li:marker:text-slate-600">
                  <div dangerouslySetInnerHTML={{ __html: briefHtml }} />
                </CardContent>
              </Card>
            )}

            {!loading && !briefHtml && (
              <Card>
                <CardHeader><CardTitle>Real Example Brief</CardTitle></CardHeader>
                <CardContent className="prose prose-lg prose-slate max-w-none text-left max-h-96 overflow-auto prose-li:marker:text-slate-600">
                  <div dangerouslySetInnerHTML={{ __html: sampleBriefHtmlContent }} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* HOW IT WORKS -------------------------------------------------------- */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Three clicks from blank page to board-room ready
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            MeetingBrief automates the entire research stack so you never scramble for context.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { title: 'Paste a name & company', desc: 'Our parser cleans and normalizes the query.' },
              { title: 'AI scouts the web', desc: 'Search, scrape, and rank thousands of records in seconds.' },
              { title: 'Footnoted briefing appears', desc: 'Action-ready insights—export or share instantly.' },
            ].map(step => (
              <div key={step.title} className="flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-base font-medium text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY MEETINGBRIEF ---------------------------------------------------- */}
      <section id="why-meetingbrief" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center text-slate-900 mb-12">
            Research that moves as fast as your calendar
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Credible by default', desc: 'Every claim is source-linked for auditability.' },
              { title: 'Privacy first', desc: 'Data is encrypted at rest and in transit; never shared.' },
              { title: 'Built for teams', desc: 'Per-seat credits, SSO, and role-based access on all plans.' },
              { title: 'Zero busywork', desc: 'Browser extension and Calendar sync file requests for you.' },
            ].map(feature => (
              <Card key={feature.title} className="text-center shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING ------------------------------------------------------------- */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Simple, predictable pricing
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            Credits refresh every month—use them when you need them.
          </p>
          
          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { plan: 'Starter', price: '$29', credits: '50', ideal: 'Solo operators validating leads' },
              { plan: 'Growth', price: '$59', credits: '150', ideal: 'Recruiters & founders in active deal flow' },
              { plan: 'Scale', price: '$149', credits: '500', ideal: 'Teams that brief every meeting' },
            ].map(pricing => (
              <Card key={pricing.plan} className="shadow-lg relative">
                <CardHeader>
                  <CardTitle className="text-xl">{pricing.plan}</CardTitle>
                  <div className="text-3xl font-bold text-indigo-600">
                    {pricing.price}<span className="text-base font-normal text-slate-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-slate-900">{pricing.credits}</div>
                    <div className="text-sm text-slate-600">credits per month</div>
                  </div>
                  <p className="text-sm text-slate-600">{pricing.ideal}</p>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup">Choose {pricing.plan}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="mt-8 text-sm text-slate-500">
            30-day money-back guarantee • Secure Stripe checkout • Per-seat licensing
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF & TRUST ------------------------------------------------ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  &quot;MeetingBrief cut our pre-call prep from 30 minutes to 3. Our partners thought we had an army of analysts.&quot;
                </blockquote>
                <cite className="text-sm font-medium text-slate-900">— Alex A., Venture Capital</cite>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  &quot;We scrapped manual candidate research because MeetingBrief flagged risks in minutes that saved us hours&quot;
                </blockquote>
                <cite className="text-sm font-medium text-slate-900">— Joe D., Executive Search</cite>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">
              <span className="inline-block mx-1">256-bit encryption</span> •
              <span className="inline-block mx-1">US-based data centers</span> •
              <span className="inline-block mx-1">GDPR compliant</span> •
              <span className="inline-block mx-1">Continuous penetration testing</span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ ---------------------------------------------------------------- */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl font-semibold text-center">FAQ</h2>
          {[
            { q: 'How fast is a brief generated?', a: 'Under 45 seconds for most searches; complex entities may take up to 2 minutes.' },
            { q: 'Where do your sources come from?', a: 'Web search, dynamic scraping, and verified databases—each line footnoted.' },
            { q: 'Is my query private?', a: 'Yes. Queries and briefs are stored encrypted and never shared or used to train models.' },
            { q: 'How accurate are the insights?', a: 'Very. The searches are designed to avoid hallucinations and only return accurate hits. We show our work so that you can validate anything you need.' },
          ].map(f => (
            <div key={f.q} className="border-b border-slate-200 pb-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-slate-600 mt-2">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER ------------------------------------------------------------- */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row justify-between text-sm text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MeetingBrief</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-indigo-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
