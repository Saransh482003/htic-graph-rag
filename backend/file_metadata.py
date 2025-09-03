import os
import hashlib
from datetime import datetime
import PyPDF2
import json

def get_file_metadata(file_path, description=""):
    """Extract metadata from a PDF file and return JSON-like dict"""

    metadata = {}
    file_name = os.path.basename(file_path)

    # Basic fields
    metadata["file_id"] = f"file_{os.path.splitext(file_name)[0]}"
    metadata["name"] = file_name
    metadata["path"] = os.path.abspath(file_path)
    metadata["size"] = os.path.getsize(file_path)
    metadata["created_at"] = datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
    metadata["type"] = "pdf"
    metadata["json_file"] = file_name.replace(".pdf", ".json")

    # SHA256 hash
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    metadata["hash"] = sha256_hash.hexdigest()

    # Page count
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            metadata["pages"] = len(reader.pages)
    except Exception as e:
        metadata["pages"] = None
        print(f"⚠️ Could not read pages for {file_path}: {e}")

    return metadata


if __name__ == "__main__":
    files = os.listdir("./data/raw_pdfs")
    metadata = []

    for file_name in files:
        if file_name.endswith(".pdf"):
            file_path = os.path.join("./data/raw_pdfs", file_name)
            metadata.append(get_file_metadata(file_path))

    # Save as JSON file
    output_path = "./file_metadata.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"✅ Metadata saved to {output_path}")
    print(metadata)
