from retrieval_mechs import retrieve_context
import ollama
import json
import sys
import time


def format_context(retrievals):
    """Format retrieval results into a readable context string."""
    if not retrievals:
        return "No relevant context found in the knowledge graph."
    
    context_str = ""
    for r in retrievals:
        context_str += f"\n🔍 Entity: {r['entity']}\n"

        # Neighbors (triplets)
        if r['neighbors']:
            context_str += "  📊 Relations:\n"
            for n in r['neighbors']:
                if n["target"]:
                    context_str += f"    • ({n['source']}) -[{n['relation']}]-> ({n['target']}) [📄 {n['provenance']}]\n"

        # Chunks
        if r['chunks']:
            context_str += "  📝 Supporting Text:\n"
            for c in r['chunks']:
                # Better text trimming with ellipsis handling
                text_preview = c['text'][:300].strip()
                if len(c['text']) > 300:
                    text_preview += "..."
                context_str += f"    • {text_preview}\n"

    return context_str


def answer_with_graph_rag_llama(question, retrievals):
    """Generate an answer using the knowledge graph context and LLM."""
    context = format_context(retrievals)

    prompt = f"""You are a helpful biomedical assistant with access to a structured medical knowledge graph.

    Your task is to answer the user's question using the provided knowledge graph context and supporting documents.

    Guidelines:
    - Base your answer ONLY on the provided context.
    - Do NOT invent references or use numeric citation markers like [1], [2], etc.
    - When citing evidence, mention the source naturally, e.g.:
    - "According to the ARTSENS User Manual..."
    - "The 2021 MeMeA publication reports that..."
    - Keep the explanation clear and professional, suitable for clinicians or medical researchers.
    - If the information is incomplete, explicitly say what is missing instead of guessing.
    - Structure your answer logically (short intro → key points → conclusion).
    - Aim for a natural explanatory style, not a scientific paper.

    Question:
    {question}

    Knowledge Graph Context:
    {context}

    Now provide a clear, well-structured answer grounded in the context above.
    """

    try:
        response = ollama.chat(
            model="llama3",
            messages=[{"role": "user", "content": prompt}],
            options={
                "temperature": 0.1,
                "top_p": 0.9,
                "stop": ["Question:", "Context:", "Answer:"]
            }
        )
        
        # Clean up the response
        answer = response['message']['content'].strip()
        
        # Remove any duplicate text or formatting artifacts
        lines = answer.split('\n')
        cleaned_lines = []
        seen_lines = set()
        
        for line in lines:
            line = line.strip()
            if line and line not in seen_lines:
                cleaned_lines.append(line)
                seen_lines.add(line)
        
        return '\n'.join(cleaned_lines)
        
    except Exception as e:
        return f"❌ Error generating answer: {str(e)}"


def interactive_qa_session():
    """Run an interactive question-answering session."""
    print("🧬 Biomedical Knowledge Graph RAG System")
    print("=" * 50)
    print("Ask questions about the medical documents in the knowledge base.")
    print("Type 'quit', 'exit', or 'q' to end the session.\n")
    
    session_count = 0
    
    while True:
        try:
            # Get user question
            question = input("❓ Question: ").strip()
            
            # Check for exit commands
            if question.lower() in ['quit', 'exit', 'q', '']:
                print("\n👋 Thank you for using the Biomedical RAG System!")
                break
            
            session_count += 1
            print(f"\n🔄 Processing question #{session_count}...")
            
            # Retrieve context
            start_time = time.time()
            retrievals = retrieve_context(question, topk_entities=5)
            retrieval_time = time.time() - start_time
            
            print(f"📊 Retrieved context in {retrieval_time:.2f} seconds")
            print(f"📈 Found {len(retrievals)} relevant entities")
            
            # Generate answer
            print("🤖 Generating answer...")
            answer_start_time = time.time()
            answer = answer_with_graph_rag_llama(question, retrievals)
            answer_time = time.time() - answer_start_time
            
            # Display results with clear formatting
            print("\n" + "="*60)
            print("📋 ANSWER")
            print("="*60)
            print(answer)
            print("="*60)
            print(f"⏱️  Answer generated in {answer_time:.2f} seconds")
            print(f"📊 Context entities used: {len(retrievals)}")
            print("\n")
            
            # Ask if user wants to see the raw context
            show_context = input("🔍 Show raw context? (y/N): ").strip().lower()
            if show_context in ['y', 'yes']:
                print("\n📚 RAW CONTEXT:")
                print("-" * 30)
                print(format_context(retrievals))
                print("\n")
                
        except KeyboardInterrupt:
            print("\n\n👋 Session interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("Please try again with a different question.\n")


def single_question_mode():
    """Handle a single question from command line or direct input."""
    if len(sys.argv) > 1:
        # Question provided as command line argument
        question = " ".join(sys.argv[1:])
    else:
        # Prompt for question
        question = input("❓ Question: ").strip()
    
    if not question:
        print("❌ No question provided.")
        return
    
    print(f"\n🔄 Processing: {question}")
    
    try:
        # Retrieve and answer
        start_time = time.time()
        retrievals = retrieve_context(question)
        answer = answer_with_graph_rag_llama(question, retrievals)
        total_time = time.time() - start_time
        
        # Display results
        print("\n" + "="*60)
        print("📋 ANSWER")
        print("="*60)
        print(answer)
        print("="*60)
        print(f"⏱️  Total processing time: {total_time:.2f} seconds")
        print(f"📊 Context entities used: {len(retrievals)}")
        print()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    print("🧬 Biomedical Knowledge Graph RAG System")
    print("=" * 50)
    
    # Check if running in interactive mode
    mode = input("Choose mode:\n1. Interactive session (i)\n2. Single question (s)\nMode [i/s]: ").strip().lower()
    
    if mode in ['s', 'single', '2']:
        single_question_mode()
    else:
        interactive_qa_session()
