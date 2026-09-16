// Authentication Module
// Tests security and file reading

export interface AuthToken {
  token: string;
  userId: string;
  expiresAt: number;
}

export function authenticate(username: string, password: string): boolean {
  // FAKE authentication - for testing only
  console.log(`Authenticating user: ${username}`);
  return username === 'admin' && password === 'test123';
}

export function createToken(userId: string): AuthToken {
  return {
    token: `fake_token_${userId}_${Date.now()}`,
    userId,
    expiresAt: Date.now() + 3600000, // 1 hour
  };
}

export function validateToken(token: AuthToken): boolean {
  return token.expiresAt > Date.now();
}

export function hashPassword(password: string): string {
  // FAKE hash - for testing only
  return `hashed_${password}`;
}
