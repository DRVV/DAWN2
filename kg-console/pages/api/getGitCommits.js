// pages/api/getGitCommits.js

import simpleGit from 'simple-git';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const git = simpleGit(process.cwd());
      const log = await git.log();

      // Map commit data to a simpler structure
      const commits = log.all.map((commit) => ({
        hash: commit.hash,
        author_name: commit.author_name,
        date: commit.date,
        message: commit.message,
      }));

      res.status(200).json({ commits });
    } catch (error) {
      console.error('Error fetching git commits:', error);
      res.status(500).json({ error: 'Failed to retrieve git commits.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
