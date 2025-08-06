// app/api/tasks/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/generateToken';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    const { title, description, status, categoryId } = await req.json();

    const updated = await prisma.task.update({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
      data: {
        title,
        description,
        status,
        categoryId,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);

    await prisma.task.delete({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
    });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
