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
import { FeedbackWidget } from '@/components/ui/FeedbackWidget'

/* -------------------------------------------------------------------------- */
/*  Supabase client (public keys only)                                        */
/* -------------------------------------------------------------------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnon) {
  console.warn('Supabase not configured - some features may not work')
}

// Only create Supabase client if both URL and key are available
const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnon) 
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

/* -------------------------------------------------------------------------- */
/*  Static demo brief (shown when no API data is loaded)                      */
/* -------------------------------------------------------------------------- */
const sampleBriefHtmlContent = `
<div>
  <h2><strong>MeetingBrief: Jensen Huang – NVIDIA</strong></h2>
  <br>
  <h3><strong>Executive Summary</strong></h3>
  <p>Jensen Huang is the co-founder, president, and CEO of NVIDIA, leading the company since 1993. <sup><a href="https://nvidianews.nvidia.com/bios/jensen-huang" target="_blank" rel="noopener noreferrer" title="NVIDIA Official Bio" style="color: #0066cc; text-decoration: none;">1</a></sup> Under his leadership, NVIDIA pioneered the GPU, transforming gaming, AI, and accelerated computing industries. <sup><a href="https://blogs.nvidia.com/blog/nvidia-dennys-trillion/" target="_blank" rel="noopener noreferrer" title="From Denny's to Trillion" style="color: #0066cc; text-decoration: none;">2</a></sup> He is recognized as one of TIME's 100 most influential people and has received numerous prestigious awards including the IEEE Founder's Medal. <sup><a href="https://www.carnegie.org/awards/honoree/jensen-huang/" target="_blank" rel="noopener noreferrer" title="Carnegie Corporation Award" style="color: #0066cc; text-decoration: none;">3</a></sup></p>
  <br>
  <h3><strong>Job History</strong></h3>
  <ul class="list-disc pl-5">
    <li>Founder and CEO — NVIDIA (1993 – Present)</li>
    <li>Engineer — Advanced Micro Devices (1985 – 1993)</li>
    <li>Engineer — LSI Logic (1984 – 1985)</li>
    <li>Dishwasher, Busboy, Waiter — Denny's (1978 – 1983)</li>
  </ul>
  <br>
  <h3><strong>Education</strong></h3>
  <ul class="list-disc pl-5">
    <li>MSEE — Stanford University (1992)</li>
    <li>BSEE — Oregon State University (1984)</li>
  </ul>
  <br>
  <h3><strong>Highlights & Fun Facts</strong></h3>
  <ul class="list-disc pl-5">
    <li>Co-founded NVIDIA in 1993 and has served as CEO and president since inception, leading it to become one of the world's most valuable companies. <sup><a href="https://nvidianews.nvidia.com/bios/jensen-huang" target="_blank" rel="noopener noreferrer" title="NVIDIA Official Bio" style="color: #0066cc; text-decoration: none;">1</a></sup></li>
    <li>Led NVIDIA to invent the GPU in 1999, sparking unprecedented growth in PC gaming and modern AI computing. <sup><a href="https://blogs.nvidia.com/blog/nvidia-dennys-trillion/" target="_blank" rel="noopener noreferrer" title="GPU Innovation History" style="color: #0066cc; text-decoration: none;">2</a></sup></li>
    <li>Recipient of the IEEE Founder's Medal, Robert N. Noyce Award, and multiple honorary doctorates from prestigious universities. <sup><a href="https://www.carnegie.org/awards/honoree/jensen-huang/" target="_blank" rel="noopener noreferrer" title="Awards and Recognition" style="color: #0066cc; text-decoration: none;">3</a></sup></li>
    <li>Named world's best CEO by Fortune, The Economist, and Brand Finance in recent years. <sup><a href="https://fortune.com/ranking/worlds-greatest-leaders/" target="_blank" rel="noopener noreferrer" title="CEO Recognition" style="color: #0066cc; text-decoration: none;">4</a></sup></li>
    <li>Started working at Denny's as a dishwasher, busboy, and waiter during his youth, experiences that shaped his work ethic. <sup><a href="https://www.dennys.com/jensen-huang-dennys-story-his-favorite-order-how-make-it" target="_blank" rel="noopener noreferrer" title="Denny's Origins" style="color: #0066cc; text-decoration: none;">5</a></sup></li>
    <li>The founding idea for NVIDIA was actually conceived at a Denny's restaurant booth, where Huang met with his co-founders. <sup><a href="https://blogs.nvidia.com/blog/nvidia-dennys-trillion/" target="_blank" rel="noopener noreferrer" title="NVIDIA Origin Story" style="color: #0066cc; text-decoration: none;">2</a></sup></li>
    <li>Known for his signature black leather jacket, which has become an iconic part of his CEO persona instead of traditional business suits. <sup><a href="https://en.wikipedia.org/wiki/Jensen_Huang" target="_blank" rel="noopener noreferrer" title="Personal Style" style="color: #0066cc; text-decoration: none;">6</a></sup></li>
  </ul>
  <br>
  <h3><strong>Detailed Research Notes</strong></h3>
  <ul class="list-disc pl-5">
    <li>Born in 1963 in Tainan, Taiwan, and moved to the United States at age 10, eventually becoming a naturalized citizen. <sup><a href="https://en.wikipedia.org/wiki/Jensen_Huang" target="_blank" rel="noopener noreferrer" title="Early Life" style="color: #0066cc; text-decoration: none;">6</a></sup></li>
    <li>Worked at LSI Logic and Advanced Micro Devices before founding NVIDIA, gaining crucial semiconductor industry experience. <sup><a href="https://nvidianews.nvidia.com/bios/jensen-huang" target="_blank" rel="noopener noreferrer" title="Career Background" style="color: #0066cc; text-decoration: none;">1</a></sup></li>
    <li>NVIDIA's distinctive culture is shaped by early financial struggles, including being just 30 days from bankruptcy in 1996. <sup><a href="https://quartr.com/insights/edge/the-story-of-jensen-huang-and-nvidia" target="_blank" rel="noopener noreferrer" title="Early Struggles" style="color: #0066cc; text-decoration: none;">7</a></sup></li>
    <li>Emphasizes that resilience and character are formed through suffering, viewing challenges as essential for growth and success. <sup><a href="https://quartr.com/insights/edge/the-story-of-jensen-huang-and-nvidia" target="_blank" rel="noopener noreferrer" title="Leadership Philosophy" style="color: #0066cc; text-decoration: none;">7</a></sup></li>
    <li>Has been named to the U.S. Immigrant Entrepreneur Hall of Fame and received the Dr. Morris Chang Exemplary Leadership Award. <sup><a href="https://www.carnegie.org/awards/honoree/jensen-huang/" target="_blank" rel="noopener noreferrer" title="Additional Awards" style="color: #0066cc; text-decoration: none;">3</a></sup></li>
    <li>Married to Lori Huang since 1985 and has two children, maintaining a relatively private family life despite his public prominence. <sup><a href="https://en.wikipedia.org/wiki/Jensen_Huang" target="_blank" rel="noopener noreferrer" title="Personal Life" style="color: #0066cc; text-decoration: none;">6</a></sup></li>
  </ul>
  <br>
  <h3><strong>Possible LinkedIn Profile</strong></h3>
  <p><a href="https://www.linkedin.com/in/jenhsunhuang" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">https://www.linkedin.com/in/jenhsunhuang</a></p>
  <p><em>Note: You may need to be logged in to LinkedIn to view the full profile.</em></p>
</div>
`

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */
const STEPS = [
  'Sourcing search results …',
  'Verifying profile …',
  'Expanding coverage …',
  'Pulling page details …',
  'Generating summary …',
  'Wrapping up …',
] as const

