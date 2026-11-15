import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { memos: { orderBy: { ply: "asc" } } },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }
  return NextResponse.json(game);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.game.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
