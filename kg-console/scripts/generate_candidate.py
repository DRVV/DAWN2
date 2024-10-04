# scripts/generate_candidate.py

import sys
import os

def main():
    if len(sys.argv) != 2:
        print("Usage: python generate_candidate.py <batch_directory>")
        sys.exit(1)

    batch_directory = sys.argv[1]

    # Ensure the batch directory exists
    if not os.path.isdir(batch_directory):
        print(f"Error: Batch directory '{batch_directory}' does not exist.")
        sys.exit(1)

    # Define the graph data
    graph_content = """
    digraph G {
        node1 [label="Node 1"];
        node2 [label="Node 2"];
        node3 [label="Node 3"];

        node1 -> node2 [label="Edge from Node 1 to Node 2"];
        node2 -> node3 [label="Edge from Node 2 to Node 3"];
        node3 -> node1 [label="Edge from Node 3 to Node 1"];
    }
    """

    # Write the graph data to kg_candidate.dot
    kg_candidate_path = os.path.join(batch_directory, 'kg_candidate.dot')
    with open(kg_candidate_path, 'w') as f:
        f.write(graph_content)

    print(f"kg_candidate.dot has been generated at {kg_candidate_path}")

if __name__ == '__main__':
    main()
