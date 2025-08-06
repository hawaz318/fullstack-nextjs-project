import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/utils/generateToken';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  categoryId: z.string().optional(),
});

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);

    const body = await req.json();
    const result = taskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: params.id, userId: decoded.userId },
    });
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    const { title, description, status, categoryId } = result.data;

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: { title, description, status, categoryId },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);

    const existingTask = await prisma.task.findFirst({
      where: { id: params.id, userId: decoded.userId },
    });
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
