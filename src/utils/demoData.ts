import { FileNode, ProjectIndex } from './fileSystem';

// Demo project structure for testing without real files
export function createDemoIndex(): ProjectIndex {
  const files: FileNode[] = [
    {
      name: 'src', path: 'src', type: 'directory', isExpanded: true,
      children: [
        {
          name: 'auth', path: 'src/auth', type: 'directory', isExpanded: true,
          children: [
            { name: 'login.ts', path: 'src/auth/login.ts', type: 'file', size: 2450, extension: 'ts' },
            { name: 'logout.ts', path: 'src/auth/logout.ts', type: 'file', size: 890, extension: 'ts' },
            { name: 'session.ts', path: 'src/auth/session.ts', type: 'file', size: 1560, extension: 'ts' },
            { name: 'middleware.ts', path: 'src/auth/middleware.ts', type: 'file', size: 3200, extension: 'ts' },
          ]
        },
        {
          name: 'api', path: 'src/api', type: 'directory', isExpanded: false,
          children: [
            { name: 'routes.ts', path: 'src/api/routes.ts', type: 'file', size: 4500, extension: 'ts' },
            { name: 'users.ts', path: 'src/api/users.ts', type: 'file', size: 3800, extension: 'ts' },
            { name: 'posts.ts', path: 'src/api/posts.ts', type: 'file', size: 2900, extension: 'ts' },
            { name: 'comments.ts', path: 'src/api/comments.ts', type: 'file', size: 1800, extension: 'ts' },
          ]
        },
        {
          name: 'components', path: 'src/components', type: 'directory', isExpanded: false,
          children: [
            { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file', size: 2100, extension: 'tsx' },
            { name: 'Footer.tsx', path: 'src/components/Footer.tsx', type: 'file', size: 1500, extension: 'tsx' },
            { name: 'Sidebar.tsx', path: 'src/components/Sidebar.tsx', type: 'file', size: 3400, extension: 'tsx' },
            { name: 'Dashboard.tsx', path: 'src/components/Dashboard.tsx', type: 'file', size: 5600, extension: 'tsx' },
            { name: 'LoginForm.tsx', path: 'src/components/LoginForm.tsx', type: 'file', size: 2800, extension: 'tsx' },
          ]
        },
        {
          name: 'database', path: 'src/database', type: 'directory', isExpanded: false,
          children: [
            { name: 'schema.ts', path: 'src/database/schema.ts', type: 'file', size: 4200, extension: 'ts' },
            { name: 'connection.ts', path: 'src/database/connection.ts', type: 'file', size: 1800, extension: 'ts' },
            { name: 'migrations.ts', path: 'src/database/migrations.ts', type: 'file', size: 6700, extension: 'ts' },
          ]
        },
        { name: 'App.tsx', path: 'src/App.tsx', type: 'file', size: 1200, extension: 'tsx' },
        { name: 'main.tsx', path: 'src/main.tsx', type: 'file', size: 450, extension: 'tsx' },
        { name: 'index.css', path: 'src/index.css', type: 'file', size: 890, extension: 'css' },
      ]
    },
    {
      name: 'public', path: 'public', type: 'directory', isExpanded: false,
      children: [
        { name: 'index.html', path: 'public/index.html', type: 'file', size: 560, extension: 'html' },
        { name: 'favicon.ico', path: 'public/favicon.ico', type: 'file', size: 4200, extension: 'ico' },
      ]
    },
    { name: 'package.json', path: 'package.json', type: 'file', size: 1800, extension: 'json' },
    { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file', size: 650, extension: 'json' },
    { name: 'README.md', path: 'README.md', type: 'file', size: 3400, extension: 'md' },
    { name: '.gitignore', path: '.gitignore', type: 'file', size: 280, extension: 'gitignore' },
  ];

  const flatFiles: FileNode[] = [];
  const extensions: Record<string, number> = {};
  let totalSize = 0;
  let totalDirs = 0;

  const flatten = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'file') {
        flatFiles.push(node);
        if (node.extension) extensions[node.extension] = (extensions[node.extension] || 0) + 1;
        totalSize += node.size || 0;
      } else {
        totalDirs++;
        if (node.children) flatten(node.children);
      }
    }
  };
  flatten(files);

  return {
    rootName: 'demo-project',
    totalFiles: flatFiles.length,
    totalDirs,
    totalSize,
    files,
    flatFiles,
    extensions,
    indexedAt: Date.now(),
  };
}

// Demo file contents
export const DEMO_FILE_CONTENTS: Record<string, string> = {
  'src/auth/login.ts': `import { hashPassword, verifyToken } from './utils';
import { db } from '../database/connection';
import { Session } from './session';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  user?: { id: string; email: string; name: string };
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const { email, password, rememberMe } = credentials;
  
  // Validate input
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    // Find user in database
    const user = await db.users.findByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const isValid = await hashPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create session
    const session = new Session(user.id, rememberMe);
    const token = await session.create();

    // Update last login
    await db.users.updateLastLogin(user.id);

    return {
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function refreshToken(currentToken: string): Promise<string | null> {
  const session = await Session.verify(currentToken);
  if (!session) return null;
  return session.refresh();
}`,

  'src/auth/middleware.ts': `import { Request, Response, NextFunction } from 'express';
import { Session } from './session';
import { db } from '../database/connection';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const session = await Session.verify(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await db.users.findById(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}`,

  'src/database/connection.ts': `import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  users: {
    findByEmail: async (email: string) => {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    },
    findById: async (id: string) => {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    },
    updateLastLogin: async (id: string) => {
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
    },
  },
  posts: {
    findAll: async (limit = 20, offset = 0) => {
      const result = await pool.query(
        'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result.rows;
    },
  },
};

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});`,

  'package.json': `{
  "name": "demo-project",
  "version": "1.0.0",
  "description": "A demo project for ULAB testing",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "express": "^4.18.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}`,

  'README.md': `# Demo Project

This is a demo project for testing Universal Local AI Bridge.

## Structure
- \`src/auth/\` - Authentication logic
- \`src/api/\` - API routes
- \`src/components/\` - React components
- \`src/database/\` - Database connection and queries

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

## Features
- User authentication with JWT
- REST API
- PostgreSQL database
- React frontend`,
};
