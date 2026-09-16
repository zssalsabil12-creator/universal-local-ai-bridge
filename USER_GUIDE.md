# User Guide

Welcome to Universal Local AI Bridge (ULAB)! This guide will help you get started and make the most of ULAB's features.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [First Project](#first-project)
3. [Building Context](#building-context)
4. [Working with AI](#working-with-ai)
5. [Reviewing Changes](#reviewing-changes)
6. [Executing Commands](#executing-commands)
7. [Git Integration](#git-integration)
8. [Advanced Features](#advanced-features)
9. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Opening ULAB

1. **Click the ULAB icon** in your Chrome toolbar
2. The **Side Panel** opens on the right side of your browser
3. You'll see the main interface with several sections

### Connecting to Local Agent

1. Click the **"Connect Agent"** button
2. Wait for the status to change to **"Connected"** (green indicator)
3. If connection fails, see [Troubleshooting](#troubleshooting)

### Interface Overview

The ULAB interface has several sections:

- **Project** - Current project information
- **Search** - Search your project files
- **Context** - Build and manage context packages
- **AI** - AI provider selection and status
- **Task** - Current task and progress
- **Execution** - Run tests, builds, and commands
- **Git** - Git status and operations
- **Memory** - Project memory and notes

---

## First Project

### Selecting a Project

1. Click **"Select Project"** button
2. Navigate to your project folder
3. Click **"Select Folder"**
4. ULAB will start indexing your project

### Understanding Project Indexing

ULAB analyzes your project to understand:
- File structure and organization
- Programming languages used
- Configuration files
- Test files
- Dependencies and imports

**Indexing Time**:
- Small projects (< 100 files): 1-2 seconds
- Medium projects (100-1000 files): 5-10 seconds
- Large projects (1000+ files): 30-60 seconds

### Project Overview

After indexing, you'll see:
- **Project Name**: Your project folder name
- **File Count**: Total number of indexed files
- **Languages**: Detected programming languages
- **Configuration**: Found config files (package.json, tsconfig.json, etc.)
- **Test Files**: Number of test files detected

---

## Building Context

### What is Context?

Context is the information ULAB sends to the AI to help it understand your project. Instead of sending the entire project, ULAB intelligently selects relevant files.

### Automatic Context Building

1. **Ask a question** in the search box:
   - "Why is authentication failing?"
   - "How does the API handle errors?"
   - "Where are the database models?"

2. **ULAB analyzes** your question and finds relevant files

3. **Review the selection**:
   - See which files were selected
   - Understand why each file was chosen
   - Add or remove files as needed

### Manual Context Building

1. **Browse files** in the file tree
2. **Select files** by clicking on them
3. **Pin important files** (always include):
   - Click the pin icon next to a file
   - Pinned files are always included in context
4. **Build context package**:
   - Click "Build Context"
   - Review the selected files
   - Save as a reusable package

### Context Packages

Save frequently used context as packages:

1. Build your context
2. Click **"Save as Package"**
3. Give it a name (e.g., "Authentication Debugging")
4. Add a description
5. Click **"Save"**

**Using Packages**:
- Load saved packages with one click
- Edit packages to add/remove files
- Delete packages you no longer need

---

## Working with AI

### Generic Mode (Works with Any AI)

Generic Mode is the core feature that works with any web-based AI:

1. **Build context** in ULAB
2. **Copy context** to clipboard
3. **Open your AI chatbot** (ChatGPT, Gemini, etc.)
4. **Paste context** into the chat
5. **Ask your question**
6. **Review AI response**

### Provider Adapters

ULAB includes adapters for specific providers:

#### ChatGPT
- Navigate to chat.openai.com
- ULAB detects ChatGPT automatically
- Use "Send to ChatGPT" button
- Context is formatted for ChatGPT

#### Gemini
- Navigate to gemini.google.com
- ULAB detects Gemini automatically
- Use "Send to Gemini" button
- Context is formatted for Gemini

#### DeepSeek
- Navigate to chat.deepseek.com
- ULAB detects DeepSeek automatically
- Use "Send to DeepSeek" button
- Context is formatted for DeepSeek

### AI Response Handling

When the AI responds:

1. **Copy the response** from the AI chatbot
2. **Paste into ULAB** (if using automatic detection)
3. **ULAB parses** the response
4. **Proposed changes** are shown as diffs

---

## Reviewing Changes

### Understanding Diffs

ULAB shows changes in a clear diff format:

```
- Old line (removed)
+ New line (added)
  Unchanged line (context)
```

### Review Process

1. **See proposed changes** in the Changes section
2. **Review each file**:
   - Click on a file to see the diff
   - Understand what changed and why
3. **Approve or reject**:
   - Click "Approve" for changes you want
   - Click "Reject" for changes you don't want
   - You can approve some files and reject others

### Stale Patch Detection

If a file changed after the AI generated the patch:

1. ULAB detects the file is **stale**
2. Shows a warning: "File has changed since patch was generated"
3. **Options**:
   - Regenerate the patch with fresh context
   - Manually review and apply changes
   - Skip this file

### Applying Changes

After approval:

1. Click **"Apply Changes"**
2. ULAB creates a **rollback snapshot**
3. Changes are applied to your files
4. Verification runs automatically

---

## Executing Commands

### Quick Actions

ULAB provides quick buttons for common operations:

- **Test** - Run project tests
- **Build** - Build the project
- **Typecheck** - Run TypeScript type checking
- **Lint** - Run code linter

### Execution Workflow

1. **Click a quick action** (e.g., "Test")
2. **ULAB detects** the command from your project
3. **Shows approval dialog**:
   - Command to run
   - Working directory
   - Risk level
4. **Approve** the execution
5. **View results**:
   - Exit code
   - Output (stdout/stderr)
   - Duration
   - Status (pass/fail)

### Available Commands

ULAB detects commands from your project:

#### JavaScript/TypeScript Projects
- `npm test` - Run tests
- `npm run build` - Build project
- `npm run lint` - Run linter
- `npm run typecheck` - Type checking

#### Git Commands
- `git status` - Show status
- `git diff` - Show changes
- `git log` - Show commit history

### Risk Levels

Commands are classified by risk:

- **Low Risk** (auto-approved):
  - `git status`, `git diff`, `git log`
  - Read-only operations

- **Medium Risk** (auto-approved):
  - `npm test`, `npm run build`
  - Project-specific commands

- **High Risk** (requires approval):
  - `git commit`, `git checkout`
  - `npm install`
  - File modifications

- **Critical Risk** (blocked):
  - Arbitrary shell commands
  - System-wide operations
  - Sensitive file access

---

## Git Integration

### Viewing Git Status

The Git section shows:
- **Current branch**
- **Modified files** (unstaged changes)
- **Staged files** (ready to commit)
- **Untracked files** (new files)

### Creating Commits

1. **Review changes** in Git status
2. **Click "Create Commit"**
3. **ULAB validates**:
   - No sensitive files included
   - All changes are intentional
4. **Enter commit message**
5. **Approve the commit**
6. **Commit is created**

**Important**: ULAB never commits automatically. You must explicitly approve each commit.

### Sensitive File Protection

ULAB prevents committing sensitive files:
- `.env` files
- `.key` files
- `credentials.json`
- Private keys
- Authentication configs

If you try to commit a sensitive file:
- ULAB shows a warning
- Commit is blocked
- You must remove the file from staging

---

## Advanced Features

### Project Memory

Store project-specific information:

1. **Add memory entries**:
   - Rules (e.g., "Use TypeScript strict mode")
   - Conventions (e.g., "Always write tests")
   - Architecture notes
   - Important decisions
   - User preferences

2. **Memory is included** in context automatically
3. **Filter by type** to find specific memories
4. **Edit or delete** memories as needed

### Import Graph

Visualize file dependencies:

1. **Select a file** in the file tree
2. **View import graph**:
   - Forward dependencies (files this file imports)
   - Backward dependencies (files that import this file)
3. **Adjust depth** to see more/fewer levels
4. **Click files** to navigate

### Rollback

If something goes wrong:

1. **Open Rollback section**
2. **See available snapshots**:
   - Task ID
   - Timestamp
   - Affected files
3. **Click "Rollback"**
4. **Confirm rollback**
5. **Files are restored** to previous state

### Operation Log

View all operations:

1. **Open Operation Log**
2. **See all executed operations**:
   - Command execution
   - File modifications
   - Git operations
   - Timestamps
   - Results

---

## Tips & Best Practices

### Context Building

✅ **Do**:
- Start with a clear question
- Review selected files carefully
- Pin important configuration files
- Save frequently used contexts as packages

❌ **Don't**:
- Send the entire project
- Include sensitive files
- Forget to review diffs

### Working with AI

✅ **Do**:
- Be specific in your questions
- Provide enough context
- Review AI suggestions carefully
- Test changes after applying

❌ **Don't**:
- Trust AI suggestions blindly
- Apply changes without review
- Skip verification steps

### Security

✅ **Do**:
- Review all changes before applying
- Use rollback when needed
- Keep sensitive files out of Git
- Regularly review operation log

❌ **Don't**:
- Approve high-risk operations without understanding
- Commit sensitive files
- Ignore stale patch warnings

### Performance

✅ **Do**:
- Let indexing complete before searching
- Use context packages for repeated tasks
- Clear operation log periodically

❌ **Don't**:
- Index multiple large projects simultaneously
- Keep too many context packages
- Ignore performance warnings

---

## Troubleshooting

### Common Issues

**Issue: "Agent not connected"**
- Solution: Check if Local Agent is running
- Run: `tasklist | findstr ulab-agent`
- Restart Local Agent if needed

**Issue: "Context not building"**
- Solution: Wait for indexing to complete
- Check project is properly selected
- Try rebuilding context

**Issue: "Changes not applying"**
- Solution: Check file permissions
- Verify no stale patches
- Check operation log for errors

**Issue: "Tests failing after changes"**
- Solution: Review the changes carefully
- Use rollback if needed
- Check test output for details

---

## Next Steps

Now that you know the basics:

1. **Try your first project**
2. **Build some context**
3. **Work with your favorite AI**
4. **Review and apply changes**
5. **Explore advanced features**

---

## Support

Need help?

- **Documentation**: Check the docs folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/ulab/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ulab/discussions)

---

**Happy coding with ULAB!**
