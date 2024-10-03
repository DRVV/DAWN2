// components/GraphComponent.js
import { useEffect, useRef } from 'react';
import styles from './GraphComponent.module.css';
import { Network } from 'vis-network';

export default function GraphComponent({ graphData, onElementClick }) {
  const visJsRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (visJsRef.current && graphData) {
      const network = new Network(visJsRef.current, graphData, {
        nodes: {
          shape: 'dot',
          size: 16,
          font: {
            size: 14,
            color: '#ffffff',
          },
          borderWidth: 2,
        },
        edges: {
          width: 2,
          color: { highlight: '#ff0000' },
          arrows: {
            to: { enabled: true, scaleFactor: 1 },
          },
        },
        physics: {
          enabled: true,
        },
        interaction: {
          hover: true,
        },
      });

      networkRef.current = network;

      network.on('click', function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodePosition = network.getPositions([nodeId])[nodeId];
          const canvasPosition = network.canvasToDOM(nodePosition);

          onElementClick({
            type: 'node',
            id: nodeId,
            position: { x: canvasPosition.x, y: canvasPosition.y },
          });
        } else if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const edge = graphData.edges.find((e) => e.id === edgeId);
          if (edge) {
            const fromPos = network.getPositions([edge.from])[edge.from];
            const toPos = network.getPositions([edge.to])[edge.to];
            const midpoint = {
              x: (fromPos.x + toPos.x) / 2,
              y: (fromPos.y + toPos.y) / 2,
            };
            const canvasPosition = network.canvasToDOM(midpoint);

            onElementClick({
              type: 'edge',
              id: edgeId,
              position: { x: canvasPosition.x, y: canvasPosition.y },
            });
          }
        } else {
          // Clicked on empty space; close the panel
          onElementClick(null);
        }
      });
    }
  }, [graphData, onElementClick]);

  return (
    <div className={styles.graphContainer}>
      <div ref={visJsRef} className={styles.graphCanvas} />
    </div>
  );
}
