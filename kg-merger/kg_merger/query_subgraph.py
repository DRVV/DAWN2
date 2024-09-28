import os
from neo4j import GraphDatabase, basic_auth
from dotenv import load_dotenv
import logging

# Configure logging
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Retrieve configurations from environment variables
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

def query_subgraph(user_criteria, neo4j_uri, neo4j_user, neo4j_password):
    """
    Queries Neo4j to retrieve a subgraph based on user criteria.
    user_criteria: dict where keys are attribute names and values are lists of acceptable values.
    Example:
        {
            'product': ['a', 'b'],
            'provider': ['provider2'],
            'label': ['label1']
        }
    """
    try:
        driver = GraphDatabase.driver(neo4j_uri, auth=basic_auth(neo4j_user, neo4j_password))
        with driver.session() as session:
            # Dynamically build the WHERE clause based on user criteria
            where_clauses = []
            for attr in user_criteria.keys():
                where_clauses.append(f"ANY(val IN $criteria.{attr} WHERE val IN r.{attr})")

            # Combine all conditions with OR
            where_statement = " AND ".join(where_clauses)

            # Final Cypher query
            query = f"""
                MATCH (a:Node)-[r:RELATED]->(b:Node)
                WHERE {where_statement}
                RETURN DISTINCT a.id AS from_id, a.label AS from_label,
                                b.id AS to_id, b.label AS to_label,
                                r.product AS products,
                                r.provider AS providers,
                                r.label AS labels
            """

            # Execute the query with parameters
            logger.info(f"Executing subgraph query with criteria: {user_criteria}")
            result = session.run(query, criteria=user_criteria)
            
            subgraph = {
                "nodes": set(),
                "relationships": []
            }
            record_count = 0
            for record in result:
                record_count += 1
                from_node = {"id": record["from_id"], "label": record["from_label"]}
                to_node = {"id": record["to_id"], "label": record["to_label"]}
                relationship = {
                    "from": from_node,
                    "to": to_node,
                    "attributes": {}
                }

                # Add dynamic attributes
                for attr in user_criteria.keys():
                    plural_attr = attr + "s" if not attr.endswith('s') else attr + "es"
                    relationship["attributes"][attr] = record.get(plural_attr)

                subgraph["nodes"].add((from_node["id"], from_node["label"]))
                subgraph["nodes"].add((to_node["id"], to_node["label"]))
                subgraph["relationships"].append(relationship)
            
            logger.info(f"Subgraph query returned {record_count} records.")

        driver.close()

        # Convert nodes set to list of dicts
        subgraph["nodes"] = [{"id": nid, "label": nlabel} for nid, nlabel in sorted(subgraph["nodes"])]

        return subgraph

    except Exception as e:
        logger.error(f"Error during subgraph querying: {e}")
        return None

def main():
    # Define user criteria
    user_criteria = {
        'product': ['a', 'b'],
        'provider': ['provider2'],
        'label': ['label1']
    }

    # Query the subgraph
    subgraph = query_subgraph(user_criteria, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    if subgraph is None:
        logger.error("Subgraph querying failed. Exiting.")
        return

    # Display the subgraph
    print("Nodes in Subgraph:")
    for node in subgraph["nodes"]:
        print(f" - ID: {node['id']}, Label: {node['label']}")

    print("\nRelationships in Subgraph:")
    for rel in subgraph["relationships"]:
        attrs = ", ".join([f"{k}={v}" for k, v in rel["attributes"].items()])
        print(f" - {rel['from']['id']} -> {rel['to']['id']} [{attrs}]")

if __name__ == "__main__":
    main()
