
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    length_function=len
)

def create_chunks(corpus):
    unified_corpus = ' '.join([item['text'] for item in corpus["text"]])
    chunks = text_splitter.split_text(unified_corpus)
    for i, chunk in enumerate(chunks):
        yield {
            "id": f"chunk_{i}",
            "text": chunk,
            "source": corpus["file"]
        }