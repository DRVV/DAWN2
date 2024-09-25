// pages/api/resetToLatestCommit.js

import simpleGit from 'simple-git';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const git = simpleGit(process.cwd());

      // Get the latest commit hash
      const log = await git.log();
      const latestCommitHash = log.latest.hash;

      // Perform a hard reset to the latest commit
      // await git.reset(['--hard', latestCommitHash]);
      // const currentBranch = await git.branchLocal();
      // console.log(currentBranch.current)
      await git.checkout('kg-merger');

      res.status(200).json({ message: 'Reset to latest commit successfully.' });
    } catch (error) {
      console.error('Error resetting to latest commit:', error);
      res.status(500).json({ error: 'Failed to reset to latest commit.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
