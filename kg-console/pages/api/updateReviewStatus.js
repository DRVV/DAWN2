// pages/api/updateReviewStatus.js

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { projectId, batchId, partyNumber } = req.body;

    const metadataPath = path.join(
      process.cwd(),
      'public',
      'static',
      'project',
      projectId,
      'batches',
      batchId,
      'metadata.json'
    );

    try {
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);

      const index = parseInt(partyNumber, 10) - 1; // Convert to zero-based index

      if (metadata.isReviewed && index >= 0 && index < metadata.isReviewed.length) {
        metadata.isReviewed[index] = true;

        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        res.status(200).json({ message: 'Review status updated successfully.' });
      } else {
        res.status(400).json({ error: 'Invalid party number.' });
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
