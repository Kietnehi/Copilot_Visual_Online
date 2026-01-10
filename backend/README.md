# AI Code Repository Copilot - Backend

An intelligent AI-powered copilot that understands your entire codebase using Faiss vector database, Jina embeddings, and Google's Gemini API.

## 🚀 Features

- **Repository Indexing**: Automatically indexes all code files in your repository
- **Semantic Search**: Uses Jina embeddings v3 for understanding code semantically
- **Fast Retrieval**: Powered by Faiss vector database for lightning-fast similarity search
- **Intelligent Responses**: Gemini 2.0 Flash generates context-aware answers
- **Real-time Status**: Track indexing progress in real-time
- **Source Attribution**: See which files were used to generate answers

## 📋 Prerequisites

- Python 3.8 or higher
- Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## 🎯 Usage

### Starting the Server

#### On Windows:
```bash
# From the project root
start_backend.bat
```

#### On Linux/Mac:
```bash
# From the project root
chmod +x start_backend.sh
./start_backend.sh
```

#### Manual Start:
```bash
cd backend
python main.py
```

The server will start at **http://localhost:8000**

API Documentation available at **http://localhost:8000/docs**

### API Endpoints

#### 1. Health Check
```http
GET /
```

#### 2. Index Repository
```http
POST /index
Content-Type: application/json

{
  "repo_path": "C:\\path\\to\\your\\repository"
}
```

#### 3. Check Indexing Status
```http
GET /status
```

#### 4. Query the Copilot
```http
POST /query
Content-Type: application/json

{
  "question": "How does authentication work?",
  "top_k": 5
}
```

#### 5. Load Cached Index
```http
POST /load-cached-index
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│              User interacts with UI                  │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────────────┐
│              FastAPI Backend                         │
│                                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ RepoIndexer  │  │ CodeCopilot │  │ API Routes │ │
│  └──────┬───────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                 │                │        │
└─────────┼─────────────────┼────────────────┼────────┘
          │                 │                │
    ┌─────▼─────┐     ┌─────▼─────┐         │
    │   Faiss   │     │  Gemini   │         │
    │  Vector   │     │    API    │         │
    │ Database  │     │           │         │
    └───────────┘     └───────────┘         │
          ▲                                  │
          │                                  │
    ┌─────┴─────┐                           │
    │   Jina    │                           │
    │Embeddings │◄──────────────────────────┘
    │    v3     │
    └───────────┘
```

## 📁 File Structure

```
backend/
├── main.py              # FastAPI server and endpoints
├── repo_indexer.py      # Repository indexing and Faiss operations
├── code_copilot.py      # Gemini-powered copilot
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── .env                 # Your actual environment variables (create this)
└── cache/               # Cached models and indexes (auto-generated)
    ├── models/          # Jina model cache
    └── index/           # Faiss index and metadata
```

## 🔧 Configuration

### Supported File Types

The indexer processes these file extensions:
- **Languages**: `.py`, `.js`, `.jsx`, `.ts`, `.tsx`, `.java`, `.cpp`, `.c`, `.h`, `.cs`, `.go`, `.rs`, `.rb`, `.php`, `.swift`, `.kt`, `.scala`
- **Web**: `.html`, `.css`, `.scss`, `.sass`, `.vue`
- **Data**: `.json`, `.yaml`, `.yml`, `.xml`, `.sql`
- **Scripts**: `.sh`, `.bat`
- **Docs**: `.md`

### Ignored Folders

These folders are automatically skipped:
- `node_modules`, `.git`, `__pycache__`, `.venv`, `venv`
- `dist`, `build`, `.next`, `cache`, `.cache`, `coverage`

## 💡 How It Works

1. **Indexing Phase**:
   - Scans repository for supported files
   - Chunks code into manageable pieces (500 chars with 50 char overlap)
   - Generates embeddings using Jina v3 model
   - Stores in Faiss index for fast retrieval

2. **Query Phase**:
   - User asks a question
   - Question is embedded using Jina v3
   - Faiss finds top-k most similar code chunks
   - Chunks are sent to Gemini with the question
   - Gemini generates a context-aware response

3. **Caching**:
   - First indexing takes longer (downloads models)
   - Subsequent runs use cached models
   - Indexes can be saved and loaded for instant startup

## 🎨 Customization

### Change Embedding Model

Edit `repo_indexer.py`:
```python
indexer = RepoIndexer(model_name="your-preferred-model")
```

### Adjust Chunk Size

Edit `repo_indexer.py`, `chunk_code()` method:
```python
def chunk_code(self, content: str, chunk_size: int = 1000, overlap: int = 100):
```

### Change Gemini Model

Edit `code_copilot.py`:
```python
self.model = "gemini-2.0-flash-exp"  # or gemini-2.5-pro
```

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution**: Make sure you created `.env` file with your API key

### Issue: Import errors
**Solution**: Install dependencies: `pip install -r requirements.txt`

### Issue: CUDA/GPU errors
**Solution**: The code auto-detects GPU. If issues occur, it falls back to CPU automatically.

### Issue: Out of memory
**Solution**: Reduce `chunk_size` or `batch_size` in `repo_indexer.py`

### Issue: Slow indexing
**Solution**: 
- First run downloads models (~1-2GB) - this is one-time
- Large repos take time - be patient
- Check status endpoint for progress

## 📊 Performance

- **Small repos** (<100 files): 1-2 minutes
- **Medium repos** (100-1000 files): 5-10 minutes
- **Large repos** (1000+ files): 15-30 minutes

*First run includes model download time*

## 🔐 Security

- API key is stored in `.env` (never commit this file!)
- Add `.env` to `.gitignore`
- Backend runs locally on your machine
- No data is sent to external servers except Gemini API calls

## 📝 License

See main project LICENSE file.

## 🤝 Contributing

This copilot is part of the Visual Code Online project. Contributions welcome!

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review server logs in terminal
3. Check browser console for frontend errors
4. Verify API key is correct

---

**Built with** ❤️ using FastAPI, Faiss, Jina AI, and Google Gemini
