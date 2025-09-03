from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def insert_triplet(tx, subject, relation, obj, source):
    query = """
    MERGE (s:Entity {name: $subject})
    MERGE (o:Entity {name: $object})
    MERGE (s)-[r:RELATION {type: $relation, source: $source}]->(o)
    """
    tx.run(query, subject=subject, relation=relation, object=obj, source=source)

with driver.session() as session:
    for t in all_triplets:
        session.write_transaction(insert_triplet, t["subject"], t["relation"], t["object"], t["source"])
