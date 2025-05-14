// app/api/meetingbrief/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildMeetingBriefGemini } from "@/lib/MeetingBriefGeminiPipeline";

export async function POST(req: NextRequest) {
  try {
    const { name, org } = await req.json();
    const payload = await buildMeetingBriefGemini(name, org);
    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "pipeline failed" }, { status: 500 });
  }
}