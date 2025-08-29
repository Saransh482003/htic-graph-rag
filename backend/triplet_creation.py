from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json

llm = ChatOllama(model="llama3", temperature=0)

triplet_prompt = PromptTemplate(
    input_variables=["chunk"],
    template="""
        You are an expert biomedical knowledge graph constructor.  
        Your task is to read the following chunk of text and extract knowledge in the form of subject–relation–object triplets.  

        Guidelines:
        - Capture only meaningful scientific/clinical facts, not formatting or filler text.  
        - Subjects and objects should be specific entities (e.g., "Complex sleep apnea", "Obstructive apnea", "Electrocardiogram-based analysis").  
        - Relations should be verbs or verb phrases that clearly describe the connection (e.g., "is defined as", "is associated with", "is caused by", "is measured by", "is improved with").  
        - Keep entities normalized and concise (avoid unnecessary adjectives unless medically relevant, e.g., "narrow spectral band e-LFC").  
        - If numerical or threshold values are explicitly stated, include them as objects (e.g., "Central apnea index" – "≥ 5 per hour").  
        - Ignore disclaimers, references, or funding acknowledgments.  
        - Output strictly as a JSON list of triplets in the form:
        [
            {{"subject": "...", "relation": "...", "object": "..."}},
            ...
        ]

        Here is the text chunk:
        <<<{chunk}>>>
        """
    )

triplet_chain = LLMChain(llm=llm, prompt=triplet_prompt)

def extract_triplets_from_chunks(chunks):
    all_triplets = []
    for chunk in chunks:
        try:
            response = triplet_chain.run(chunk=chunk["text"])
            triplets = json.loads(response)
            for t in triplets:
                t["source"] = chunk["source"]
                all_triplets.append(t)
        except Exception as e:
            print(f"Error parsing chunk {chunk['page']}: {e}")
    return all_triplets

with open("./essentials/all_chunks.json", "r", encoding="utf-16") as f:
    all_chunks = json.load(f)
all_triplets = extract_triplets_from_chunks(all_chunks[:5])

# 6. Save results to JSON file
with open("./essentials/knowledge_triplets.json", "w", encoding="utf-16") as f:
    json.dump(all_triplets, f, indent=2, ensure_ascii=False)

print("✅ Triplet extraction complete! Saved to ./essentials/knowledge_triplets.json")
