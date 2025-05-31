import * as jwt from 'jsonwebtoken';

function createToken(data) {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return token;
}

function verifyToken(token: string): { id: number; role: number } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
      role: number;
    };
  } catch (error) {
    return null;
  }
}

export { createToken, verifyToken };
