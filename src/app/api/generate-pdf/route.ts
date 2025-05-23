/* -------------------------------------------------------------------------- */
/*  src/app/api/generate-pdf/route.ts                                         */
/* -------------------------------------------------------------------------- */
import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Payload {
  htmlContent?: string
  filename?: string
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const html = body.htmlContent?.trim()
  if (!html) {
    return NextResponse.json({ message: 'htmlContent required' }, { status: 400 })
  }

  const execPath = await chromium.executablePath()
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: execPath || undefined,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  })

  try {
    const page = await browser.newPage()
    await page.goto(`data:text/html,${encodeURIComponent(html)}`, {
      waitUntil: 'networkidle0',
    })

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '24px', bottom: '24px', left: '24px', right: '24px' },
    })

    const filename =
      (body.filename ?? 'meeting-brief.pdf').replace(/[^\w.-]/g, '') || 'brief.pdf'

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
      },
    })
  } finally {
    await browser.close()
  }
}
