import streamlit as st
from streamlit_agraph import agraph, Node, Edge, Config
import networkx as nx
from neo4j import GraphDatabase, basic_auth
import logging

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def query_subgraph(user_criteria, neo4j_uri, neo4j_user, neo4j_password):
    """
    Queries Neo4j to retrieve a subgraph based on user criteria and returns it as a networkx.DiGraph.
    
    Parameters:
        user_criteria (dict): Dictionary where keys are attribute names and values are lists of acceptable values.
        neo4j_uri (str): URI for the Neo4j database.
        neo4j_user (str): Username for Neo4j authentication.
        neo4j_password (str): Password for Neo4j authentication.
    
    Returns:
        networkx.DiGraph: A directed graph representing the subgraph from Neo4j.
    """
    try:
        # Initialize the directed graph
        G = nx.DiGraph()
        
        # Connect to Neo4j
        driver = GraphDatabase.driver(neo4j_uri, auth=basic_auth(neo4j_user, neo4j_password))
        with driver.session() as session:
            # Dynamically build the WHERE clause based on user criteria
            where_clauses = []
            for attr in user_criteria.keys():
                where_clauses.append(f"ANY(val IN $criteria.{attr} WHERE val IN r.{attr})")

            # Combine all conditions with AND
            where_statement = " AND ".join(where_clauses)

            # Prepare the list of attributes to return directly (no pluralization)
            return_attributes = ", ".join([f"r.{attr} AS {attr}" for attr in user_criteria.keys()])

            # Final Cypher query
            query = f"""
                MATCH (a:Node)-[r:RELATED]->(b:Node)
                WHERE {where_statement}
                RETURN DISTINCT a.id AS from_id, a.label AS from_label,
                                b.id AS to_id, b.label AS to_label,
                                {return_attributes}
            """

            # Execute the query with parameters
            logger.info(f"Executing subgraph query with criteria: {user_criteria}")
            result = session.run(query, criteria=user_criteria)
            
            record_count = 0
            for record in result:
                record_count += 1
                from_id = record["from_id"]
                from_label = record["from_label"]
                to_id = record["to_id"]
                to_label = record["to_label"]
                
                # Add nodes with attributes if they don't exist
                if not G.has_node(from_id):
                    G.add_node(from_id, label=from_label)
                if not G.has_node(to_id):
                    G.add_node(to_id, label=to_label)
                
                # Prepare edge attributes based on user_criteria
                edge_attributes = {}
                for attr in user_criteria.keys():
                    value = record.get(attr)
                    if value is not None:
                        edge_attributes[attr] = value

                # Add edge with attributes
                G.add_edge(from_id, to_id, **edge_attributes)
            
            logger.info(f"Subgraph query returned {record_count} records.")
    
    except Exception as e:
        logger.error(f"An error occurred while querying the subgraph: {e}")
        raise
    finally:
        driver.close()

    return G

def networkx_to_streamlit_agraph(G: nx.DiGraph):
    """
    Transforms a networkx graph into nodes and edges compatible with streamlit_agraph.

    Parameters:
        G (networkx.DiGraph): The directed graph to transform.

    Returns:
        tuple: A tuple containing two lists - nodes and edges.
    """
    # Transform nodes
    nodes = []
    for node_id, data in G.nodes(data=True):
        node = Node(
            id=str(node_id),
            label=data.get('label', str(node_id)),
            size=20,  # Customize as needed
            color='lightblue',  # Customize as needed
        )
        nodes.append(node)

    # Transform edges
    edges = []
    for source, target, data in G.edges(data=True):
        # Create a label for the edge based on its attributes (optional)
        label = ", ".join([f"{k}: {v}" for k, v in data.items()]) if data else ""
        
        edge = Edge(
            source=str(source),
            target=str(target),
            label=label,
            color='gray',  # Customize as needed
        )
        edges.append(edge)

    return nodes, edges

def visualize_subgraph():
    st.header("Neo4j Subgraph Visualization with Streamlit AGraph")
    
    # Sidebar for user input
    st.sidebar.header("User Criteria")
    product = st.sidebar.multiselect("Product", options=["a", "b", "c"], default=["a", "b"])
    provider = st.sidebar.multiselect("Provider", options=["provider1", "provider2"], default=["provider2"])
    label = st.sidebar.multiselect("Label", options=["label1", "label2"], default=["label1"])

    user_criteria = {
        'product': product,
        'provider': provider,
        'label': label
    }

    # Neo4j connection details (you might want to load these from environment variables or config)
    neo4j_uri = st.sidebar.text_input("Neo4j URI", "bolt://localhost:7687")
    neo4j_user = st.sidebar.text_input("Neo4j User", "neo4j")
    neo4j_password = st.sidebar.text_input("Neo4j Password", type="password")

    if st.sidebar.button("Query Subgraph"):
        with st.spinner("Querying Neo4j and generating graph..."):
            # Query the subgraph
            G = query_subgraph(user_criteria, neo4j_uri, neo4j_user, neo4j_password)

            # Transform to streamlit_agraph format
            nodes, edges = networkx_to_streamlit_agraph(G)

            # Define the configuration for the graph visualization
            config = Config(
                width=800,
                height=600,
                directed=True,
                nodeHighlightBehavior=True,
                node={"color": "lightblue", "size": 20},
                link={"color": "gray"},
                physics=True  # Enable physics for interactive layout
            )

            # Render the graph
            agraph(
                nodes=nodes,
                edges=edges,
                config=config
            )
        st.success("Subgraph visualization complete!")

if __name__ == "__main__":
    st.set_page_config(page_title="Graph Database Visualization", layout="wide")
    visualize_subgraph()
