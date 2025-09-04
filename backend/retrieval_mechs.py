from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "testpassword"))

# --- Entity-based search ---
def search_entities(question, limit=10):
    query = """
    CALL db.index.fulltext.queryNodes('entityIndex', $q) YIELD node, score
    RETURN node.name AS entity, score
    ORDER BY score DESC LIMIT $limit
    """
    with driver.session() as session:
        result = session.run(query, q=question, limit=limit)
        return [record.data() for record in result]

# --- Expand neighborhood of an entity ---
def expand_entity(entity, limit=20):
    query = """
    MATCH (e:Entity {name: $entity})-[r]-(n)
    RETURN e.name AS source, type(r) AS relation, n.name AS target, r.source AS provenance
    LIMIT $limit
    """
    with driver.session() as session:
        result = session.run(query, entity=entity, limit=limit)
        return [record.data() for record in result]

# --- Retrieve supporting chunks ---
def get_chunks_for_entity(entity, limit=5):
    query = """
    MATCH (c:Chunk)-[:CONTAINS_ENTITY]->(e:Entity {name: $entity})
    RETURN c.chunk_id AS chunk_id, c.text AS text, c.source AS source
    LIMIT $limit
    """
    with driver.session() as session:
        result = session.run(query, entity=entity, limit=limit)
        return [record.data() for record in result]

# --- Unified retrieval function ---
def retrieve_context(question, topk_entities=3):
    entities = search_entities(question, limit=topk_entities)
    context = []

    for ent in entities:
        entity_name = ent["entity"]
        neighbors = expand_entity(entity_name)
        chunks = get_chunks_for_entity(entity_name)

        context.append({
            "entity": entity_name,
            "neighbors": neighbors,
            "chunks": chunks
        })

    return context

