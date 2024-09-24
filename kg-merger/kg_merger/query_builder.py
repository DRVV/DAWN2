from neo4j import GraphDatabase

# Sample user input
user_input = {
    'provider': ["A", "B"],
    'material': ["m1", "m2", "m3"]
}

# Function to build the dynamic query
def build_dynamic_query(user_input):
    match_clause = "MATCH (n)-[r:related]->(m)"
    where_clauses = []
    params = {}

    for key, values in user_input.items():
        param_name = f"{key}List"
        params[param_name] = values

        condition = f"""
        (
          r.{key} IN ${param_name} OR
          (${param_name} IS NOT NULL AND ANY(val IN r.{key} WHERE val IN ${param_name}))
        )
        """
        where_clauses.append(condition.strip())

    where_clause = " AND ".join(where_clauses)
    query = f"""
    {match_clause}
    WHERE {where_clause}
    RETURN n, r, m
    """
    return query, params

# Build the query and parameters
query, params = build_dynamic_query(user_input)

# Connect to Neo4j and execute the query
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

with driver.session() as session:
    result = session.run(query, **params)
    for record in result:
        n = record["n"]
        r = record["r"]
        m = record["m"]
        # Process or print the nodes and relationships
        print(f"{n['Id']} -[{r.type()}]-> {m['Id']}")

driver.close()
