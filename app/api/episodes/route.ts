import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentTenant } from "@/lib/tenancy";
import { emptyDocument, EditDocument } from "@edit-schema";

export async function GET() {
  const ctx = await currentTenant();
  const episodes = await db.episode.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(episodes);
}

export async function POST(req: NextRequest) {
  const ctx = await currentTenant();
  const body = (await req.json()) as { title?: string; preset?: string };

  const episode = await db.episode.create({
    data: {
      workspaceId: ctx.workspaceId,
      title: body.title ?? "Untitled episode",
      // Born from a preset, never blank.
      document: emptyDocument({
        episodeId: "pending",
        workspaceId: ctx.workspaceId,
        preset: body.preset ?? "calm-interview",
      }) as object,
    },
  });

  const doc = EditDocument.parse(episode.document);
  doc.episodeId = episode.id;
  await db.episode.update({ where: { id: episode.id }, data: { document: doc as object } });

  return NextResponse.json(episode, { status: 201 });
}
