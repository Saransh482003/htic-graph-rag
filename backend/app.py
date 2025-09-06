from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import time
import uuid
from datetime import datetime

# Import existing modules
from retrieval_mechs import retrieve_context
from run_query import answer_with_graph_rag_llama

# Initialize FastAPI app
app = FastAPI(
    title="HTIC Graph RAG API",
    description="A FastAPI application for HTIC Graph RAG system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/chat")
async def ask_question(request: Dict[str, Any]):
    """
    Endpoint to handle user questions and generate responses using the Graph RAG system.
    
    Request body should contain:
    - question: str (required) - The user's question
    - conversation_id: str (optional) - For follow-up questions
    - previous_context: list (optional) - Previous conversation context for follow-ups
    """
    try:
        # Extract question from request
        question = request.get("question", "").strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        if len(question) > 1000:
            raise HTTPException(status_code=400, detail="Question too long (max 1000 characters)")
        
        # Generate or use conversation ID
        conversation_id = request.get("conversation_id", str(uuid.uuid4()))
        previous_context = request.get("previous_context", [])
        
        # Start timing
        start_time = time.time()
        
        # Retrieve context from knowledge graph
        retrievals = retrieve_context(question, topk_entities=5)
        
        # Generate answer using existing function
        answer = answer_with_graph_rag_llama(question, retrievals)
        
        # Calculate processing time
        processing_time = round(time.time() - start_time, 2)
        
        # Prepare response (include retrievals for reference UI)
        response = {
            "answer": answer,
            "conversation_id": conversation_id,
            "processing_time": processing_time,
            "entities_used": len(retrievals),
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "retrievals": retrievals,
            "context_summary": {
                "entities_found": [r.get('entity', 'Unknown') for r in retrievals[:3]],  # Top 3 entities
                "total_relations": sum(len(r.get('neighbors', [])) for r in retrievals),
                "total_chunks": sum(len(r.get('chunks', [])) for r in retrievals)
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Error processing question: {str(e)}")
        
        return {
            "answer": "I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.",
            "conversation_id": request.get("conversation_id", str(uuid.uuid4())),
            "processing_time": 0,
            "entities_used": 0,
            "timestamp": datetime.now().isoformat(),
            "success": False,
            "error": str(e)
        }

@app.post("/followup")
async def ask_followup_question(request: Dict[str, Any]):
    """
    Endpoint to handle follow-up questions in a conversation context.
    
    Request body should contain:
    - question: str (required) - The follow-up question
    - conversation_id: str (required) - Conversation ID from previous interaction
    - previous_answer: str (optional) - Previous answer for context
    - original_question: str (optional) - Original question for context
    """
    try:
        # Extract data from request
        question = request.get("question", "").strip()
        conversation_id = request.get("conversation_id", "")
        previous_answer = request.get("previous_answer", "")
        original_question = request.get("original_question", "")
        
        if not question:
            raise HTTPException(status_code=400, detail="Follow-up question is required")
        
        if not conversation_id:
            raise HTTPException(status_code=400, detail="Conversation ID is required for follow-up questions")
        
        if len(question) > 1000:
            raise HTTPException(status_code=400, detail="Question too long (max 1000 characters)")
        
        # Start timing
        start_time = time.time()
        
        # Create context-aware question for better retrieval
        if original_question and previous_answer:
            contextual_question = f"Previous question: {original_question}\nPrevious answer: {previous_answer[:200]}...\nFollow-up question: {question}"
        else:
            contextual_question = question
        
        # Retrieve context from knowledge graph
        retrievals = retrieve_context(contextual_question, topk_entities=5)
        
        # Generate answer using existing function
        answer = answer_with_graph_rag_llama(question, retrievals)
        
        # Calculate processing time
        processing_time = round(time.time() - start_time, 2)
        
        # Prepare response (include retrievals for reference UI)
        response = {
            "answer": answer,
            "conversation_id": conversation_id,
            "processing_time": processing_time,
            "entities_used": len(retrievals),
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "is_followup": True,
            "retrievals": retrievals,
            "context_summary": {
                "entities_found": [r.get('entity', 'Unknown') for r in retrievals[:3]],
                "total_relations": sum(len(r.get('neighbors', [])) for r in retrievals),
                "total_chunks": sum(len(r.get('chunks', [])) for r in retrievals)
            }
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Error processing follow-up question: {str(e)}")
        
        return {
            "answer": "I apologize, but I encountered an error while processing your follow-up question. Please try again or rephrase your question.",
            "conversation_id": conversation_id,
            "processing_time": 0,
            "entities_used": 0,
            "timestamp": datetime.now().isoformat(),
            "success": False,
            "is_followup": True,
            "error": str(e)
        }

@app.get("/")
def root():
    return {
        "message": "HTIC Biomedical Knowledge Graph RAG API", 
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "chat": "/chat (POST)",
            "followup": "/followup (POST)",
            "docs": "/docs"
        }
    }

