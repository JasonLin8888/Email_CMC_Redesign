import { NextRequest, NextResponse } from "next/server";
import { getMessage, deleteMessage, markRead, archiveMessage } from "@/lib/email/nylasClient";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const message = await getMessage(id);
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(message);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteMessage(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (body.action === "markRead") {
    await markRead(id, body.isRead);
  } else if (body.action === "archive") {
    await archiveMessage(id);
  }
  return NextResponse.json({ success: true });
}
