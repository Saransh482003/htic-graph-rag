from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json
import warnings
warnings.filterwarnings("ignore")

llm = ChatOllama(model="gpt-oss:20b", temperature=0)

triplet_prompt = PromptTemplate(
    input_variables=["chunk"],
    template="""
        You are an expert biomedical knowledge graph constructor.  
        Your task is to read the following chunk of text and extract knowledge in the form of subject–relation–object triplets.  

        Guidelines:
        - Capture meaningful scientific/clinical facts, not formatting or filler text.
        - The text may contain information about using a device or procedure, this is not filler text
        - Subjects and objects should be specific entities (e.g., "Complex sleep apnea", "Obstructive apnea", "Electrocardiogram-based analysis").  
        - Relations should be verbs or verb phrases that clearly describe the connection (e.g., "is defined as", "is associated with", "is caused by", "is measured by", "is improved with").  
        - Keep entities normalized and concise (avoid unnecessary adjectives unless medically relevant, e.g., "narrow spectral band e-LFC").  
        - If numerical or threshold values are explicitly stated, include them as objects (e.g., "Central apnea index" - "≥ 5 per hour").  
        - Ignore disclaimers, references, or funding acknowledgments.  
        - Output strictly as a JSON list of triplets in the form:

        The output should be only be a valid JSON array formatted as follows, no other text:
        [
            {{
                "subject": "...", 
                "relation": "...", 
                "object": "..."
            }},
            ...
        ]

        Here is the text chunk, follow all guidelines above exactly, or I'll send you a torture chamber :
        <<<{chunk}>>>
        """
    )

triplet_chain = LLMChain(llm=llm, prompt=triplet_prompt)

def get_last_processed_chunk_id(triplets_file_path):
    """Get the ID of the last processed chunk from existing triplets file."""
    try:
        with open(triplets_file_path, "r", encoding="utf-16") as f:
            existing_triplets = json.load(f)
        
        if not existing_triplets:
            return None
        
        chunk_ids = []
        for triplet in existing_triplets:
            triplet_id = triplet.get("triplet_id", "")
            if triplet_id.startswith("chunk_"):
                chunk_id = triplet_id.split("_")[1]
                try:
                    chunk_ids.append(int(chunk_id))
                except ValueError:
                    continue
        
        return max(chunk_ids) if chunk_ids else None
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def extract_triplets_from_chunks(chunks, existing_triplets=None, triplets_file_path=None):
    """Extract triplets from chunks, resuming from last processed chunk."""
    if existing_triplets is None:
        existing_triplets = []
    
    all_triplets = existing_triplets.copy()
    
    for chunk in chunks:
        try:
            response = triplet_chain.run(chunk=chunk["text"])
            triplets = json.loads(response[response.find('['):response.rfind(']')+1])
            for i, t in enumerate(triplets):
                t["source"] = chunk["source"]
                t["triplet_id"] = f"{chunk['id']}_{i}_{len(all_triplets)+1}"
                all_triplets.append(t)
            
            if triplets_file_path:
                save_triplets_incrementally(all_triplets, triplets_file_path)
            
            print(f"✅ Extracted and saved triplets from chunk {chunk['id']} from {chunk['source']} (Total: {len(all_triplets)})")
        except Exception as e:
            print(f"❌ Error parsing chunk {chunk['id']}: {e}")
    
    return all_triplets

def save_triplets_incrementally(triplets, triplets_file_path):
    """Save triplets to file."""
    with open(triplets_file_path, "w", encoding="utf-16") as f:
        json.dump(triplets, f, indent=2, ensure_ascii=False)


with open("./essentials/all_chunks.json", "r", encoding="utf-16") as f:
    all_chunks = json.load(f)

triplets_file_path = "./essentials/knowledge_triplets.json"
last_processed_chunk_id = get_last_processed_chunk_id(triplets_file_path)

existing_triplets = []
try:
    with open(triplets_file_path, "r", encoding="utf-16") as f:
        existing_triplets = json.load(f)
    print(f"📋 Found {len(existing_triplets)} existing triplets")
except (FileNotFoundError, json.JSONDecodeError):
    print("📋 No existing triplets found, starting fresh")

if last_processed_chunk_id is not None:
    start_index = last_processed_chunk_id + 1
    print(f"🔄 Resuming from chunk {start_index} (last processed: chunk_{last_processed_chunk_id})")
else:
    start_index = 0
    print("🚀 Starting from the beginning")

chunks_to_process = []
for chunk in all_chunks:
    chunk_id = int(chunk["id"].split("_")[1])
    if chunk_id >= start_index:
        chunks_to_process.append(chunk)

if not chunks_to_process:
    print("✅ All chunks have been processed!")
else:
    print(f"📊 Processing {len(chunks_to_process)} chunks (from chunk_{start_index} to chunk_{int(all_chunks[-1]['id'].split('_')[1])})")
    
    all_triplets = existing_triplets
    for i, chunk in enumerate(chunks_to_process):
        print(f"\n🔄 Processing chunk {i+1}/{len(chunks_to_process)}: {chunk['id']}")
        
        all_triplets = extract_triplets_from_chunks([chunk], all_triplets, triplets_file_path)
        
        print(f"💾 Progress saved: {len(all_triplets)} total triplets")

print("✅ Triplet extraction complete! Saved to ./essentials/knowledge_triplets.json")
