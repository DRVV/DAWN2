import pydot
import csv
import os
import shutil
from neo4j import GraphDatabase, basic_auth
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Retrieve configurations from environment variables
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
DOT_FILE_PATH = os.getenv("DOT_FILE_PATH")
IMPORT_DIR = os.getenv("IMPORT_DIR")

def dot_to_csv(dot_file_path, nodes_csv_path, relationships_csv_path, separator='___'):
    """
    Parses the DOT file and generates nodes.csv and relationships.csv.
    """
    try:
        # Parse the DOT file
        graphs = pydot.graph_from_dot_file(dot_file_path)
        if not graphs:
            logger.error("No graphs found in the DOT file.")
            return False
        graph = graphs[0]  # Assuming the first graph

        # Extract nodes with IDs and labels
        nodes = graph.get_nodes()
        node_data = {}
        for node in nodes:
            name = node.get_name().strip('"')
            if name.lower() in {'graph', 'node'}:
                continue  # Skip default graph/node attributes
            attributes = node.get_attributes()
            node_id = name  # Assuming the name serves as the unique ID
            label = attributes.get('label', name)  # Default label is the name if not provided
            node_data[node_id] = label

        # Extract edges with dynamic attributes
        edges = graph.get_edges()
        relationships = []
        all_relationship_attributes = set()
        for edge in edges:
            src = edge.get_source().strip('"')
            dst = edge.get_destination().strip('"')
            attrs = edge.get_attributes()

            # Collect all attribute keys
            attr_keys = set(attrs.keys())

            # Update the global set of attributes
            all_relationship_attributes.update(attr_keys)

            # Initialize a dictionary for the relationship
            rel = {'source': src, 'target': dst}
            for key in attr_keys:
                rel[key] = attrs.get(key, '')
            relationships.append(rel)

        logger.info(f"Loaded {len(node_data)} nodes and {len(relationships)} relationships from DOT file.")

        # Write nodes to CSV
        with open(nodes_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['id', 'label'])  # Header
            for node_id, label in sorted(node_data.items()):
                writer.writerow([node_id, label])

        # Write relationships to CSV with dynamic attributes
        sorted_attributes = sorted(all_relationship_attributes)
        with open(relationships_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            header = ['source', 'target'] + sorted_attributes
            writer.writerow(header)  # Header
            for rel in relationships:
                row = [rel.get('source', ''), rel.get('target', '')]
                for attr in sorted_attributes:
                    row.append(rel.get(attr, ''))
                writer.writerow(row)

        logger.info(f"Nodes and relationships have been written to '{nodes_csv_path}' and '{relationships_csv_path}' respectively.")
        return True

    except Exception as e:
        logger.error(f"Error during DOT to CSV conversion: {e}")
        return False

def load_csvs_into_neo4j(nodes_csv_path, relationships_csv_path, neo4j_uri, neo4j_user, neo4j_password, separator='___'):
    """
    Loads nodes and relationships from CSV files into Neo4j using the CALL { ... } IN TRANSACTIONS syntax.
    """
    try:
        driver = GraphDatabase.driver(neo4j_uri, auth=basic_auth(neo4j_user, neo4j_password))
        with driver.session() as session:
            # 1. Clear existing data
            logger.info("Clearing existing data in Neo4j...")
            session.run("MATCH (n) DETACH DELETE n")

            # 2. Load nodes
            logger.info("Loading nodes into Neo4j...")
            load_nodes_query = f"""
                CALL {{
                    LOAD CSV WITH HEADERS FROM 'file:///{os.path.basename(nodes_csv_path)}' AS row
                    CREATE (:Node {{id: row.id, label: row.label}})
                }}
                IN TRANSACTIONS OF 1000 ROWS
            """
            session.run(load_nodes_query)

            # 3. Load relationships with dynamic attributes
            logger.info("Loading relationships into Neo4j...")

            # Dynamically determine the attributes from the relationships CSV header
            with open(relationships_csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                headers = next(reader)
                relationship_attributes = headers[2:]  # Exclude 'source' and 'target'

            logger.info(f"Relationship attributes detected: {relationship_attributes}")

            # Construct the SET clause dynamically
            set_clauses = []
            for attr in relationship_attributes:
                # Only add the attribute if it's not empty
                set_clauses.append(f"{attr}: CASE WHEN row.{attr} <> '' THEN SPLIT(row.{attr}, '{separator}') ELSE [] END")
            set_clause = ",\n        ".join(set_clauses)

            load_relationships_query = f"""
                CALL {{
                    LOAD CSV WITH HEADERS FROM 'file:///{os.path.basename(relationships_csv_path)}' AS row
                    MATCH (a:Node {{id: row.source}}), (b:Node {{id: row.target}})
                    CREATE (a)-[:RELATED {{
                        {set_clause}
                    }}]->(b)
                }}
                IN TRANSACTIONS OF 1000 ROWS
            """
            session.run(load_relationships_query)

            # Verify relationships have been loaded correctly
            verify_query = """
                MATCH ()-[r:RELATED]->()
                RETURN COUNT(r) AS totalRelationships
            """
            result = session.run(verify_query)
            count = result.single()["totalRelationships"]
            logger.info(f"Total relationships loaded: {count}")

        driver.close()
        logger.info("Data loaded into Neo4j successfully.")
        return True

    except Exception as e:
        logger.error(f"Error during CSV loading into Neo4j: {e}")
        return False

def main():
    # Define CSV paths
    nodes_csv = 'nodes.csv'
    relationships_csv = 'relationships.csv'

    # # 1. Convert DOT to CSV
    # logger.info("Converting DOT file to CSV files...")
    # success = dot_to_csv(DOT_FILE_PATH, nodes_csv, relationships_csv)
    # if not success:
    #     logger.error("DOT to CSV conversion failed. Exiting.")
    #     return

    # 2. Move CSV files to Neo4j import directory
    # try:
    #     # Ensure the import directory exists
    #     os.makedirs(IMPORT_DIR, exist_ok=True)

    #     # Define destination paths
    nodes_csv_dest = os.path.join(IMPORT_DIR, os.path.basename(nodes_csv))
    relationships_csv_dest = os.path.join(IMPORT_DIR, os.path.basename(relationships_csv))

    #     # Remove existing CSVs in import directory to avoid duplicates
    #     if os.path.exists(nodes_csv_dest):
    #         os.remove(nodes_csv_dest)
    #     if os.path.exists(relationships_csv_dest):
    #         os.remove(relationships_csv_dest)

        # Move CSVs
    # shutil.move(nodes_csv, nodes_csv_dest)
    # shutil.move(relationships_csv, relationships_csv_dest)
    # logger.info(f"Moved '{nodes_csv}' and '{relationships_csv}' to Neo4j import directory: '{IMPORT_DIR}'")
    # except Exception as e:
    #     logger.error(f"Error moving CSV files to import directory: {e}")
    #     return

    # 3. Load CSVs into Neo4j
    logger.info("Loading CSV files into Neo4j...")
    success = load_csvs_into_neo4j(nodes_csv_dest, relationships_csv_dest, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    if not success:
        logger.error("Loading CSVs into Neo4j failed. Exiting.")
        return

if __name__ == "__main__":
    main()
