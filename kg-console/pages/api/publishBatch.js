// pages/api/publishBatch.js

import fs from 'fs';
import path from 'path';
import { Graph } from 'graphlib';
import { write } from 'graphlib-dot';

const { exec } = require('child_process'); // for executing git commands

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { projectId, batchId, kgCandidateDataState, commentMessage } = req.body;

    const projectsDirectory = path.join(
      process.cwd(),
      'public',
      'static',
      'project',
    );
    const batchDirectory = path.join(
      process.cwd(),
      'public',
      'static',
      'project',
      projectId,
      'batches',
      batchId
    );

    const metadataPath = path.join(batchDirectory, 'metadata.json');
    const kgPublishedDotPath = path.join(projectsDirectory, 'merged_graph.dot');

    try {
      // Update isPublished status in metadata.json
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);

      metadata.isPublished = true;
      metadata.commentMessage = commentMessage; // Save the comment

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Convert kgCandidateDataState back to graphlib graph
      const graph = new Graph({ directed: true });

      // Add nodes
      kgCandidateDataState.nodes.forEach((node) => {
        graph.setNode(node.id, node);
      });

      // Add edges
      kgCandidateDataState.edges.forEach((edge) => {
        graph.setEdge(edge.from, edge.to, edge);
      });

      // Convert graphlib graph to DOT format
      const dotContent = write(graph);

      // Write DOT content to kg_published.dot
      fs.writeFileSync(kgPublishedDotPath, dotContent);

      // ** Execute Git Commands **
      // Sanitize the commentMessage to prevent command injection
      const sanitizedComment = commentMessage.replace(/"/g, '\\"');

      // Change directory to your project root where .git directory is located
      
      
  
      // Construct the shell command
      const gitCommands = `
        cd "${projectsDirectory}" && \
        git add merged_graph.dot && \
        cd "${batchDirectory}" && \
        git add metadata.json '*.dot' &&\
        git commit -m "[KG_UPDATE] ${sanitizedComment}"
      `;
      exec(gitCommands, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing git commands: ${error}`);
          return res.status(500).json({ error: 'Failed to execute git commands.' });
        }
        console.log(`Git output: ${stdout}`);
        console.error(`Git errors: ${stderr}`);

        // Respond to the client after git commands have executed
        res.status(200).json({ message: 'Batch published, graph saved, and git commit successful.' });
      });
      
    } catch (error) {
      console.error('Error publishing batch:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
