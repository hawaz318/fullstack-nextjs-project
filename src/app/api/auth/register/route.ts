import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const {name, email, password } = await req.json();

    if (!name||!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'User registered', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
