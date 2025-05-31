import * as crypto from 'crypto';

function createSaltAndHash(payload: string, salt: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(salt + payload)
    .digest('hex');

  return `${salt}:${hash}`;
}

function genSalt(): string {
  return crypto.randomUUID();
}

export { createSaltAndHash, genSalt };
