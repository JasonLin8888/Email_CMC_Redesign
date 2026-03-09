import { NextRequest, NextResponse } from "next/server";
import { getMessage, deleteMessage, markRead, archiveMessage } from "@/lib/email/nylasClient";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const message = await getMessage(params.id);
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(message);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteMessage(params.id);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  if (body.action === "markRead") {
    await markRead(params.id, body.isRead);
  } else if (body.action === "archive") {
    await archiveMessage(params.id);
  }
  return NextResponse.json({ success: true });
}
