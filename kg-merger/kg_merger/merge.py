import networkx as nx
import pytest
from networkx.drawing.nx_pydot import read_dot

def merge_graphs_old(graphs, attribute_separator='&&', graph_type=nx.MultiDiGraph):
    """
    Merges multiple graphs into a single graph by merging nodes with the same labels and concatenating
    edge attributes when edges are merged.

    Args:
        graphs (list of networkx.Graph): List of graphs to merge.
        attribute_separator (str): Separator to use when concatenating attributes.
        graph_type (type): The NetworkX graph type to use for the merged graph (e.g., nx.Graph, nx.DiGraph).

    Returns:
        networkx.Graph: The merged graph.
    """
    # Initialize the merged graph
    merged_graph = graph_type()

    # Helper function to merge node attributes
    def merge_node_attributes(existing_attrs, new_label, new_node_id, separator):
        """
        Merges node attributes by concatenating the UUIDs.
        """
        merged_attrs = existing_attrs.copy()
        # Concatenate the node IDs (UUIDs)
        if 'id' in merged_attrs:
            merged_attrs['id'] = f"{merged_attrs['id']}{separator}{new_node_id}"
        else:
            merged_attrs['id'] = new_node_id
        return merged_attrs

    # Merge nodes
    for G in graphs:
        for node_id, attrs in G.nodes(data=True):
            label = attrs.get('label')
            if label is None:
                raise ValueError(f"Node {node_id} does not have a 'label' attribute.")
            if label in merged_graph:
                # Node exists; merge attributes
                merged_attrs = merge_node_attributes(merged_graph.nodes[label], label, node_id, attribute_separator)
                merged_graph.nodes[label].update(merged_attrs)
            else:
                # Add new node with 'id' attribute as the UUID
                merged_graph.add_node(label, id=node_id, label=label)

    # Helper function to merge edge attributes
    def merge_edge_attributes(existing_attrs, new_attrs, separator):
        """
        Merges edge attributes by concatenating their values.
        """
        merged = existing_attrs.copy()
        for key, value in new_attrs.items():
            if key in merged:
                merged[key] = f"{merged[key]}{separator}{value}"
            else:
                merged[key] = value
        return merged

    # Merge edges
    for G in graphs:
        for u, v, key, attrs in G.edges(data=True, keys=True):
            u_label = G.nodes[u]['label']
            v_label = G.nodes[v]['label']
            # Check if an edge exists between these node labels
            if merged_graph.has_edge(u_label, v_label):
                # Since it's a MultiDiGraph, iterate through existing edges to find a match
                existing_edges = merged_graph.get_edge_data(u_label, v_label)
                # Attempt to merge with an existing edge
                merged = False
                for existing_key, existing_attrs in existing_edges.items():
                    # Here, you can define criteria for merging edges. For simplicity, we'll merge all.
                    merged_attrs = merge_edge_attributes(existing_attrs, attrs, attribute_separator)
                    merged_graph[u_label][v_label][existing_key].update(merged_attrs)
                    merged = True
                    break  # Merge with the first edge found
                if not merged:
                    # If no existing edge was merged, add as a new edge
                    merged_graph.add_edge(u_label, v_label, **attrs)
            else:
                # Add new edge
                merged_graph.add_edge(u_label, v_label, **attrs)

    return merged_graph