const normaliseHtml = (html: string) => html.replace(/<p>&nbsp;<\/p>/g, '')

const prepareHtmlForClipboard = (raw: string) => {
  const html = `<meta charset="utf-8">${raw}`
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = raw
  const text = tempDiv.textContent || tempDiv.innerText || ''
  
  return { html, text }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function Page() {
  const { user } = useAuth()

  const [form, setForm] = useState({ name: '', organization: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [briefHtml, setBriefHtml] = useState<string | null>(null)
  const [briefId, setBriefId] = useState<number | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  const [stepIdx, setStepIdx] = useState(0)
  const [remaining, setRemaining] = useState(30)

  const formRef = useRef<HTMLFormElement>(null)

  /* preload usage ---------------------------------------------------------- */
  useEffect(() => {
    const loadUsage = async () => {
      try {
        const usageData = await UsageTracker.getUsageData(!!user);
        setUsage(usageData);
      } catch (error) {
        console.error('Failed to load usage data:', error);
      }
    };

    loadUsage();
  }, [user]);

  /* stepper effect --------------------------------------------------------- */
  useEffect(() => {
    if (!loading) { setStepIdx(0); setRemaining(30); return; }
    const t0 = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - t0) / 1000);
      setRemaining(Math.max(5, 30 - elapsed));
      // Advance step every 5 seconds for first 5 steps (0-4)
      if (elapsed < 25 && elapsed % 5 === 0) {
        setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
      }
      // Last step stays for final 5 seconds
      if (elapsed >= 30) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [loading])

  /* analytics -------------------------------------------------------------- */
  const logSearchEvent = async (name: string, organization: string) => {
    try { await supabase?.from('search_events').insert([{ name, organization }]) }
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

    setLoading(true); setError(null); setBriefHtml(null); setBriefId(null)
    void logSearchEvent(form.name.trim(), form.organization.trim())

    try {
      const res = await fetch('/api/meetingbrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const { brief, briefId: returnedBriefId } = (await res.json()) as { brief: string; briefId: number }
      setBriefHtml(brief)
      setBriefId(returnedBriefId)

      // Clear form to prevent browser warning about unsaved changes
      setForm({ name: '', organization: '' })
      
      // Also reset the form element's defaultValues
      formRef.current
        ?.querySelectorAll<HTMLInputElement>('input')
        .forEach(el => {
          el.defaultValue = ''
          el.value = ''
        })

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

  /* pdf -------------------------------------------------------------------- */
  const downloadPdf = async () => {
    if (pdfBusy || !briefHtml) return
    setPdfBusy(true)

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: normaliseHtml(briefHtml) }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
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
        <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col gap-6 text-center">
          {/* Hero */}
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              AI-Powered Meeting Research Briefs in 30 Seconds
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Arrive at every sales call, interview, or board meeting armed with source-linked intel
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

            <Button type="submit" disabled={loading} className="text-lg font-bold py-3">
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                usage && usage.count > 0 ? 'Generate Brief' : 'Generate My First Brief'
              )}
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
                    {remaining > 10 ? `${remaining}s remaining` : `${remaining}s remaining`}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            )}

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {!loading && briefHtml && (
              <div className="space-y-6">
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
                      {/* Add Feedback Widget for authenticated users with briefId */}
                      {user && briefId && (
                        <FeedbackWidget briefId={briefId} />
                      )}
                    </CardAction>
                  </CardHeader>
                  <CardContent className="prose prose-lg prose-slate max-w-none text-left prose-li:marker:text-slate-600">
                    <div dangerouslySetInnerHTML={{ __html: briefHtml }} />
                  </CardContent>
                </Card>
              </div>
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
            From name to game plan in under 30 seconds
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get comprehensive background intel on any professional—instantly sourced, verified, and formatted.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { title: 'Paste a name & company', desc: 'Our AI-powered research brief generator cleans and normalizes your query for accurate results.' },
              { title: 'AI scouts the web', desc: 'Automated meeting prep searches and verifies thousands of sources in seconds.' },
              { title: 'Footnoted briefing appears', desc: 'Get your AI meeting research brief—export as PDF or share instantly.' },
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
            Never walk into a meeting unprepared again
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Every fact verified', desc: 'Each research brief includes source links for complete transparency and auditability.' },
              { title: 'Privacy first', desc: 'Your meeting prep data is encrypted at rest and in transit; never shared or used for training.' },
              { title: 'Built for teams', desc: 'Per-seat research brief credits, SSO, and role-based access on all plans.' },
              { title: 'Works with your workflow', desc: 'Browser extension and Calendar sync automate your meeting research requests.' },
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
            Simple, predictable pricing for AI meeting prep
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            No contracts. No surprises. Just the meeting research briefs you need, when you need them.
          </p>
          
          <div className="grid gap-8 sm:grid-cols-1 max-w-md mx-auto">
            {[
              { plan: 'Starter', price: '$10', credits: '50 research briefs', ideal: 'Perfect for sales professionals and executives who need automated meeting prep' },
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
                    <div className="text-sm text-slate-600">per month</div>
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
            30-day money-back guarantee • Secure checkout • Per research brief pricing
          </p>
        </div>
      </section>

      {/* USE CASES ----------------------------------------------------------- */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center text-slate-900 mb-4">
            Automated meeting prep for every professional scenario
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12">
            From sales discovery to executive recruiting, arrive prepared with AI-generated research briefs
          </p>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Sales & Business Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Transform cold outreach into warm conversations. Our AI meeting prep tool uncovers shared connections, recent company news, and conversation starters that matter.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Prospect background research</li>
                  <li>• Deal flow intelligence</li>
                  <li>• Partnership due diligence</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Executive Recruiting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Make every candidate interview count. Generate comprehensive research briefs that reveal career trajectories, achievements, and cultural fit indicators.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Candidate background checks</li>
                  <li>• Reference verification prep</li>
                  <li>• Executive assessment briefs</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Investor Relations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Know your audience before they know you. Our automated research brief generator compiles investor portfolios, preferences, and past exits.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• VC partner profiles</li>
                  <li>• Board meeting preparation</li>
                  <li>• Fundraising intelligence</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-center text-slate-900 mb-8">
              What's included in every AI-powered meeting brief
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-lg mb-3">Professional Background</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>✓ Complete employment history with dates</li>
                  <li>✓ Educational credentials and institutions</li>
                  <li>✓ Board positions and advisory roles</li>
                  <li>✓ Published articles and thought leadership</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3">Strategic Intelligence</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>✓ Recent news mentions and press coverage</li>
                  <li>✓ Speaking engagements and conference appearances</li>
                  <li>✓ Investment history and portfolio companies</li>
                  <li>✓ Potential conversation topics and shared interests</li>
                </ul>
              </div>
            </div>
          </div>
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
            { q: 'How fast is an AI meeting research brief generated?', a: 'Under 30 seconds for most automated meeting prep requests; complex profiles may take up to 1 minute.' },
            { q: 'Where do your sources come from?', a: 'Our AI-powered research brief generator searches public web sources, professional databases, and news archives—each fact is footnoted with its source.' },
            { q: 'Is my meeting prep data private?', a: 'Yes. Your research brief queries and results are stored encrypted and never shared or used to train AI models.' },
            { q: 'Can I trust the information in my research briefs?', a: 'Every fact is linked to its original source. We prioritize accuracy over speed—if we can\'t verify it, we don\'t include it in your meeting brief.' },
            { q: 'What types of meetings is this for?', a: 'MeetingBrief is perfect for sales calls, candidate interviews, investor meetings, partnership discussions, and any professional interaction where background research matters.' },
            { q: 'How is this different from LinkedIn or Google searches?', a: 'Instead of spending 30+ minutes piecing together information from multiple sources, our automated meeting prep tool delivers a comprehensive, formatted brief with verified facts in seconds.' },
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
