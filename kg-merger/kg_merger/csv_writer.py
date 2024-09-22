import networkx as nx
import csv
from pathlib import Path

# Set up your directories and file paths
graphdir = Path('graphs')
csv_dir = Path('csvs')
csv_dir.mkdir(exist_ok=True)  # Ensure the csv_dir exists
dot_file = graphdir / 'expected_graph.dot'

# Read the DOT file into a NetworkX graph
G = nx.drawing.nx_pydot.read_dot(dot_file)

# Function to clean data
def clean_data(value):
    if isinstance(value, str):
        # Remove leading and trailing quotes and whitespace
        return value.strip().strip('"')
    return value

# Paths for the output CSV files
nodes_csv = csv_dir / 'nodes.csv'
edges_csv = csv_dir / 'edges.csv'

# Write nodes to 'nodes.csv'
with nodes_csv.open('w', newline='', encoding='utf-8') as node_file:
    # Determine the node attribute fields
    node_attrs = set()
    for _, data in G.nodes(data=True):
        node_attrs.update(data.keys())
    fieldnames = ['id'] + sorted(node_attrs)

    # Configure the CSV writer to minimize quoting
    writer = csv.DictWriter(node_file, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
    writer.writeheader()

    for node_id, data in G.nodes(data=True):
        row = {'id': clean_data(node_id)}
        # Clean and update data
        row.update({k: clean_data(v) for k, v in data.items()})
        writer.writerow(row)

# Write edges to 'edges.csv'
with edges_csv.open('w', newline='', encoding='utf-8') as edge_file:
    # Determine the edge attribute fields
    edge_attrs = set()
    for _, _, data in G.edges(data=True):
        edge_attrs.update(data.keys())
    fieldnames = ['source', 'target'] + sorted(edge_attrs)

    # Configure the CSV writer to minimize quoting
    writer = csv.DictWriter(edge_file, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
    writer.writeheader()

    for source, target, data in G.edges(data=True):
        row = {
            'source': clean_data(source),
            'target': clean_data(target)
        }
        # Clean and update data
        row.update({k: clean_data(v) for k, v in data.items()})
        writer.writerow(row)
