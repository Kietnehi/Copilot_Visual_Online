# 🚀 Visual Code Online

A powerful, feature-rich **online code editor** inspired by Visual Studio Code. Build your web projects entirely in the browser with live preview, multi-file support, and professional developer tools.
<p align="center">
  <img src="src/output.gif" alt="Visual Code Online Demo" width="80%" />
</p>

![Visual Code Online](https://img.shields.io/badge/VS%20Code-Online-blue?style=for-the-badge&logo=visual-studio-code)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-0066B8?style=for-the-badge)

## ✨ Features

### 🎨 **Professional Code Editor**
- **Monaco Editor** - The same editor that powers VS Code
- **Syntax highlighting** for HTML, CSS, JavaScript, TypeScript, JSON, and Markdown
- **IntelliSense** - Smart code completion and suggestions
- **Multi-cursor editing** - Edit multiple locations simultaneously
- **Code formatting** - Auto-format on paste and type

### 📁 **File Management**
- **Hierarchical file tree** - Organize files and folders like VS Code
- **Create/Delete/Rename** - Full file system operations
- **Drag and drop** support (coming soon)
- **Search files** - Quickly find files in your project
- **Context menu** - Right-click for quick actions

### 📑 **Multi-Tab Support**
- **Open multiple files** simultaneously
- **Tab switching** with keyboard shortcuts (Ctrl+Tab)
- **Dirty state tracking** - See unsaved changes at a glance
- **Middle-click to close** tabs
- **Tab persistence** - Tabs survive page refresh

### 👁️ **Live Preview**
- **Real-time rendering** - See changes instantly
- **Automatic HTML/CSS/JS injection**
- **Refresh preview** manually when needed
- **Open in new tab** - Test in full browser window
- **Fullscreen mode** - Immersive preview experience

### 💾 **Auto-Save**
- **Automatic saving** with configurable delay
- **Manual save** with Ctrl+S
- **Save all** files at once
- **Dirty indicator** shows unsaved changes
- **LocalStorage persistence** - Never lose your work

### 🎭 **Theme Customization**
- **Dark theme** - Easy on the eyes (default)
- **Light theme** - For daytime coding
- **Synchronized themes** - Editor and UI match
- **Persistent preference** - Remember your choice

### ⚙️ **Editor Settings**
- **Font customization** - Choose from 6+ monospace fonts
- **Font size** - Adjustable from 10px to 24px
- **Tab size** - Configure indentation (2-8 spaces)
- **Word wrap** - Toggle line wrapping
- **Minimap** - Bird's eye view of your code
- **Line numbers** - Toggle visibility

### 📦 **Project Management**
- **Multiple projects** - Work on several projects
- **Download as ZIP** - Export entire project
- **Import projects** (coming soon)
- **Project templates** - Start with sample code

### 🤖 **AI Code Copilot** ⭐ NEW!
- **Repository Understanding** - AI that comprehends your entire codebase
- **Semantic Search** - Powered by Faiss vector database and Jina embeddings v3
- **Intelligent Responses** - Google Gemini API generates context-aware answers
- **Ask Anything** - "Where is authentication handled?", "How do I add a feature?", etc.
- **Source Attribution** - See which files were used for each answer
- **Real-time Indexing** - Track progress as your repo is being indexed
- **Next Steps Suggestion** - Get actionable guidance on what to code next

### ⌨️ **Keyboard Shortcuts**
- `Ctrl+S` - Save all files
- `Ctrl+W` - Close active tab
- `Ctrl+N` - New file
- `Esc` - Close modals
- `Right-click` - Context menu

## 📸 Application Interface Preview

<p align="center">
  Below are screenshots from the <code>src/image</code> folder, showcasing the core features of <b>Visual Code Online</b>.
</p>

---
<div align="center">
  <h1>AI Code Copilot Architecture</h1>
  <img src="src/image/architecture.png" alt="AI Code Copilot Architecture" width="800">
  <p><i>Comprehensive architecture of the AI-powered coding assistant</i></p>
</div>

---

## 🛠 System Overview

### 1. Frontend (React + TypeScript)
- **Monaco Editor:** High-performance code editor for a seamless coding experience.
- **Chat UI:** Interactive interface for user-AI communication.
- **Communication:** Connects to the backend via **HTTP/REST** protocols.

### 2. Backend API (FastAPI + Python)
- **RepoIndexer:** Responsible for scanning and processing the repository structure.
- **CodeCopilot (Orchestrator):** The core engine that routes requests and manages logic.
- **Endpoints:**
    - `/api/chat`: Handles conversational AI interactions.
    - `/api/code/complete`: Provides intelligent code autocompletion.
    - `/api/index/repo`: Manages the repository indexing workflow.

### 3. AI/ML Layer
- **Jina Embeddings v3:** Converts code and text into high-dimensional vectors.
- **Faiss Vector DB:** Efficiently stores and performs **Semantic Search** to find relevant code context.
- **Google Gemini API:** State-of-the-art LLM used for reasoning, code generation, and explanations.

---

<div align="center">
  <h3>🔄 Core Workflow</h3>
</div>

1. **Indexing:** Source code is processed by `RepoIndexer`, vectorized via `Jina`, and stored in `Faiss`.
2. **Retrieval:** When a user asks a question, the system performs a semantic search in `Faiss` to retrieve the most relevant code snippets.
3. **Generation:** `Gemini` processes the user's query along with the retrieved context to generate accurate and context-aware responses.

---

### 🖥️ 1. Main Interface & Live Preview

<p align="center">
  <img src="src/image/frontend.png" alt="Main Interface & Live Preview" width="80%">
</p>

<p align="center">
  <i>
    This screenshot shows the primary workspace of <b>Visual Code Online</b>.
    The layout uses a split-screen design:
    the left panel is a code editor (currently editing <code>script.js</code> with syntax highlighting),
    while the right panel displays a real-time <b>Live Preview</b>.
    Any code changes are instantly reflected in the preview,
    demonstrating a styled UI with a gradient background and interactive button.
  </i>
</p>

---

### ⚙️ 2. Editor Settings Modal

<p align="center">
  <img src="src/image/frontend2.png" alt="Editor Settings Modal" width="80%">
</p>

<p align="center">
  <i>
    The <b>Editor Settings</b> modal allows users to fully customize their coding experience.
    Available options include Editor Theme (Light mode shown),
    Font Family (JetBrains Mono), Font Size, and Tab Size.
    Additional toggles enable or disable Word Wrap, Minimap, Line Numbers,
    and Auto Save for improved productivity.
  </i>
</p>


---

### 🎉 3. Welcome Screen & Quick Tips

<p align="center">
  <img src="src/image/frontend3.png" alt="Welcome Screen & Quick Tips" width="80%">
</p>

<p align="center">
  <i>
    This image displays the Welcome (Empty State) screen when no file is selected.
    A clean and friendly interface greets the user with
    <b>“Welcome to Visual Code Online!”</b>.
    The <b>Quick Tips</b> section provides helpful shortcuts,
    including theme toggling, enabling live preview,
    right-click actions, and project download instructions.
  </i>
</p>

### 💬 4. AI Chat Interface

<p align="center">
  <img src="src/image/copilotmini.png" alt="AI Code Copilot Chat UI" width="450">
</p>

<p align="center">
  <i>
    The intuitive <b>Chat Interface</b> provides quick action suggestions such as 
    "What does this project do?" or "Explain the file structure". 
    It leverages the AI layer to provide context-aware answers directly from your codebase.
  </i>
</p>

---

### 🤖 5. Response AI Visual AI Copilot ONLINE

<p align="center">
  <img src="src/image/result.png" alt="Result 1" width="45%" style="margin:10px;">
  <img src="src/image/result1.png" alt="Result 2" width="45%" style="margin:10px;">
</p>
<p align="center">
  <img src="src/image/result2.png" alt="Result 3" width="45%" style="margin:10px;">
  <img src="src/image/result3.png" alt="Result 4" width="45%" style="margin:10px;">
</p>


<p align="center">
  <i>
    The <b>AI Copilot</b> in action within the integrated development environment. 
    It provides real-time, context-aware assistance by analyzing the project's files 
    (such as <code>index.html</code>, <code>style.css</code>, and <code>script.js</code>). 
    As shown, the AI can suggest specific CSS modifications and provide code snippets 
    to help users customize their UI instantly.
  </i>
</p>

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **TypeScript 5.9** - Type-safe development
- **Monaco Editor** - Professional code editing
- **Vite** - Lightning-fast build tool
- **JSZip** - Project export functionality
- **Lucide React** - Beautiful icon library

### Backend (AI Copilot)
- **FastAPI** - Modern Python web framework
- **Faiss** - Facebook's vector similarity search
- **Jina AI v3** - State-of-the-art embeddings model
- **Google Gemini 2.0** - Advanced LLM for code understanding
- **Python 3.8+** - Backend runtime

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

```

### Development

The app will be available at `http://localhost:5173`

## 📖 Usage Guide

### Creating Files and Folders

1. **New File**: Click the file+ icon in the sidebar or press `Ctrl+N`
2. **New Folder**: Click the folder+ icon
3. **Inside Folder**: Right-click a folder → New File/Folder

### Opening Files

- Click any file in the sidebar to open it in a new tab
- Files open in the Monaco Editor with syntax highlighting

### Editing Code

- Type normally - IntelliSense will suggest completions
- Use `Ctrl+Space` for manual completion
- Format code with `Shift+Alt+F`
- Multi-cursor: `Alt+Click`

### Live Preview

1. Toggle preview panel with the eye icon
2. Preview updates automatically as you code
3. Click refresh to force re-render
4. Open in new tab for full-browser testing

### Managing Projects

- **Download**: Click download icon to get ZIP
- **New Project**: Click menu icon → Create new
- **Switch Projects**: (Coming soon)

### Customizing Settings

1. Click the settings icon
2. Configure:
   - Theme (Dark/Light)
   - Font family and size
   - Editor preferences
   - Auto-save settings
3. Click "Save Settings"

### Context Menu Actions

Right-click any file/folder for:
- Rename
- Duplicate (files only)
- Download
- Delete
- New File (folders only)
- New Folder (folders only)

### Using the AI Copilot

The AI Copilot helps you understand and navigate your codebase using advanced AI.

#### Setup (First Time):

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a free API key
   - Copy the key

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and paste your API key
   ```

3. **Start Backend Server**:
   ```bash
   # Windows
   start_backend.bat
   
   # Linux/Mac
   chmod +x start_backend.sh
   ./start_backend.sh
   ```

#### Using the Copilot:

1. **Open Copilot Panel**:
   - Click the Bot 🤖 icon in the navbar
   - The copilot panel opens on the right side

2. **Index Your Current Project**:
   - Click the status badge that says "Not indexed - Click to start"
   - The Copilot will automatically index all files in your current project
   - No need to enter paths or URLs - it reads directly from the editor!
   - Wait for indexing to complete (usually takes a few seconds)

3. **Ask Questions**:
   - Type your question in the chat input
   - Examples:
     - "What does this project do?"
     - "Where is the authentication logic?"
     - "How do I add a new component?"
     - "Explain the file structure"
     - "What technologies are used?"
   
4. **Get Answers**:
   - AI analyzes relevant code chunks
   - Provides detailed, context-aware responses
   - Shows source files used for the answer
   - Suggests next steps and where to add code

#### Copilot Tips:

- ✅ **Be specific**: "How does user login work?" vs "Tell me about users"
- ✅ **Ask for guidance**: "How do I add a dark mode toggle?"
- ✅ **Request explanations**: "Explain what App.tsx does"
- ✅ **Get locations**: "Where should I add error handling?"

#### Supported Languages:

The copilot understands:
- JavaScript, TypeScript, React, Vue
- Python, Java, C++, C#, Go, Rust
- HTML, CSS, SCSS
- JSON, YAML, Markdown
- And many more!

See [backend/README.md](backend/README.md) for detailed documentation.

## 🎯 Features in Detail

### Auto-Save System

Files are automatically saved after you stop typing for a configurable delay (default: 1000ms). You can:
- Enable/disable auto-save in settings
- Adjust the delay (500ms - 5000ms)
- Manual save with `Ctrl+S`

### LocalStorage Persistence

Your entire workspace is saved to browser storage:
- All projects and files
- Open tabs and active file
- Editor settings
- Theme preference

**Note**: Clear browser data will erase projects. Export important work!

### Live Preview Technology

The preview uses an iframe with automatic code injection:
1. Finds your `index.html`
2. Inlines all CSS from `<link>` tags
3. Inlines all JS from `<script>` tags
4. Renders in sandboxed iframe

### File Type Detection

Automatic language detection based on extension:
- `.html` → HTML
- `.css` → CSS
- `.js`, `.jsx` → JavaScript
- `.ts`, `.tsx` → TypeScript
- `.json` → JSON
- `.md` → Markdown

## 🎨 Default Project

First-time users get a beautiful sample project featuring:
- Gradient background
- Interactive button
- Modern glassmorphism design
- Organized file structure
- Best practices demonstrated

## 🔒 Security

- **Sandboxed iframes** - Safe code execution
- **No server-side code** - Pure client-side app
- **LocalStorage only** - Data stays in your browser
- **No external requests** - Complete privacy

## 🌐 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📱 Responsive Design

- **Desktop-first** - Optimized for coding
- **Tablet support** - Works on iPad
- **Mobile** - Limited (not recommended for coding)

## 🚧 Roadmap

- [ ] Drag-and-drop file upload
- [ ] Import ZIP projects
- [ ] Git integration
- [ ] Collaborative editing
- [ ] React/Vue component preview
- [ ] NPM package installation
- [ ] Terminal integration
- [ ] Extensions system
- [ ] Project templates library
- [ ] Export to GitHub

## 💡 Tips & Tricks

### Performance
- Close unused tabs to save memory
- Disable minimap for small files
- Use word wrap for long lines

### Workflow
- Use keyboard shortcuts for speed
- Enable auto-save for peace of mind
- Download projects regularly as backup

### Customization
- Try different fonts to find your favorite
- Adjust font size for comfort
- Use dark theme to reduce eye strain

## 🐛 Troubleshooting

### Preview not updating?
- Click the refresh button
- Check if you have `index.html`
- Verify file paths in HTML

### Lost your work?
- Check if browser data was cleared
- Enable auto-save in settings
- Download projects as backup

### Editor feels slow?
- Close unused tabs
- Reduce file size
- Disable minimap

### Settings not saving?
- Check LocalStorage is enabled
- Ensure browser allows storage
- Try different browser

## 📄 License

MIT License - Feel free to use for personal or commercial projects!

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's excellent web editor
- **VS Code** - Inspiration for UI and features
- **React Team** - Amazing framework
- **Vite** - Blazing fast build tool

## 📞 Support

Found a bug? Have a feature request?
- Open an issue on GitHub
- Star the repo if you like it!

---

**Built with ❤️ using React + TypeScript + Monaco Editor**

## 🔗 Author's GitHub

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header"/>

<p align="center">
  <a href="https://github.com/Kietnehi">
    <img src="https://github.com/Kietnehi.png" width="140" height="140" style="border-radius: 50%; border: 4px solid #A371F7;" alt="Avatar Truong Phu Kiet"/>
  </a>
</p>

<h3>🚀 Truong Phu Kiet</h3>

<a href="https://github.com/Kietnehi">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=236AD3&background=00000000&center=true&vCenter=true&width=435&lines=Student+@+Sai+Gon+University;Fullstack+Dev+%26+AI+Researcher;Copilot+Visual+Online" alt="Typing SVG" />
</a>


<br/><br/>

<p align="center">
  <img src="https://img.shields.io/badge/SGU-Sai_Gon_University-0056D2?style=flat-square&logo=google-scholar&logoColor=white" alt="SGU"/>
  <img src="https://img.shields.io/badge/Base-Ho_Chi_Minh_City-FF4B4B?style=flat-square&logo=google-maps&logoColor=white" alt="HCMC"/>
</p>

<h3>🛠 Tech Stack</h3>
<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=docker,python,react,nodejs,mongodb,git,fastapi,pytorch&theme=light" alt="My Skills"/>
  </a>
</p>

<br/>

<h3>🌟 Copilot Visual Online</h3>
<p align="center">
  <a href="https://github.com/Kietnehi/FaceRecognition_WEB">
    <img src="https://img.shields.io/github/stars/Kietnehi/Copilot_Visual_Online?style=for-the-badge&color=yellow" alt="Stars"/>
    <img src="https://img.shields.io/github/forks/Kietnehi/Copilot_Visual_Online?style=for-the-badge&color=orange" alt="Forks"/>
    <img src="https://img.shields.io/github/issues/Kietnehi/Copilot_Visual_Online?style=for-the-badge&color=red" alt="Issues"/>
  </a>
</p>
<!-- Dynamic quote -->
<p align="center">
  <img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=dark" alt="Daily Quote"/>
</p>
<p align="center">
  <i>Thank you for visiting! Don’t forget to click <b>⭐️ Star</b> to support the project.</i>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer"/>

</div>

