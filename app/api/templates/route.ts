import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentTenant } from "@/lib/tenancy";

export async function GET() {
  const ctx = await currentTenant();
  const templates = await db.template.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const ctx = await currentTenant();
  const body = (await req.json()) as { name?: string; spec?: Record<string, unknown> };
  const template = await db.template.create({
    data: {
      workspaceId: ctx.workspaceId,
      name: body.name ?? "Untitled template",
      spec: (body.spec ?? {}) as object,
    },
  });
  return NextResponse.json(template, { status: 201 });
}
