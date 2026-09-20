import { FileNode, ProjectIndex } from './fileSystem';
import { FileMetadata, createFileMetadataSync, extractImports, extractSymbols, countLines } from './projectIndex';

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
            { name: 'LoginForm.tsx', path: 'src/components/LoginForm.tsx', type: 'file', size: 1000, extension: 'tsx' },
          ]
        },
        {
          name: 'database', path: 'src/database', type: 'directory', isExpanded: false,
          children: [
            { name: 'schema.ts', path: 'src/database/schema.ts', type: 'file', size: 1200, extension: 'ts' },
            { name: 'connection.ts', path: 'src/database/connection.ts', type: 'file', size: 1800, extension: 'ts' },
            { name: 'migrations.ts', path: 'src/database/migrations.ts', type: 'file', size: 800, extension: 'ts' },
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

  // Per-file metadata so the search engine (searchProject) can score files.
  // The legacy demo index lacked this map entirely, crashing every AI query.
  const metadata = new Map<string, FileMetadata>();
  for (const node of flatFiles) {
    const meta = createFileMetadataSync(node);
    const content = DEMO_FILE_CONTENTS[node.path];
    if (content && !meta.isSensitive) {
      meta.lineCount = countLines(content);
      meta.imports = extractImports(content, meta.language);
      meta.hasImports = meta.imports.length > 0;
      meta.symbols = extractSymbols(content, meta.language);
    }
    metadata.set(node.path, meta);
  }

  return {
    rootName: 'demo-project',
    totalFiles: flatFiles.length,
    totalDirs,
    totalSize,
    files,
    flatFiles,
    extensions,
    metadata,
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

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const user = await db.users.findByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const isValid = await hashPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    const session = new Session(user.id, rememberMe);
    const token = await session.create();
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

  'src/auth/logout.ts': `import { Session } from './session';
import { db } from '../database/connection';

export async function logoutUser(sessionToken: string): Promise<boolean> {
  const session = await Session.verify(sessionToken);
  if (!session) return false;
  await session.destroy();
  return true;
}`,

  'src/auth/session.ts': `import { db } from '../database/connection';

export class Session {
  constructor(public userId: string, public rememberMe?: boolean) {}

  async create(): Promise<string> {
    return 'jwt-token';
  }

  static async verify(token: string): Promise<Session | null> {
    if (!token) return null;
    return new Session('user-id');
  }

  async refresh(): Promise<string> {
    return this.create();
  }

  async destroy(): Promise<void> {}
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

  'src/api/routes.ts': `import express from 'express';
import { authMiddleware } from '../auth/middleware';
import { getUsers, createUser } from './users';
import { getPosts, createPost } from './posts';
import { getComments, createComment } from './comments';

const router = express.Router();

router.use(authMiddleware);

router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/posts', getPosts);
router.post('/posts', createPost);
router.get('/comments', getComments);
router.post('/comments', createComment);

export default router;`,

  'src/api/users.ts': `import { db } from '../database/connection';

export async function getUsers(limit = 20, offset = 0) {
  const result = await db.query('SELECT id, email, name FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return result.rows;
}

export async function createUser(input: { email: string; name: string; passwordHash: string }) {
  const result = await db.query(
    'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
    [input.email, input.name, input.passwordHash]
  );
  return result.rows[0];
}`,

  'src/api/posts.ts': `import { db } from '../database/connection';

export async function getPosts(limit = 20, offset = 0) {
  return db.posts.findAll(limit, offset);
}

export async function createPost(input: { userId: string; title: string; body: string }) {
  const result = await db.query(
    'INSERT INTO posts (user_id, title, body) VALUES ($1, $2, $3) RETURNING *',
    [input.userId, input.title, input.body]
  );
  return result.rows[0];
}`,

  'src/api/comments.ts': `import { db } from '../database/connection';

export async function getComments(postId: string) {
  const result = await db.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
  return result.rows;
}

export async function createComment(input: { userId: string; postId: string; body: string }) {
  const result = await db.query(
    'INSERT INTO comments (user_id, post_id, body) VALUES ($1, $2, $3) RETURNING *',
    [input.userId, input.postId, input.body]
  );
  return result.rows[0];
}`,

  'src/components/LoginForm.tsx': `import React, { useState } from 'react';
import { loginUser } from '../auth/login';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await loginUser({ email, password });
    if (response.success) {
      // redirect to dashboard
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}`,

  'src/components/Header.tsx': `import React from 'react';

export default function Header({ title }: { title: string }) {
  return <header className="app-header"><h1>{title}</h1></header>;
}`,

  'src/components/Footer.tsx': `import React from 'react';

export default function Footer() {
  return <footer className="app-footer">Demo App</footer>;
}`,

  'src/components/Sidebar.tsx': `import React from 'react';

export default function Sidebar({ items }: { items: string[] }) {
  return (
    <aside className="app-sidebar">
      <nav>{items.map(item => <a key={item} href={'#' + item}>{item}</a>)}</nav>
    </aside>
  );
}`,

  'src/components/Dashboard.tsx': `import React, { useEffect, useState } from 'react';
import { getPosts } from '../api/posts';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  return (
    <div className="dashboard">
      <Header title="Dashboard" />
      <Sidebar items={['Posts', 'Users', 'Comments']} />
      <main>{posts.map(p => <article key={p.id}>{p.title}</article>)}</main>
    </div>
  );
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

  'src/database/schema.ts': `export const USERS_TABLE = 'CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(255), password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())';

export const POSTS_TABLE = 'CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), title VARCHAR(500) NOT NULL, body TEXT, created_at TIMESTAMPTZ DEFAULT NOW())';

export const COMMENTS_TABLE = 'CREATE TABLE comments (id SERIAL PRIMARY KEY, post_id INTEGER REFERENCES posts(id), user_id INTEGER REFERENCES users(id), body TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())';`,

  'src/database/migrations.ts': `import { db } from './connection';
import { USERS_TABLE, POSTS_TABLE, COMMENTS_TABLE } from './schema';

const MIGRATIONS = [
  { name: '001_create_users', sql: USERS_TABLE },
  { name: '002_create_posts', sql: POSTS_TABLE },
  { name: '003_create_comments', sql: COMMENTS_TABLE },
];

export async function runMigrations() {
  for (const migration of MIGRATIONS) {
    await db.query(migration.sql);
    console.log('Applied migration:', migration.name);
  }
}`,

  'src/App.tsx': `import React from 'react';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';

export default function App() {
  const isAuthenticated = false; // auth check omitted
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}`,

  'src/main.tsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);`,

  'src/index.css': `body { margin: 0; font-family: system-ui, sans-serif; }
.app-header { background: #1a1a2e; color: white; padding: 1rem; }
.app-sidebar { width: 220px; background: #16213e; }
.dashboard { display: flex; }`,

  'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>Demo App</title></head>
  <body><div id="root"></div><script src="/src/main.tsx"></script></body>
</html>`,

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

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}`,

  'README.md': `# Demo Project

This is a demo project for testing Universal Local AI Bridge.

## Structure
- src/auth/ - Authentication logic
- src/api/ - API routes
- src/components/ - React components
- src/database/ - Database connection and queries

## Getting Started
npm install
npm run dev

## Features
- User authentication with JWT
- REST API
- PostgreSQL database
- React frontend`,
};
