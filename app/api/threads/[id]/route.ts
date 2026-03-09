import { NextRequest, NextResponse } from "next/server";
import { getThread, getThreadMessages } from "@/lib/email/nylasClient";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const [thread, messages] = await Promise.all([
    getThread(params.id),
    getThreadMessages(params.id),
  ]);

  return NextResponse.json({ thread, messages });
}
