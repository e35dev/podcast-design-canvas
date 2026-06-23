import { NextRequest, NextResponse } from "next/server";
import { currentTenant } from "@/lib/tenancy";
import { dispatchTranscribe } from "@/lib/render";

// Enqueue a transcription job.
export async function POST(req: NextRequest) {
  const ctx = await currentTenant();
  const body = (await req.json()) as { episodeId?: string };
  if (!body.episodeId) {
    return NextResponse.json({ error: "episodeId required" }, { status: 400 });
  }
  const jobId = await dispatchTranscribe(ctx.workspaceId, body.episodeId);
  return NextResponse.json({ jobId }, { status: 202 });
}
