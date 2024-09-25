// pages/api/rollbackToCommit.js

import simpleGit from 'simple-git';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { commitHash } = req.body;

    try {
      const git = simpleGit(process.cwd());

      // Perform a hard reset to the specified commit
      //await git.reset(['--hard', commitHash]);
      await git.checkout(commitHash, (err) => {
        if (err) {
            console.error('Failed to checkout:', err);

        } else {
            console.log('Successfully checked out.')
        }
      });

      res.status(200).json({ message: 'Rolled back to commit successfully.' });
    } catch (error) {
      console.error('Error rolling back to commit:', error);
      res.status(500).json({ error: 'Failed to roll back to commit.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
