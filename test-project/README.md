# Test Project for ULAB Phase 2

This is a realistic test project for testing the Smart Context Engine and AI Coding Workspace.

## Project Structure

```
test-project/
├── src/
│   ├── api/
│   │   └── routes.ts          # API routes with authentication
│   ├── auth/
│   │   ├── login.ts           # Login implementation
│   │   └── session.ts         # Session management
│   ├── app.ts                 # Main application
│   └── utils.ts               # Utility functions
├── tests/
│   └── app.test.ts            # Application tests
├── .env                       # Environment variables (sensitive)
├── .env.local                 # Local environment (sensitive)
├── credentials.json           # Credentials (sensitive)
├── private.key                # Private key (sensitive)
├── package.json               # Package configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Features

- **Authentication**: Login/logout with session management
- **API Routes**: RESTful API endpoints
- **TypeScript**: Full TypeScript implementation
- **Tests**: Unit tests for core functionality

## Testing Scenarios

### Should Work
- ✅ Read `src/app.ts`
- ✅ Read `src/auth/login.ts`
- ✅ Read `src/api/routes.ts`
- ✅ Search for "auth"
- ✅ Search for "login"
- ✅ Search for "session"
- ✅ List all files
- ✅ Build context for "Where is authentication?"

### Should Be Blocked
- ❌ Read `.env` (sensitive)
- ❌ Read `.env.local` (sensitive)
- ❌ Read `credentials.json` (sensitive)
- ❌ Read `private.key` (sensitive)
- ❌ Access `../../outside.txt` (path traversal)
- ❌ Access `C:\Windows\System32` (outside project)

## Context Engine Testing

### Question: "Where is authentication implemented?"

**Expected Results:**
1. `src/auth/login.ts` - High relevance (exact match)
2. `src/auth/session.ts` - High relevance (related)
3. `src/api/routes.ts` - Medium relevance (imports auth)
4. `src/app.ts` - Low relevance (general app file)

### Question: "How does the API handle login?"

**Expected Results:**
1. `src/api/routes.ts` - High relevance (API routes)
2. `src/auth/login.ts` - High relevance (login implementation)
3. `src/auth/session.ts` - Medium relevance (session management)

## Notes

- All sensitive files contain FAKE test data only
- Never use real credentials in test projects
- This project is for testing ULAB security features
- The project structure mimics a real TypeScript application
