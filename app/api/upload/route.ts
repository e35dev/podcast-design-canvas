import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { storage } from "@/lib/storage";
import { currentTenant } from "@/lib/tenancy";

// Upload a media file to the object store.
export async function POST(req: NextRequest) {
  const ctx = await currentTenant();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `${ctx.workspaceId}/${randomUUID()}.${ext}`;
  const data = Buffer.from(await file.arrayBuffer());
  await storage().put(key, data, file.type);

  return NextResponse.json({ key, url: storage().url(key) }, { status: 201 });
}
