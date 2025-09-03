import json
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "testpassword"))

def insert_file(tx, file_id, name, url, description):
    query = """
    MERGE (f:File {file_id: $file_id})
    SET f.name = $name,
        f.url = $url,
        f.description = $description
    """
    tx.run(query, file_id=file_id, name=name, url=url, description=description)

def insert_chunk(tx, chunk_id, text, source, file_name):
    query = """
    MATCH (f:File {name: $file_name})
    MERGE (c:Chunk {chunk_id: $chunk_id})
    SET c.text = $text,
        c.source = $source
    MERGE (f)-[:HAS_CHUNK]->(c)
    """
    tx.run(query, file_name=file_name, chunk_id=chunk_id, text=text, source=source)

def insert_triplet(tx, triplet_id, subject, relation, obj, source, chunk_id):
    query = """
    MATCH (c:Chunk {id: $chunk_id})
    MERGE (s:Entity {name: $subject})
    MERGE (o:Entity {name: $object})
    MERGE (s)-[r:RELATION {type: $relation, triplet_id: $triplet_id, source: $source}]->(o)
    MERGE (c)-[:CONTAINS_TRIPLET]->(s)
    MERGE (c)-[:CONTAINS_TRIPLET]->(o)
    """
    tx.run(query, chunk_id=chunk_id, subject=subject, relation=relation,
           object=obj, triplet_id=triplet_id, source=source)


if __name__ == "__main__":
    with open("./essentials/file_metadata.json", "r", encoding="utf-8") as f:
        files = json.load(f)

    with open("./essentials/all_chunks.json", "r", encoding="utf-16") as f:
        chunks = json.load(f)

    with open("./essentials/knowledge_triplets.json", "r", encoding="utf-16") as f:
        triplets = json.load(f)

    with driver.session() as session:
    
        for i, f in enumerate(files):
            session.write_transaction(insert_file, f"file_{i}", f["name"], f["url"], f["description"])

    
        for c in chunks:
            session.write_transaction(insert_chunk, c["id"], c["text"], c["source"], "0_artsens_manual.pdf")

    
        for t in triplets:
            chunk_id = "_".join(t["triplet_id"].split("_")[:2])
            session.write_transaction(insert_triplet, t["triplet_id"], t["subject"], t["relation"], t["object"], t["source"], chunk_id)

    print("✅ Files, chunks, and triplets inserted into Neo4j")