def merge_graphs(graphs, attribute_separator='&&', graph_type=nx.MultiDiGraph):
    """
    Merges multiple graphs into a single graph by merging nodes with the same labels and concatenating
    edge attributes when edges are merged.

    Args:
        graphs (list of networkx.Graph): List of graphs to merge.
        attribute_separator (str): Separator to use when concatenating attributes.
        graph_type (type): The NetworkX graph type to use for the merged graph (e.g., nx.Graph, nx.DiGraph).

    Returns:
        networkx.Graph: The merged graph.
    """
    # Initialize the merged graph
    merged_graph = graph_type()

    # Step 1: Group node IDs by label
    label_to_node_ids = {}
    for G in graphs:
        for node_id, attrs in G.nodes(data=True):
            label = attrs.get('label')
            if label is None:
                raise ValueError(f"Node {node_id} does not have a 'label' attribute.")
            label_to_node_ids.setdefault(label, []).append(node_id)

    # Step 2: Create merged nodes with concatenated IDs
    label_to_merged_id = {}
    for label, node_ids in label_to_node_ids.items():
        merged_id = attribute_separator.join(sorted(node_ids))  # Sort for consistency
        label_to_merged_id[label] = merged_id
        merged_graph.add_node(merged_id, label=label)

    # Step 3: Create a mapping from original node IDs to merged node IDs
    node_id_mapping = {}
    for label, node_ids in label_to_node_ids.items():
        merged_id = label_to_merged_id[label]
        for node_id in node_ids:
            node_id_mapping[node_id] = merged_id

    # Step 4: Merge edges
    for G in graphs:
        for u, v, attrs in G.edges(data=True):
            merged_u = node_id_mapping[u]
            merged_v = node_id_mapping[v]
            if merged_graph.has_edge(merged_u, merged_v):
                # Since it's a MultiDiGraph, find existing edges and merge attributes
                existing_edges = merged_graph.get_edge_data(merged_u, merged_v)
                # Merge attributes with the first existing edge found
                # Alternatively, you could decide to add a new edge or handle differently
                for existing_key in existing_edges:
                    # Merge attributes
                    for key, value in attrs.items():
                        if key in existing_edges[existing_key]:
                            existing_edges[existing_key][key] += attribute_separator + value
                        else:
                            existing_edges[existing_key][key] = value
                    break  # Merge with the first edge found
            else:
                # Add a new edge
                merged_graph.add_edge(merged_u, merged_v, **attrs)

    return merged_graph


def clean_graph(G):
    """
    Cleans node names, all node attributes, and all edge attributes by removing surrounding quotes if present.
    
    Args:
        G (networkx.Graph): The graph to clean.
    
    Returns:
        networkx.Graph: The cleaned graph.
    """
    # Remove quotes from node identifiers
    mapping = {node: node.strip('"') for node in G.nodes()}
    G = nx.relabel_nodes(G, mapping)

    # Function to strip quotes from a single value
    def strip_quotes(value):
        if isinstance(value, str):
            return value.strip('"')
        return value

    # Remove quotes from all node attributes
    for node, attrs in G.nodes(data=True):
        for key, value in attrs.items():
            attrs[key] = strip_quotes(value)

    # Remove quotes from all edge attributes
    for u, v, attrs in G.edges(data=True):
        for key, value in attrs.items():
            attrs[key] = strip_quotes(value)
    
    return G

def load_dot_files(filenames):
    """
    Loads DOT files and cleans node names and labels.
    
    Args:
        filenames (list of str): List of DOT file paths.
    
    Returns:
        list of networkx.Graph: List of cleaned NetworkX graphs.
    """
    graphs = []
    for filename in filenames:
        G = read_dot(filename)
        G = clean_graph(G)
        graphs.append(G)
    return graphs

# def test_merge_graphs():
#     # Load DOT files
#     from pathlib import Path
#     graph_dir = Path('graphs')
    
#     graph_filenames = ['graph1.dot', 'graph2.dot', 'graph3.dot']
#     graph_filenames = [graph_dir / file for file in graph_filenames]
#     graphs = load_dot_files(graph_filenames)

#     # Merge the graphs
#     merged_graph = merge_graphs(graphs, attribute_separator='&&')

#     # Expected nodes after merging
#     expected_nodes = {
#         'NodeA': {'id': 'uuid1&&uuid3', 'label': 'NodeA'},
#         'NodeB': {'id': 'uuid2&&uuid5', 'label': 'NodeB'},
#         'NodeC': {'id': 'uuid4&&uuid6', 'label': 'NodeC'},
#     }

#     # Assert that merged nodes are as expected
#     for node_label, expected_attrs in expected_nodes.items():
#         assert node_label in merged_graph.nodes, f"Node '{node_label}' not found in merged graph."
#         actual_attrs = merged_graph.nodes[node_label]
#         assert actual_attrs == expected_attrs, f"Attributes for node '{node_label}' do not match. Expected {expected_attrs}, got {actual_attrs}."

#     # Expected edges after merging
#     expected_edges = [
#         ('NodeA', 'NodeB', {'label': 'EdgeAB', 'provider': 'Provider1', 'ref': 'Ref1'}),
#         ('NodeA', 'NodeC', {'label': 'EdgeAC', 'provider': 'Provider2', 'ref': 'Ref2'}),
#         ('NodeB', 'NodeC', {
#             'label': 'EdgeBC&&EdgeBC_Duplicate',
#             'provider': 'Provider3&&Provider3_Duplicate',
#             'ref': 'Ref3&&Ref3_Duplicate'
#         }),
#     ]

