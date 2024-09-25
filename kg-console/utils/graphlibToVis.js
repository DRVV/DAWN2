export function graphlibToVis(graph) {
    const nodes = graph.nodes().map((node) => {
      const nodeData = graph.node(node);
      return {
        id: node,
        label: nodeData.label || node,
        ...nodeData,
      };
    });
  
    let edgeIdCounter = 0;
    const edges = graph.edges().map((edge) => {
      const edgeData = graph.edge(edge);
      return {
        id: edgeData.id || `edge${edgeIdCounter++}`, // Assign unique ID if not present
        from: edge.v,
        to: edge.w,
        label: edgeData.label || '',
        ...edgeData,
      };
    });
  
    return { nodes, edges };
  }
  