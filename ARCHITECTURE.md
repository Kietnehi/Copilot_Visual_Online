# 🏗️ Architecture Overview - AI Code Copilot

This document provides a comprehensive technical overview of the AI Code Copilot system architecture.

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                             │
│                   (React + TypeScript Frontend)                     │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐      │
│  │  Editor  │  │ Preview  │  │ Sidebar  │  │ Copilot Panel │      │
│  │  Area    │  │  Panel   │  │          │  │   (Chat UI)   │      │
│  └──────────┘  └──────────┘  └──────────┘  └───────┬───────┘      │
└────────────────────────────────────────────────────┼──────────────┘
                                                      │
                                            HTTP/REST API
                                                      │
┌─────────────────────────────────────────────────────▼──────────────┐
│                       BACKEND SERVER                                │
│                    (FastAPI + Python)                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                     API ENDPOINTS                           │   │
│  │  POST /index  │  GET /status  │  POST /query  │ GET /      │   │
│  └────────┬──────────────┬────────────────┬───────────────────┘   │
│           │              │                │                         │
│  ┌────────▼──────┐  ┌───▼──────┐  ┌──────▼───────┐               │
│  │ RepoIndexer   │  │  Status  │  │ CodeCopilot  │               │
│  │               │  │ Manager  │  │              │               │
│  │ - Scan files  │  │          │  │ - Query AI   │               │
│  │ - Chunk code  │  │          │  │ - Format     │               │
│  │ - Embed       │  │          │  │   response   │               │
│  │ - Index       │  │          │  │              │               │
│  └───────┬───────┘  └──────────┘  └──────┬───────┘               │
│          │                                │                         │
└──────────┼────────────────────────────────┼─────────────────────────┘
           │                                │
           │                                │
    ┌──────▼──────┐                  ┌─────▼──────────┐
    │   Jina AI   │                  │  Gemini API    │
    │ Embeddings  │                  │  (Google AI)   │
    │     v3      │                  │                │
    └──────┬──────┘                  └────────────────┘
           │                                
    ┌──────▼──────┐                        
    │    Faiss    │                        
    │   Vector    │                        
    │  Database   │                        
    └─────────────┘                        
```

## Component Details

### 1. Frontend (React + TypeScript)

#### CopilotPanel Component
```typescript
// Location: src/components/CopilotPanel.tsx

Features:
- Chat-based UI for user interaction
- Real-time status monitoring
- Repository indexing dialog
- Message history with source attribution
- Loading states and animations
```

**Key Responsibilities**:
- Display chat interface
- Send questions to backend
- Show indexing progress
- Display AI responses with sources
- Handle user input and interactions

**State Management**:
- Messages history
- Loading states
- Index status
- Repository path

#### App.tsx Integration
```typescript
Features:
- Toggle copilot panel visibility
- Resizable split pane for copilot
- State management for show/hide
```

### 2. Backend (FastAPI + Python)

#### RepoIndexer (`repo_indexer.py`)

**Purpose**: Index code repositories into searchable vectors

**Key Methods**:
```python
- index_repository(repo_path) -> Dict
- chunk_code(content, chunk_size=500, overlap=50) -> List[str]
- get_embeddings(texts) -> np.ndarray
- search(query, top_k=5) -> List[Tuple]
- save_index() / load_index()
```

**Process Flow**:
1. **Scan**: Walk directory tree, filter supported files
2. **Chunk**: Split files into overlapping 500-char chunks
3. **Embed**: Generate vector embeddings using Jina v3
4. **Index**: Store vectors in Faiss index
5. **Save**: Persist index and metadata to disk

**Optimizations**:
- Batch processing (32 chunks at a time)
- Ignore patterns (node_modules, .git, etc.)
- File size limits (skip files > 1MB)
- GPU acceleration when available

#### CodeCopilot (`code_copilot.py`)

**Purpose**: Generate intelligent responses using Gemini

**Key Methods**:
```python
- generate_response(question, context_chunks) -> str
- _build_context(context_chunks) -> str
- analyze_codebase_structure(file_stats) -> str
- suggest_next_steps(current_task, code_context) -> str
```

**Process Flow**:
1. **Receive**: Get question and relevant code chunks
2. **Format**: Build context with code snippets
3. **Query**: Send to Gemini API with system prompt
4. **Parse**: Extract and format response
5. **Return**: Send answer with source attribution

**Configuration**:
- Model: `gemini-2.0-flash-exp`
- Temperature: 0.7
- Max tokens: 2048
- System prompt: Defines copilot behavior

#### Main Server (`main.py`)

**Purpose**: REST API server with endpoints

**Endpoints**:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/status` | GET | Get indexing status |
| `/index` | POST | Start indexing repository |
| `/query` | POST | Ask question about code |
| `/load-cached-index` | POST | Load saved index |

