"""
Repository Indexer - Indexes code files using Faiss and Jina Embeddings
"""
import os
import json
import pickle
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np
import faiss
from transformers import AutoModel
import torch

class RepoIndexer:
    """Indexes code repository files using Faiss vector database and Jina embeddings"""
    
    def __init__(self, model_name: str = "jinaai/jina-embeddings-v3", cache_dir: str = "./cache"):
        """
        Initialize the repository indexer
        
        Args:
            model_name: HuggingFace model name for embeddings
            cache_dir: Directory to cache the model and index
        """
        self.model_name = model_name
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Load Jina embedding model
        print(f"Loading embedding model: {model_name}")
        self.model = AutoModel.from_pretrained(
            model_name, 
            trust_remote_code=True,
            cache_dir=str(self.cache_dir / "models")
        )
        self.model.eval()
        
        # Move to GPU if available
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = self.model.to(self.device)
        
        # Initialize Faiss index
        self.index = None
        self.file_chunks = []  # Store file path and content chunks
        self.dimension = None
        
        # Supported file extensions for code
        self.supported_extensions = {
            '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', 
            '.h', '.hpp', '.cs', '.go', '.rs', '.rb', '.php', '.swift',
            '.kt', '.scala', '.html', '.css', '.scss', '.sass', '.vue',
            '.md', '.json', '.yaml', '.yml', '.xml', '.sql', '.sh', '.bat'
        }
        
        # Files/folders to ignore
        self.ignore_patterns = {
            'node_modules', '.git', '__pycache__', '.venv', 'venv', 
            'dist', 'build', '.next', 'cache', '.cache', 'coverage'
        }
    
    def should_process_file(self, file_path: Path) -> bool:
        """Check if file should be processed"""
        # Check extension
        if file_path.suffix not in self.supported_extensions:
            return False
        
        # Check if in ignored directory
        for part in file_path.parts:
            if part in self.ignore_patterns:
                return False
        
        # Check file size (skip files > 1MB)
        try:
            if file_path.stat().st_size > 1_000_000:
                return False
        except:
            return False
            
        return True
    
    def chunk_code(self, content: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split code content into overlapping chunks
        
        Args:
            content: File content
            chunk_size: Number of characters per chunk
            overlap: Overlap between chunks
        """
        chunks = []
        lines = content.split('\n')
        current_chunk = []
        current_size = 0
        
        for line in lines:
            line_size = len(line) + 1  # +1 for newline
            
            if current_size + line_size > chunk_size and current_chunk:
                # Save current chunk
                chunks.append('\n'.join(current_chunk))
                
                # Start new chunk with overlap
                overlap_lines = []
                overlap_size = 0
                for prev_line in reversed(current_chunk):
                    if overlap_size + len(prev_line) + 1 <= overlap:
                        overlap_lines.insert(0, prev_line)
                        overlap_size += len(prev_line) + 1
                    else:
                        break
                
                current_chunk = overlap_lines
                current_size = overlap_size
            
            current_chunk.append(line)
            current_size += line_size
        
        # Add last chunk
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks
    
    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for text using Jina model
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            numpy array of embeddings
        """
        with torch.no_grad():
            embeddings = self.model.encode(
                texts,
                task='retrieval.passage',
                show_progress_bar=False
            )
        
        # Convert to numpy if needed
        if isinstance(embeddings, torch.Tensor):
            embeddings = embeddings.cpu().numpy()
        
        return embeddings
    
    def index_repository(self, repo_path: str) -> Dict:
        """
        Index all code files in the repository
        
        Args:
            repo_path: Path to the repository root
            
        Returns:
            Dictionary with indexing statistics
        """
        repo_path = Path(repo_path)
        print(f"Indexing repository: {repo_path}")
        
        # Collect all files
        all_files = []
        for root, dirs, files in os.walk(repo_path):
            # Remove ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_patterns]
            
            for file in files:
                file_path = Path(root) / file
                if self.should_process_file(file_path):
                    all_files.append(file_path)
        
        print(f"Found {len(all_files)} files to index")
        
        # Process files and create chunks
        all_chunks = []
        chunk_metadata = []
        
        for file_path in all_files:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # Create chunks
                chunks = self.chunk_code(content)
                
                # Store chunks with metadata
                relative_path = file_path.relative_to(repo_path)
                for i, chunk in enumerate(chunks):
                    all_chunks.append(chunk)
                    chunk_metadata.append({
                        'file_path': str(relative_path),
                        'chunk_index': i,
                        'total_chunks': len(chunks),
                        'extension': file_path.suffix
                    })
                
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
                continue
        
        print(f"Created {len(all_chunks)} chunks from {len(all_files)} files")
        
        # Generate embeddings
        print("Generating embeddings...")
        batch_size = 32
        all_embeddings = []
        
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            embeddings = self.get_embeddings(batch)
            all_embeddings.append(embeddings)
            
            if (i // batch_size) % 10 == 0:
                print(f"  Processed {i}/{len(all_chunks)} chunks")
        
        all_embeddings = np.vstack(all_embeddings)
        self.dimension = all_embeddings.shape[1]
        
        print(f"Embedding dimension: {self.dimension}")
        
        # Create Faiss index
        print("Building Faiss index...")
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(all_embeddings.astype('float32'))
        
        # Store chunks and metadata
        self.file_chunks = list(zip(chunk_metadata, all_chunks))
        
        print(f"✓ Indexed {len(self.file_chunks)} chunks")
        
        return {
            'total_files': len(all_files),
            'total_chunks': len(self.file_chunks),
            'dimension': self.dimension
        }
    
    def index_from_memory(self, files: List[Dict[str, str]]) -> Dict:
        """
        Index files from memory (content provided directly)
        
        Args:
            files: List of dicts with 'path', 'content', and 'extension' keys
            
        Returns:
            Dictionary with indexing statistics
        """
        print(f"Indexing {len(files)} files from memory...")
        
        # Process files and create chunks
        all_chunks = []
        chunk_metadata = []
        
        for file_info in files:
            try:
                file_path = file_info['path']
                content = file_info['content']
                extension = file_info['extension']
                
                # Skip empty files
                if not content or not content.strip():
                    continue
                
                # Create chunks
                chunks = self.chunk_code(content)
                
                # Store chunks with metadata
                for i, chunk in enumerate(chunks):
                    all_chunks.append(chunk)
                    chunk_metadata.append({
                        'file_path': file_path,
                        'chunk_index': i,
                        'total_chunks': len(chunks),
                        'extension': extension
                    })
                    
            except Exception as e:
                print(f"Error processing {file_info.get('path', 'unknown')}: {e}")
                continue
        
        if not all_chunks:
            raise ValueError("No valid content found to index")
        
        print(f"Created {len(all_chunks)} chunks from {len(files)} files")
        
        # Generate embeddings
        print("Generating embeddings...")
        batch_size = 32
        all_embeddings = []
        
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            embeddings = self.get_embeddings(batch)
            all_embeddings.append(embeddings)
            
            if (i //batch_size) % 10 == 0:
                print(f"  Processed {i}/{len(all_chunks)} chunks")
        
        all_embeddings = np.vstack(all_embeddings)
        self.dimension = all_embeddings.shape[1]
        
        print(f"Embedding dimension: {self.dimension}")
        
        # Create Faiss index
        print("Building Faiss index...")
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(all_embeddings.astype('float32'))
        
        # Store chunks and metadata
        self.file_chunks = list(zip(chunk_metadata, all_chunks))
        
        print(f"✓ Indexed {len(self.file_chunks)} chunks")
        
        return {
            'total_files': len(files),
            'total_chunks': len(self.file_chunks),
            'dimension': self.dimension
        }
    
    def search(self, query: str, top_k: int = 5) -> List[Tuple[Dict, str, float]]:
        """
        Search for relevant code chunks
        
        Args:
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of (metadata, chunk_content, distance) tuples
        """
        if self.index is None:
            raise ValueError("Index not built. Call index_repository first.")
        
        # Generate query embedding
        query_embedding = self.get_embeddings([query])
        
        # Search in Faiss index
        distances, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        # Retrieve results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.file_chunks):
                metadata, content = self.file_chunks[idx]
                results.append((metadata, content, float(dist)))
        
        return results
    
    def save_index(self, save_path: str = None):
        """Save the index and metadata to disk"""
        if save_path is None:
            save_path = self.cache_dir / "index"
        
        save_path = Path(save_path)
        save_path.mkdir(exist_ok=True, parents=True)
        
        # Save Faiss index
        faiss.write_index(self.index, str(save_path / "faiss.index"))
        
        # Save metadata and chunks
        with open(save_path / "chunks.pkl", 'wb') as f:
            pickle.dump(self.file_chunks, f)
        
        # Save config
        config = {
            'dimension': self.dimension,
            'model_name': self.model_name,
            'num_chunks': len(self.file_chunks)
        }
        with open(save_path / "config.json", 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✓ Index saved to {save_path}")
    
    def load_index(self, load_path: str = None):
        """Load the index and metadata from disk"""
        if load_path is None:
            load_path = self.cache_dir / "index"
        
        load_path = Path(load_path)
        
        # Load config
        with open(load_path / "config.json", 'r') as f:
            config = json.load(f)
        
        self.dimension = config['dimension']
        
        # Load Faiss index
        self.index = faiss.read_index(str(load_path / "faiss.index"))
        
        # Load chunks
        with open(load_path / "chunks.pkl", 'rb') as f:
            self.file_chunks = pickle.load(f)
        
        print(f"✓ Index loaded from {load_path}")
        print(f"  Loaded {len(self.file_chunks)} chunks")
