"""
Code Copilot - Uses Gemini API to provide intelligent code assistance
"""
import os
from typing import List, Dict, Optional
from google import genai

class CodeCopilot:
    """Intelligent code assistant powered by Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the code copilot
        
        Args:
            api_key: Gemini API key (if None, reads from GEMINI_API_KEY env var)
        """
        if api_key:
            os.environ['GEMINI_API_KEY'] = api_key
        
        # Initialize Gemini client
        self.client = genai.Client()
        self.model = "gemini-2.5-flash-lite"
        
        # System prompt for copilot behavior
        self.system_prompt = """You are an expert code assistant helping developers understand and work with codebases.

Your role is to:
1. Analyze code snippets and understand their purpose
2. Answer questions about the codebase accurately
3. Suggest what needs to be done next
4. Tell developers exactly where to add or modify code
5. Provide clear, actionable guidance

When responding:
- Be specific about file paths and locations
- Reference the actual code you see in the context
- Suggest concrete next steps
- Explain WHY something should be done a certain way
- Keep responses clear and developer-friendly
- Use markdown formatting for code snippets

Context provided to you will include:
- Relevant code chunks from the repository
- File paths and locations
- User's question

Based on this context, provide helpful, actionable advice."""
    
    def generate_response(
        self, 
        user_question: str, 
        context_chunks: List[Dict],
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Generate a response using Gemini API
        
        Args:
            user_question: The user's question
            context_chunks: Relevant code chunks from the repository
            conversation_history: Previous conversation messages
            
        Returns:
            Generated response text
        """
        # Build context from chunks
        context_text = self._build_context(context_chunks)
        
        # Build the prompt
        prompt = f"""# Code Repository Context

{context_text}

# User Question
{user_question}

# Instructions
Based on the code context above, answer the user's question. 
- Reference specific files and code sections
- Suggest what needs to be done next
- Tell exactly where to add or modify code
- Be specific and actionable"""

        try:
            # Generate response using Gemini
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={
                    'temperature': 0.7,
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 2048,
                    'system_instruction': self.system_prompt
                }
            )
            
            return response.text
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"I apologize, but I encountered an error: {str(e)}\n\nPlease try rephrasing your question."
    
    def _build_context(self, context_chunks: List[Dict]) -> str:
        """
        Build formatted context from code chunks
        
        Args:
            context_chunks: List of chunk dictionaries with metadata and content
            
        Returns:
            Formatted context string
        """
        if not context_chunks:
            return "No relevant code found in the repository."
        
        context_parts = []
        
        for i, chunk in enumerate(context_chunks, 1):
            metadata = chunk.get('metadata', {})
            content = chunk.get('content', '')
            score = chunk.get('score', 0)
            
            file_path = metadata.get('file_path', 'unknown')
            chunk_index = metadata.get('chunk_index', 0)
            extension = metadata.get('extension', '')
            
            # Format the chunk
            context_parts.append(f"""## Code Chunk {i} (Relevance: {score:.2f})
**File:** `{file_path}`
**Section:** Part {chunk_index + 1}

```{extension.lstrip('.')}
{content}
```
""")
        
        return "\n\n".join(context_parts)
    
    def analyze_codebase_structure(self, file_stats: Dict) -> str:
        """
        Generate a high-level analysis of the codebase structure
        
        Args:
            file_stats: Statistics about files in the codebase
            
        Returns:
            Analysis text
        """
        prompt = f"""Analyze this codebase structure and provide a brief overview:

File Statistics:
- Total files indexed: {file_stats.get('total_files', 0)}
- Total code chunks: {file_stats.get('total_chunks', 0)}

Provide a brief analysis of what type of project this appears to be and its structure."""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={
                    'temperature': 0.7,
                    'max_output_tokens': 512,
                }
            )
            return response.text
        except Exception as e:
            return f"Unable to analyze structure: {str(e)}"
    
    def suggest_next_steps(self, current_task: str, code_context: str) -> str:
        """
        Suggest next steps for a given task
        
        Args:
            current_task: Description of what the user is trying to do
            code_context: Relevant code context
            
        Returns:
            Suggested next steps
        """
        prompt = f"""Current Task: {current_task}

Relevant Code:
{code_context}

Based on this context, suggest specific next steps:
1. What files need to be modified?
2. What code needs to be added or changed?
3. What order should these changes be made in?
4. Any potential issues to watch out for?

Be specific with file paths and code locations."""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={
                    'temperature': 0.7,
                    'max_output_tokens': 1024,
                    'system_instruction': self.system_prompt
                }
            )
            return response.text
        except Exception as e:
            return f"Unable to generate suggestions: {str(e)}"
