import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (_error) {
    return null;
  }
}
