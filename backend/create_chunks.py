
from langchain.text_splitter import RecursiveCharacterTextSplitter
import json

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    length_function=len
)

def create_chunks(corpus):
    chunks, indexer = [], 0
    for i, chunk in enumerate(corpus):
        splits = text_splitter.split_text(chunk["text"])
        for split in splits:
            chunks.append({
                "id": f"chunk_{indexer}",
                "text": split,
                "source": chunk["source"]
            })
            indexer += 1
    return chunks
with open("./essentials/group_chunks.json", "r", encoding="utf-16") as f:
    all_chunks = json.loads(f.read())
    chunk_generator = create_chunks(all_chunks)
    with open("./essentials/all_chunks.json", "w", encoding="utf-16") as out_f:
        json.dump(chunk_generator, out_f, ensure_ascii=False, indent=4)