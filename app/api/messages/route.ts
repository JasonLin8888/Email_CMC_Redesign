import { NextRequest, NextResponse } from "next/server";
import { listMessages } from "@/lib/email/nylasClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") ?? "all";
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const query = searchParams.get("query") ?? undefined;

  const result = await listMessages({ folder, limit, offset, query });
  return NextResponse.json(result);
}
