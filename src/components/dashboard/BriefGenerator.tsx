"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardAction } from "@/components/ui/card";
import { toast } from "sonner";
import { prepareHtmlForClipboard } from "@/lib/utils";

const STEPS = [
  'Sourcing search results …',
  'Verifying profile …',
  'Expanding coverage …',
  'Pulling page details …',
  'Generating summary …',
  'Wrapping up …',
] as const;

interface BriefUsage {
  currentMonthCount: number;
  monthlyLimit: number;
  planName: string;
}

const normaliseHtml = (html: string) => html.replace(/<p>&nbsp;<\/p>/g, '');

export function BriefGenerator() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const [briefHtml, setBriefHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(45);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [usage, setUsage] = useState<BriefUsage | null>(null);
  
  const pdfCooldownUntil = useRef<number>(0);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Fetch usage data
  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/brief-usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  // Countdown ticker
  useEffect(() => {
    if (!loading) { setStepIdx(0); setRemaining(45); return; }
    const t0 = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - t0) / 1000);
      setRemaining(Math.max(5, 45 - elapsed));
      if (elapsed < 45 && elapsed % 9 === 0) {
        setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
      }
      if (elapsed >= 45) clearInterval(id);
    }, 1_000);
    return () => clearInterval(id);
  }, [loading]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check usage limits
    if (usage && usage.currentMonthCount >= usage.monthlyLimit) {
      toast("Monthly brief limit reached. Please upgrade your plan to generate more briefs.");
      return;
    }

    formRef.current
      ?.querySelectorAll<HTMLInputElement>('input')
      .forEach(el => (el.defaultValue = el.value));

    setLoading(true); 
    setError(null); 
    setBriefHtml(null);

    try {
      const res = await fetch('/api/meetingbrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const { brief } = (await res.json()) as { brief: string };
      setBriefHtml(brief);
      // Refresh usage after successful generation
      fetchUsage();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyHtml = async () => {
    if (!briefHtml) return;
    const { html, text } = prepareHtmlForClipboard(briefHtml);

    try {
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast('Brief copied to clipboard');
    } catch (err) {
      console.error('copyHtml() error:', err); 
      toast('Copy failed');
    }
  };

  const downloadPdf = async () => {
    if (pdfBusy || Date.now() < pdfCooldownUntil.current) return;
    setPdfBusy(true);
    pdfCooldownUntil.current = Date.now() + 10_000;

    if (!briefHtml) { 
      toast('Nothing to export'); 
      setPdfBusy(false); 
      return; 
    }

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: normaliseHtml(briefHtml) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meeting-brief.pdf';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast('PDF downloaded');
    } catch (err) {
      console.error('downloadPdf() error:', err);
      toast('PDF export failed');
    } finally {
      setPdfBusy(false);
    }
  };

  const canGenerate = usage ? usage.currentMonthCount < usage.monthlyLimit : true;

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Brief Usage</CardTitle>
            <CardDescription>
              {usage.currentMonthCount} of {usage.monthlyLimit === -1 ? 'unlimited' : usage.monthlyLimit} briefs used this month
            </CardDescription>
          </CardHeader>
          {usage.monthlyLimit !== -1 && (
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((usage.currentMonthCount / usage.monthlyLimit) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Brief Generator Form */}
      <motion.form
        ref={formRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
        onSubmit={submit}
        className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4"
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
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            required
          />
        </div>

        <Button type="submit" disabled={loading || !canGenerate}>
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 
           !canGenerate ? 'Monthly Limit Reached' : 'Generate Brief'}
        </Button>
        
        {!canGenerate && (
          <p className="text-sm text-red-600 text-center">
            You&apos;ve reached your monthly brief limit. Upgrade your plan to generate more briefs.
          </p>
        )}
      </motion.form>

      {/* Loading */}
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

      {/* Error */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Generated Brief */}
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
    </div>
  );
} 