"""
FastAPI Server for Code Repository Copilot
"""
import os
import asyncio
from pathlib import Path
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from repo_indexer import RepoIndexer
from code_copilot import CodeCopilot

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Code Repository Copilot API",
    description="AI-powered code assistant for understanding and navigating repositories",
    version="1.0.0"
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
indexer: Optional[RepoIndexer] = None
copilot: Optional[CodeCopilot] = None
indexing_status: Dict = {
    "status": "not_started",  # not_started, indexing, ready, error
    "progress": 0,
    "message": "",
    "stats": {}
}

# Request/Response models
class FileContent(BaseModel):
    path: str
    content: str
    extension: str

class IndexFilesRequest(BaseModel):
    files: List[FileContent]
    project_name: str = "Visual Code Online Project"

class IndexRequest(BaseModel):
    repo_path: str

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    relevant_chunks: List[Dict]
    sources: List[str]

class StatusResponse(BaseModel):
    status: str
    progress: int
    message: str
    stats: Dict

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Code Repository Copilot",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/status", response_model=StatusResponse)
async def get_status():
    """Get indexing status"""
    return indexing_status

@app.post("/index")
async def index_repository(request: IndexRequest, background_tasks: BackgroundTasks):
    """
    Index a code repository
    This operation runs in the background
    """
    global indexer, copilot, indexing_status
    
    # Validate repo path
    repo_path = Path(request.repo_path)
    if not repo_path.exists():
        raise HTTPException(status_code=400, detail=f"Repository path does not exist: {request.repo_path}")
    
    # Check if already indexing
    if indexing_status["status"] == "indexing":
        raise HTTPException(status_code=409, detail="Indexing already in progress")
    
    # Start indexing in background
    background_tasks.add_task(run_indexing, str(repo_path))
    
    return {
        "message": "Indexing started",
        "repo_path": str(repo_path),
        "status": "indexing"
    }

async def run_indexing(repo_path: str):
    """Background task to index repository"""
    global indexer, copilot, indexing_status
    
    try:
        # Update status
        indexing_status["status"] = "indexing"
        indexing_status["progress"] = 10
        indexing_status["message"] = "Initializing indexer..."
        
        # Initialize indexer
        indexer = RepoIndexer()
        
        indexing_status["progress"] = 20
        indexing_status["message"] = "Scanning repository files..."
        
        # Index repository
        stats = indexer.index_repository(repo_path)
        
        indexing_status["progress"] = 80
        indexing_status["message"] = "Saving index..."
        
        # Save index
        indexer.save_index()
        
        indexing_status["progress"] = 90
        indexing_status["message"] = "Initializing AI copilot..."
        
        # Initialize copilot
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        copilot = CodeCopilot(api_key=api_key)
        
        # Complete
        indexing_status["status"] = "ready"
        indexing_status["progress"] = 100
        indexing_status["message"] = f"✓ Ready! Indexed {stats['total_chunks']} chunks from {stats['total_files']} files"
        indexing_status["stats"] = stats
        
    except Exception as e:
        indexing_status["status"] = "error"
        indexing_status["progress"] = 0
        indexing_status["message"] = f"Error: {str(e)}"
        print(f"Indexing error: {e}")
        import traceback
        traceback.print_exc()

@app.post("/index-files")
async def index_files(request: IndexFilesRequest, background_tasks: BackgroundTasks):
    """
    Index files from the online editor (content provided directly)
    This is perfect for Visual Code Online where files are in browser memory
    """
    global indexer, copilot, indexing_status
    
    # Check if already indexing
    if indexing_status["status"] == "indexing":
        raise HTTPException(status_code=409, detail="Indexing already in progress")
    
    if not request.files or len(request.files) == 0:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Start indexing in background
    background_tasks.add_task(run_indexing_from_files, request.files, request.project_name)
    
    return {
        "message": "Indexing started",
        "file_count": len(request.files),
        "project_name": request.project_name,
        "status": "indexing"
    }

