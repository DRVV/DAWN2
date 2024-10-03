// components/GraphComponent.js

import { useEffect, useRef } from 'react';
import styles from './GraphComponent.module.css';
import { Network } from 'vis-network';

export default function GraphComponent({ graphData, onElementClick }) {
  const visJsRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (visJsRef.current && graphData) {
      const options = {
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'UD', // UD, DU, LR, RL
            sortMethod: 'directed', // hubsize, directed
            nodeSpacing: 200,
            treeSpacing: 300,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
          },
        },
        nodes: {
          shape: 'box',
          size: 16,
          font: {
            size: 14,
            //color: '#ffffff',
          },
          borderWidth: 2,
          color: {
            //background: 'cyan',//'#005bb5',
            border: '#005bb5',
            highlight: {
              //background: '#005bb5',
              border: '#003a75',
            },
          },
        },
        edges: {
          smooth: {
            //type: 'cubicBezier',
            forceDirection: 'horizontal',
            roundness: 0.4,
          },
          arrows: {
            to: { enabled: true, scaleFactor: 1 },
          },
          color: {
            color: '#848484',
            highlight: '#ff0000',
            inherit: 'from',
            opacity: 0.8,
          },
        },
        physics: false
        // {
        //   hierarchicalRepulsion: {
        //     nodeDistance: 120,
        //     centralGravity: 0.0,
        //     springLength: 100,
        //     springConstant: 0.01,
        //     damping: 0.09,
        //   },
        //   stabilization: {
        //     iterations: 1000,
        //     updateInterval: 25,
        //   },
        // }
        ,
        interaction: {
          hover: true,
          tooltipDelay: 200,
        },
      };

      // Destroy existing network if any to prevent duplicates
      if (networkRef.current) {
        networkRef.current.destroy();
      }

      const network = new Network(visJsRef.current, graphData, options);
      networkRef.current = network;

      // Inside the 'click' event handler in GraphComponent.js

      network.on('click', function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodePosition = network.getPositions([nodeId])[nodeId];
          const canvasPosition = network.canvasToDOM(nodePosition);

          console.log('Clicked Node:', nodeId);
          console.log('Canvas Position:', nodePosition);
          console.log('DOM Position:', canvasPosition);

          onElementClick({
            type: 'node',
            id: nodeId,
            position: { x: canvasPosition.x + 100, y: canvasPosition.y },
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

            console.log('Clicked Edge:', edgeId);
            console.log('From Position:', fromPos);
            console.log('To Position:', toPos);
            console.log('Midpoint Canvas Position:', midpoint);
            console.log('Midpoint DOM Position:', canvasPosition);

            onElementClick({
              type: 'edge',
              id: edgeId,
              position: { x: canvasPosition.x, y: canvasPosition.y },
            });
          }
        } else {
          // Clicked on empty space; optionally close the panel
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
