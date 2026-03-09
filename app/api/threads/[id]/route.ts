import { NextRequest, NextResponse } from "next/server";
import { getThread, getThreadMessages } from "@/lib/email/nylasClient";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [thread, messages] = await Promise.all([
    getThread(id),
    getThreadMessages(id),
  ]);

  return NextResponse.json({ thread, messages });
}
