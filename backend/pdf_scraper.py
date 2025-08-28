import os
import fitz
import json
from pathlib import Path

def extract_text_by_page(pdf_path: str):
    """
        Extracts text page by page from a PDF.
        Returns: list of {"page": int, "text": str}
    """
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        text = " ".join(page.get_text("text").split())
        pages.append({"page": i + 1, "text": text, "file": Path(pdf_path).name})
    doc.close()
    with open(f"./data/extracted_pdfs/{Path(pdf_path).stem}_extracted.json", "w") as f:
        json.dump(pages, f, indent=4)
    return pages

files = os.listdir("./data/raw_pdfs")
pdf_files = [f for f in files if f.endswith(".pdf")]

for pdf_file in pdf_files:
    extract_text_by_page(os.path.join("./data/raw_pdfs", pdf_file))