**Features**:
- Background tasks for indexing
- CORS support for frontend
- Progress tracking
- Error handling
- Async operations

### 3. AI/ML Components

#### Jina Embeddings v3

**Model**: `jinaai/jina-embeddings-v3`

**Purpose**: Convert code text to semantic vectors

**Characteristics**:
- Dense embeddings
- Task-specific: `retrieval.passage`
- Dimension: ~1024 (model dependent)
- Language-agnostic
- Code-optimized

**Why Jina?**:
- ✅ Excellent for code understanding
- ✅ Multi-lingual support
- ✅ High-quality embeddings
- ✅ Optimized for retrieval tasks

#### Faiss Vector Database

**Purpose**: Fast similarity search

**Index Type**: `IndexFlatL2` (L2 distance)

**Why Faiss?**:
- ✅ Extremely fast (millions of vectors/second)
- ✅ Memory efficient
- ✅ CPU and GPU support
- ✅ Battle-tested (Facebook)

**Operations**:
- `add()`: Add vectors to index
- `search()`: Find k-nearest neighbors
- `save/load`: Persistence

#### Google Gemini API

**Model**: `gemini-2.0-flash-exp`

**Purpose**: Generate natural language responses

**Why Gemini?**:
- ✅ Excellent code understanding
- ✅ Fast inference (flash model)
- ✅ Large context window
- ✅ Free tier available
- ✅ High-quality responses

**Configuration**:
```python
{
  'temperature': 0.7,      # Balanced creativity
  'top_p': 0.95,          # Nucleus sampling
  'top_k': 40,            # Top-k sampling
  'max_output_tokens': 2048  # Response length
}
```

## Data Flow

### Indexing Flow

```
User Action: Index Repository
         ↓
Frontend: POST /index {repo_path}
         ↓
Backend: Start background task
         ↓
RepoIndexer:
  1. Scan files → [file1.js, file2.py, ...]
  2. Read content → ["code1", "code2", ...]
  3. Chunk → ["chunk1", "chunk2", ...]
  4. Embed → [[0.1, 0.2...], [0.3, 0.4...], ...]
  5. Index → Faiss.add(embeddings)
  6. Save → cache/index/
         ↓
Frontend: Poll /status → "ready"
```

### Query Flow

```
User Question: "Where is authentication?"
         ↓
Frontend: POST /query {question, top_k}
         ↓
Backend:
  1. RepoIndexer.search(question)
     → Embed question → Query Faiss
     → Get top 5 chunks
  2. CodeCopilot.generate_response()
     → Build context from chunks
     → Query Gemini API
     → Format response
         ↓
Frontend: Display answer + sources
```

## Performance Characteristics

### Indexing Performance

| Repository Size | Files | Time (First Run) | Time (Cached) |
|----------------|-------|------------------|---------------|
| Small (< 100 files) | ~50 | 1-2 min | 5-10 sec |
| Medium (100-1000) | ~500 | 5-10 min | 10-20 sec |
| Large (1000+) | ~2000 | 15-30 min | 20-40 sec |

*First run includes model download (~1-2GB)*

### Query Performance

- **Embedding**: ~50-100ms
- **Faiss Search**: ~1-5ms
- **Gemini API**: ~2-5 seconds
- **Total**: ~2-5 seconds

### Memory Usage

- **Jina Model**: ~2GB RAM
- **Faiss Index**: ~1-5MB per 1000 chunks
- **Backend Process**: ~3-4GB total

## Scalability

### Current Limits

- ✅ **Repositories**: Up to ~10,000 files
- ✅ **Concurrent Users**: Single user (local)
- ✅ **Index Size**: Limited by RAM

### Scaling Options