async def run_indexing_from_files(files: List[FileContent], project_name: str):
    """Background task to index files from memory"""
    global indexer, copilot, indexing_status
    
    try:
        # Update status
        indexing_status["status"] = "indexing"
        indexing_status["progress"] = 10
        indexing_status["message"] = f"Initializing indexer for {project_name}..."
        
        # Initialize indexer
        indexer = RepoIndexer()
        
        indexing_status["progress"] = 20
        indexing_status["message"] = f"Processing {len(files)} files..."
        
        # Convert files to dict format
        file_dicts = [
            {
                'path': f.path,
                'content': f.content,
                'extension': f.extension
            }
            for f in files
        ]
        
        # Index files from memory
        stats = indexer.index_from_memory(file_dicts)
        
        indexing_status["progress"] = 80
        indexing_status["message"] = "Saving index..."
        
        # Save index
        indexer.save_index()
        
        indexing_status["progress"] = 90
        indexing_status["message"] = "Initializing AI copilot..."
        
        # Initialize copilot
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        copilot = CodeCopilot(api_key=api_key)
        
        # Complete
        indexing_status["status"] = "ready"
        indexing_status["progress"] = 100
        indexing_status["message"] = f"✓ Ready! Indexed {stats['total_chunks']} chunks from {stats['total_files']} files"
        indexing_status["stats"] = stats
        
    except Exception as e:
        indexing_status["status"] = "error"
        indexing_status["progress"] = 0
        indexing_status["message"] = f"Error: {str(e)}"
        print(f"Indexing error: {e}")
        import traceback
        traceback.print_exc()

@app.post("/query", response_model=QueryResponse)
async def query_repository(request: QueryRequest):
    """
    Query the repository with a question
    Returns AI-generated answer with relevant code context
    """
    global indexer, copilot, indexing_status
    
    # Check if ready
    if indexing_status["status"] != "ready":
        raise HTTPException(
            status_code=400, 
            detail=f"System not ready. Current status: {indexing_status['status']}"
        )
    
    if indexer is None or copilot is None:
        raise HTTPException(status_code=500, detail="Indexer or copilot not initialized")
    
    try:
        # Search for relevant code chunks
        search_results = indexer.search(request.question, top_k=request.top_k)
        
        # Format results for copilot
        context_chunks = []
        sources = []
        
        for metadata, content, distance in search_results:
            context_chunks.append({
                'metadata': metadata,
                'content': content,
                'score': 1.0 / (1.0 + distance)  # Convert distance to similarity score
            })
            
            # Track unique source files
            file_path = metadata['file_path']
            if file_path not in sources:
                sources.append(file_path)
        
        # Generate answer using Gemini
        answer = copilot.generate_response(
            user_question=request.question,
            context_chunks=context_chunks
        )
        
        return QueryResponse(
            answer=answer,
            relevant_chunks=context_chunks,
            sources=sources
        )
        
    except Exception as e:
        print(f"Query error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/reindex")
async def reindex_repository(background_tasks: BackgroundTasks):
    """
    Re-index the current repository with updated files
    """
    global indexer, indexing_status
    
    if indexer is None:
        raise HTTPException(status_code=400, detail="No repository has been indexed yet")
    
    # Get the repo path from the last indexing
    # For now, we'll require the client to provide it via /index endpoint
    raise HTTPException(
        status_code=400, 
        detail="Please use the /index endpoint with the repository path to re-index"
    )

@app.post("/load-cached-index")
async def load_cached_index():
    """
    Load a previously saved index from cache
    """
    global indexer, copilot, indexing_status
    
    try:
        indexing_status["status"] = "indexing"
        indexing_status["message"] = "Loading cached index..."
        indexing_status["progress"] = 20
        
        # Initialize indexer and load from cache
        indexer = RepoIndexer()
        indexer.load_index()
        
        indexing_status["progress"] = 70
        indexing_status["message"] = "Initializing AI copilot..."
        
        # Initialize copilot
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        copilot = CodeCopilot(api_key=api_key)
        
        # Complete
        indexing_status["status"] = "ready"
        indexing_status["progress"] = 100
        indexing_status["message"] = "✓ Cached index loaded successfully"
        indexing_status["stats"] = {
            "total_chunks": len(indexer.file_chunks)
        }
        
        return {"message": "Index loaded from cache", "status": "ready"}
        
    except Exception as e:
        indexing_status["status"] = "error"
        indexing_status["message"] = f"Error loading cache: {str(e)}"
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🤖 Code Repository Copilot Server")
    print("=" * 60)
    print("Starting server on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
