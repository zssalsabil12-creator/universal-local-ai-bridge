# 📦 Universal Local AI Bridge (ULAB) - Installation & Usage Guide

## 🎉 Welcome!

Thank you for downloading Universal Local AI Bridge. This guide will help you get started quickly.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
Open Terminal or Command Prompt in this folder and run:
```bash
npm install
```

### Step 2: Run the Application
```bash
node start.js
```

### Step 3: Open Browser
The app will open automatically at: **http://localhost:5173**

Or manually open your browser and go to: **http://localhost:5173**

---

## 📖 How to Use

### 1. Select Your Project
- Click **"Select Project"** in the app
- Choose your project folder
- Wait for indexing to complete (a few seconds for small projects, longer for large ones)

### 2. Ask Questions
Type your question in the search box. Examples:
- "Where is authentication handled?"
- "How is the database accessed?"
- "Where are the UI components?"
- "Find all API endpoints"

### 3. Review Results
- ULAB will show relevant files
- It will explain why each file was selected
- You can click on files to view their content

### 4. Use the Context
- Click **"Copy Context"**
- Paste into ChatGPT, Gemini, or any AI chatbot
- Get accurate answers based on your actual project

---

## 🔧 Troubleshooting

### Node.js Not Installed?
Download from: https://nodejs.org/
You need version 18 or higher.

Check your version:
```bash
node --version
```

### Port 5173 is Busy?
Use a different port:
```bash
npm run dev -- --port 3000
```

Then open: **http://localhost:3000**

### Dependencies Won't Install?
Clean and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### App Doesn't Start?
Check for errors in the terminal output. Common issues:
- Node.js not installed
- Port already in use
- Missing dependencies

---

## 📚 Documentation Files

- **START_HERE.md** - Quick start guide (read this first!)
- **README.md** - Main documentation
- **USER_GUIDE.md** - Complete user guide
- **SECURITY.md** - Security information
- **PRIVACY.md** - Privacy policy
- **TROUBLESHOOTING.md** - Common issues and solutions

---

## 🆘 Need Help?

- **Documentation**: Read the files listed above
- **Issues**: https://github.com/yourusername/ulab/issues
- **Discussions**: https://github.com/yourusername/ulab/discussions

---

## 🎉 Enjoy ULAB!

**Privacy First, Local Always** 🚀

---

Universal Local AI Bridge (ULAB) v1.0.0
Open source under MIT License
