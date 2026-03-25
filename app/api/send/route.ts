import { NextRequest, NextResponse } from "next/server";
import { sendMessage, getDefaultFromAddress } from "@/lib/email/nylasClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await sendMessage({
      to: body.to,
      from: body.from || getDefaultFromAddress(),
      subject: body.subject,
      body: body.body,
      cc: body.cc,
      bcc: body.bcc,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
