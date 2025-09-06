import sys
import os
import json
from pathlib import Path

# Add backend path
backend_path = Path(__file__).parent.parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

def query_backend(question):
    """
    Simple wrapper to query the backend without modifying existing files
    """
    try:
        # Change to backend directory
        original_cwd = os.getcwd()
        os.chdir(backend_path)
        
        # Import after changing directory
        from retrieval_mechs import retrieve_context
        from run_query import answer_with_graph_rag_llama
        
        # Retrieve context
        retrievals = retrieve_context(question, topk_entities=5)
        
        # Generate answer
        answer = answer_with_graph_rag_llama(question, retrievals)
        
        # Restore original directory
        os.chdir(original_cwd)
        
        return {
            "answer": answer,
            "entitiesUsed": len(retrievals),
            "success": True
        }
        
    except Exception as e:
        # Restore original directory
        os.chdir(original_cwd)
        
        return {
            "answer": "I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.",
            "error": str(e),
            "success": False,
            "entitiesUsed": 0
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
        result = query_backend(question)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No question provided", "success": False}))