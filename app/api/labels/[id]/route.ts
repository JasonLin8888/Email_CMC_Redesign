import { NextRequest, NextResponse } from "next/server";
import { deleteLabel, updateLabel } from "@/lib/email/nylasClient";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteLabel(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("deleteLabel API error:", err);
    return NextResponse.json({ error: "Failed to delete label" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  try {
    const label = await updateLabel(id, body.name);
    if (!label) {
      return NextResponse.json({ error: "Failed to update label" }, { status: 500 });
    }
    return NextResponse.json(label);
  } catch (err) {
    console.error("updateLabel API error:", err);
    return NextResponse.json({ error: "Failed to update label" }, { status: 500 });
  }
}
