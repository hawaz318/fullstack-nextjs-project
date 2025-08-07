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


export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    
    const where = {
      userId,
      ...(category ? { category: { name: category } } : {}),
      ...(status ? { status } : {}),
    };
    const tasks = await prisma.task.findMany({
      where,
      include: { category: true },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
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

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pending',
        categoryId,
        userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
