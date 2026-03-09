import { NextRequest, NextResponse } from "next/server";
import { listLabels, createLabel } from "@/lib/email/nylasClient";

export async function GET() {
  const labels = await listLabels();
  return NextResponse.json(labels);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const label = await createLabel(body.name);
  if (!label) {
    return NextResponse.json({ error: "Failed to create label" }, { status: 500 });
  }
  return NextResponse.json(label);
}
