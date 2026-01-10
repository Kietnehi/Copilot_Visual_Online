# 🚀 Quick Start Guide - AI Code Copilot

Get your AI Code Copilot up and running in under 5 minutes!

## Prerequisites

Before you begin, make sure you have:

- ✅ Python 3.8 or higher installed
- ✅ Node.js 16+ (for the frontend)
- ✅ A Gemini API key ([Get one free here](https://makersuite.google.com/app/apikey))

## Step 1: Clone the Repository

```bash
git clone https://github.com/Kietnehi/Copilot_Visual_Online.git
cd Copilot_Visual_Online
```

## Step 2: Setup Frontend

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

## Step 3: Setup Backend

### Windows:

```bash
# Navigate to backend directory
cd backend

# Copy environment template
copy .env.example .env

# Edit .env and add your Gemini API key
notepad .env
```

In the `.env` file, replace `your_gemini_api_key_here` with your actual API key:
```
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### Linux/Mac:

```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env  # or use your preferred editor
```

## Step 4: Start Backend Server

### Windows:
```bash
# From project root
start_backend.bat
```

### Linux/Mac:
```bash
# From project root
chmod +x start_backend.sh
./start_backend.sh
```

The backend will start at **http://localhost:8000**

## Step 5: Use the Copilot!

1. **Open the app** at http://localhost:5173
2. **Click the Bot icon** 🤖 in the navbar to open the copilot panel
3. **Index your repository**:
   - Click "Index Repository"
   - Enter path: `C:\path\to\your\code` (or `/path/to/your/code` on Linux/Mac)
   - Wait for indexing to complete (2-5 minutes for medium repos)
4. **Start asking questions**! 💬
   - "What does this project do?"
   - "Where is the authentication handled?"
   - "How do I add a new feature?"

## 🎉 That's It!

You now have a fully functional AI Code Copilot that understands your codebase!

## Quick Tips

### First-Time Indexing
- First run downloads AI models (~1-2GB) - this is one-time
- Indexing creates a cache for faster subsequent runs
- You can close the copilot panel while indexing continues in background

### Best Questions to Ask
- ✅ "How does [feature] work?"
- ✅ "Where should I add [new feature]?"
- ✅ "Explain the purpose of [file/folder]"
- ✅ "What are the main components?"
- ✅ "How is [X] connected to [Y]?"

### Avoid Generic Questions
- ❌ "Tell me about this project" → Instead: "What is the main purpose and architecture of this project?"
- ❌ "How to code?" → Instead: "How do I add authentication to this app?"

## Troubleshooting

### "GEMINI_API_KEY not found"
**Solution**: Make sure you created `.env` file in `backend/` folder with your API key

### Backend won't start
**Solution**: 
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend error: "Cannot connect to backend"
**Solution**: Make sure backend is running on http://localhost:8000

### Slow indexing
**Solution**: This is normal for first run. Models are being downloaded and cached. Subsequent runs will be much faster!

## Need Help?

- 📖 Full documentation: [README.md](../README.md)
- 🔧 Backend details: [backend/README.md](../backend/README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/Kietnehi/Copilot_Visual_Online/issues)

## What's Next?

- Try indexing different repositories
- Ask complex questions about code architecture
- Use the copilot for code reviews
- Let it guide you on where to add new features

Happy coding with your AI assistant! 🚀

---

**Pro Tip**: Keep the copilot panel open while coding. Ask it questions as you work to boost your productivity!
