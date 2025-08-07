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

const paramsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

function getIdFromContext(context: unknown): string {
  const result = paramsSchema.safeParse((context as { params?: unknown })?.params);
  if (!result.success) {
    throw new Error('Invalid or missing ID in route parameters');
  }
  return result.data.id;
}

export async function PUT(req: NextRequest, context: unknown) {
  try {
    const id = getIdFromContext(context);

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const body = await req.json();
    const result = taskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { title, description, status, categoryId } = result.data;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, description, status, categoryId },
    });

    return NextResponse.json(updatedTask);
  } catch (err) {
    console.error('PUT /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: unknown) {
  try {
    const id = getIdFromContext(context);

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
