import os
import json
import warnings
from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

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

        Here is the text chunk, follow all guidelines above exactly:
        <<<{chunk}>>>
        """
)

triplet_chain = LLMChain(llm=llm, prompt=triplet_prompt)


def extract_triplets_from_chunks(chunks, existing_triplets):
    all_triplets = existing_triplets.copy()
    processed_ids = {t["triplet_id"].split("_")[0] for t in existing_triplets}

    for chunk in chunks:
        if str(chunk["id"]) in processed_ids:
            print(f"⏩ Skipping already processed chunk {chunk['id']}")
            continue
        try:
            response = triplet_chain.run(chunk=chunk["text"])
            triplets = json.loads(response[response.find("["):response.rfind("]")+1])
            for i, t in enumerate(triplets):
                t["source"] = chunk["source"]
                t["triplet_id"] = f"{chunk['id']}_{i}_{len(all_triplets)+1}"
                all_triplets.append(t)
            print(f"✅ Extracted triplets from chunk {chunk['id']} from {chunk['source']}")
        except Exception as e:
            print(f"❌ Error parsing chunk {chunk['id']}: {e}")
    return all_triplets


if __name__ == "__main__":
    with open("./essentials/all_chunks.json", "r", encoding="utf-16") as f:
        all_chunks = json.load(f)

    triplet_file = "./essentials/knowledge_triplets.json"
    if os.path.exists(triplet_file):
        with open(triplet_file, "r", encoding="utf-16") as f:
            existing_triplets = json.load(f)
        print(f"🔄 Resuming from existing file with {len(existing_triplets)} triplets")
    else:
        existing_triplets = []
        print("🆕 Starting fresh triplet extraction")

    all_triplets = extract_triplets_from_chunks(all_chunks, existing_triplets)

    with open(triplet_file, "w", encoding="utf-16") as f:
        json.dump(all_triplets, f, indent=2, ensure_ascii=False)

    print(f"✅ Triplet extraction complete! Saved to {triplet_file}")