#     # Assert that merged edges are as expected
#     for u, v, expected_attrs in expected_edges:
#         assert merged_graph.has_edge(u, v), f"Edge from '{u}' to '{v}' not found in merged graph."
#         # Since it's a MultiDiGraph, we need to check all edges between u and v
#         edges = merged_graph.get_edge_data(u, v)
#         assert edges is not None, f"No edge data found between '{u}' and '{v}'."
#         found = False
#         for key, attrs in edges.items():
#             # Compare relevant attributes
#             attrs_filtered = {k: v for k, v in attrs.items() if k in expected_attrs}
#             if attrs_filtered == expected_attrs:
#                 found = True
#                 break
#         assert found, f"Edge attributes between '{u}' and '{v}' do not match expected attributes. {attrs_filtered} vs {expected_attrs}"

#     print("All pytest assertions passed successfully.")


def test_merge_graphs():

    from pathlib import Path
    graphdir = Path('graphs')
    input_filenames = ['graph1.dot', 'graph2.dot', 'graph3.dot', 'graph4.dot']
    # input_filenames = ['graph1.dot', 'graph2.dot', 'graph3.dot']
    input_filenames = [graphdir/f for f in input_filenames]
    input_graphs = load_dot_files(input_filenames)

    # Load expected merged graph
    expected_filename = graphdir / 'expected_graph.dot'
    expected_graph = clean_graph(read_dot(expected_filename))

    
    # Merge the input graphs
    merged_graph = merge_graphs(input_graphs, attribute_separator='___')

    # Assert that all expected nodes are in the merged graph with correct attributes
    for node, attrs in expected_graph.nodes(data=True):
        assert node in merged_graph.nodes, f"Node '{node}' not found in merged graph."
        actual_attrs = merged_graph.nodes[node]
        assert actual_attrs == attrs, f"Attributes for node '{node}' do not match. Expected {attrs}, got {actual_attrs}."

    # Assert that all expected edges are in the merged graph with correct attributes
    for u, v, attrs in expected_graph.edges(data=True):
        assert merged_graph.has_edge(u, v), f"Edge from '{u}' to '{v}' not found in merged graph."
        # Since it's a MultiDiGraph, check if any edge between u and v has the expected attributes
        edges = merged_graph.get_edge_data(u, v)
        assert edges is not None, f"No edge data found between '{u}' and '{v}'."
        found = False
        for key, edge_attrs in edges.items():
            # Compare all attributes
            if edge_attrs == attrs:
                found = True
                break
        assert found, f"Edge attributes between '{u}' and '{v}' do not match expected attributes."

    print("All pytest assertions passed successfully.")



# def test_merge_graphs_from_file():

#     # Load input DOT files
#     from pathlib import Path
#     graphdir = Path('graphs')
#     input_filenames = ['graph1.dot', 'graph2.dot', 'graph3.dot', 'graph4.dot']
#     input_filenames = [graphdir/f for f in input_filenames]
#     input_graphs = load_dot_files(input_filenames)

#     # Load expected merged graph
#     expected_filename = graphdir / 'expected_graph.dot'
#     expected_graph = clean_graph(read_dot(expected_filename))

#     # Merge the input graphs
#     merged_graph = merge_graphs(input_graphs, attribute_separator='&&')

#     # Assert that all expected nodes are in the merged graph with correct attributes
#     for node, attrs in expected_graph.nodes(data=True):
#         assert node in merged_graph.nodes, f"Node '{node}' not found in merged graph."
#         actual_attrs = merged_graph.nodes[node]
#         assert actual_attrs == attrs, f"Attributes for node '{node}' do not match. Expected {attrs}, got {actual_attrs}."

#     # Assert that all expected edges are in the merged graph with correct attributes
#     for u, v, attrs in expected_graph.edges(data=True):
#         assert merged_graph.has_edge(u, v), f"Edge from '{u}' to '{v}' not found in merged graph."
#         # Since it's a MultiDiGraph, check if any edge between u and v has the expected attributes
#         edges = merged_graph.get_edge_data(u, v)
#         assert edges is not None, f"No edge data found between '{u}' and '{v}'."
#         found = False
#         for key, edge_attrs in edges.items():
#             # Compare relevant attributes
#             if edge_attrs == attrs:
#                 found = True
#                 break
#         assert found, f"Edge attributes between '{u}' and '{v}' do not match expected attributes."

#     print("All pytest assertions passed successfully.")


if __name__ == "__main__":
    #    test_merge_graphs()
    pass
