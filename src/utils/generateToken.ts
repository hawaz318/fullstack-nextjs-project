import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';


interface TokenPayload {
  userId: string;
  email?: string; 
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
    return {
      userId: decoded.userId as string,
      email: decoded.email as string | undefined,
    };
  }
  throw new Error('Invalid token payload');
}
