import React from "react";
import { useEffect } from "react";
import Graph, { DirectedGraph } from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import random from 'graphology-layout/random'
import { assign } from "sigma/utils";
import { parse } from 'graphology-gexf/browser'

const sigmaStyle = { height: "500px", width: "500px" };

// Component that load the graph
export const LoadGraph = () => {
    const loadGraph = useLoadGraph();

    useEffect(() => {
        fetch('/graph/test.gexf')
            .then(
                response => response.text()
            ).then(
                gexf => {
                    const graph = parse(DirectedGraph, gexf);
                    random.assign(graph);
                    loadGraph(graph);
                    assign();
                }
        )
        /* const graph = new Graph();
        graph.addNode("first", { x: 0, y: 0, size: 15, label: "My first node", color: "#FA4F40" });
        loadGraph(graph); */
    }, [loadGraph]);

    return null;
};

// Component that display the graph
export const DisplayGraph = () => {
    return (
        <SigmaContainer style={sigmaStyle}>
            <LoadGraph />
        </SigmaContainer>
    );
};