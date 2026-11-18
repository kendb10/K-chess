import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "Memo text is required." }, { status: 400 });
  }
  if (typeof body.ply !== "number" || body.ply < 0) {
    return NextResponse.json({ error: "Invalid ply." }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: params.id } });
  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const memo = await prisma.memo.create({
    data: { gameId: params.id, ply: body.ply, text: body.text.trim() },
  });

  return NextResponse.json(memo, { status: 201 });
}
