import os
import json


all_chunks = []
for i in os.listdir("./data/extracted_pdfs"):
    with open(os.path.join("./data/extracted_pdfs", i), "r", encoding="utf-16") as f:
        corpus = json.load(f)
        all_chunks.extend(corpus)

with open("./essentials/all_chunks.json", "w", encoding="utf-16") as f:
    json.dump(all_chunks, f, ensure_ascii=False, indent=4)