import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

// Stream a stored object back to the browser.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  try {
    const data = await storage().get(key.join("/"));
    return new NextResponse(data as BodyInit, {
      headers: { "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
