// pages/api/generateCandidateGraph.js

import { exec } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { projectId, batchId } = req.body;

    // Construct the path to the batch directory
    const batchDirectory = path.join(
      process.cwd(),
      'public',
      'static',
      'project',
      projectId,
      'batches',
      batchId
    );

    // Sanitize inputs (basic example)
    if (
      !/^[a-zA-Z0-9_-]+$/.test(projectId) ||
      !/^[a-zA-Z0-9_-]+$/.test(batchId)
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid projectId or batchId' });
    }

    console.log(`processing ${batchId}`)

    // Define the command to execute the Python script
    // Adjust the script path and arguments as needed
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_candidate.py');
    const command = `python "${scriptPath}" "${batchDirectory}"`;

    try {
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
          }
          console.log(`Python script stdout: ${stdout}`);

          // Resolve the promise when execution is successful
          resolve();
        });
      });

      // Send a success response after the script has executed
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
