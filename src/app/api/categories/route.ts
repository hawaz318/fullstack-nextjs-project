import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/generateToken';

export async function GET() {
  const categories = await prisma.category.findMany();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    verifyToken(token); 
    const { name } = await req.json();

    const newCategory = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(newCategory);
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}