1. **Horizontal**: Deploy multiple backend instances
2. **Vertical**: Use GPU for faster embedding
3. **Database**: Replace Faiss with Milvus/Pinecone for persistence
4. **Caching**: Add Redis for faster responses

## Security Considerations

### Current Setup

- ✅ Local backend (not exposed to internet)
- ✅ API key in `.env` (gitignored)
- ✅ CORS restricted to localhost
- ❌ No authentication (single user)
- ❌ No rate limiting
- ❌ No input sanitization

### Production Recommendations

If deploying publicly:
1. Add user authentication
2. Implement rate limiting
3. Sanitize inputs
4. Use HTTPS
5. Secure API keys with secrets manager
6. Add request validation
7. Implement logging and monitoring

## File Structure

```
Copilot_Visual_Online/
├── src/
│   ├── components/
│   │   ├── CopilotPanel.tsx       # Chat UI component
│   │   ├── CopilotPanel.css       # Styling
│   │   ├── Navbar.tsx             # Updated with bot icon
│   │   └── ...
│   ├── App.tsx                     # Copilot integration
│   └── ...
├── backend/
│   ├── main.py                     # FastAPI server
│   ├── repo_indexer.py             # Faiss indexing
│   ├── code_copilot.py             # Gemini integration
│   ├── requirements.txt            # Python deps
│   ├── .env.example                # Env template
│   ├── .gitignore                  # Ignore sensitive files
│   ├── README.md                   # Backend docs
│   └── cache/                      # Auto-generated
│       ├── models/                 # Downloaded models
│       └── index/                  # Saved indexes
├── start_backend.bat               # Windows launcher
├── start_backend.sh                # Linux/Mac launcher
├── README.md                       # Main docs
├── QUICKSTART.md                   # Getting started
└── ARCHITECTURE.md                 # This file
```

## Technology Choices Rationale

### Why React?
- ✅ Component-based architecture
- ✅ Excellent TypeScript support
- ✅ Rich ecosystem
- ✅ Already used in main app

### Why FastAPI?
- ✅ Modern Python web framework
- ✅ Async support
- ✅ Auto-generated API docs
- ✅ Type hints integration
- ✅ Fast performance

### Why Faiss?
- ✅ Industry standard for vector search
- ✅ Extremely fast
- ✅ Well-tested
- ✅ Easy to use
- ✅ Free and open-source

### Why Jina v3?
- ✅ State-of-the-art embeddings
- ✅ Optimized for code
- ✅ Better than generic models
- ✅ Easy integration

### Why Gemini?
- ✅ Excellent at understanding code
- ✅ Free tier available
- ✅ Fast (flash model)
- ✅ Large context window
- ✅ High-quality responses

## Future Enhancements

### Short-term
- [ ] Incremental indexing (update without full reindex)
- [ ] Multiple repository support
- [ ] Conversation history persistence
- [ ] Export chat logs
- [ ] Keyboard shortcuts for copilot

### Medium-term
- [ ] Multi-modal: code + diagrams
- [ ] Fine-tuned embeddings for specific languages
- [ ] Code generation capabilities
- [ ] Integration with git history
- [ ] Collaborative features

### Long-term
- [ ] VS Code extension
- [ ] Self-hosted cloud deployment
- [ ] Multi-user support
- [ ] Enterprise features
- [ ] Advanced analytics

## Troubleshooting Architecture

### Common Issues

**Q: Why is indexing slow?**
A: Models download on first run (~1-2GB). Subsequent runs use cache.

**Q: Why do responses take 3-5 seconds?**
A: Gemini API call takes most time. Consider caching common questions.

**Q: Can I use a different LLM?**
A: Yes! Modify `code_copilot.py` to use OpenAI, Claude, or local models.

**Q: Can I use a different embedding model?**
A: Yes! Change `model_name` in `RepoIndexer.__init__()`.

**Q: How to reduce memory usage?**
A: Use smaller chunk sizes, reduce batch size, or use quantized models.

## Contributing

To add new features:

1. **Frontend**: Add to `CopilotPanel.tsx`
2. **Backend**: Add endpoints to `main.py`
3. **AI Logic**: Modify `code_copilot.py`
4. **Indexing**: Update `repo_indexer.py`

Always update this architecture doc when making significant changes!

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained by**: Truong Phu Kiet
