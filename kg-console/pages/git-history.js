// pages/git-history.js


import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import styles from '../styles/GitHistory.module.css';
import { Network } from 'vis-network';

export default function GitHistoryPage() {
  // State to hold commit data
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    // Fetch commit history from the server
    const fetchCommits = async () => {
      try {
        const response = await fetch('/api/getGitCommits');
        const data = await response.json();
        console.log('Fetched commits:', data.commits)
        setCommits(data.commits);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching commit history:', error);
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  // ...rest of the component
  const [selectedCommit, setSelectedCommit] = useState(null);
  const graphRef = useRef(null);
  const networkInstanceRef = useRef(null);

  useEffect(() => {
    if (!loading && commits.length > 0 && graphRef.current) {
      // Prepare data for vis.js
      console.log('Initializing vis.js network'); // Add this line
      // const nodes = commits.map((commit, index) => ({
      //   id: index,
      //   label: commit.message,
      //   title: `Author: ${commit.author_name}\nDate: ${commit.date}`,
      // }));

      const nodes = commits.map((commit, index) => ({
        id: index,
        label: `Author: ${commit.author_name}\nDate: ${new Date(commit.date).toLocaleString()}\n\n${commit.message}`,
        title: `Commit Hash: ${commit.hash}`,
        shape: 'box',
        widthConstraint: {
          maximum: 250,
        },
        heightConstraint: {
          maximum: 150,
        },
        font: {
          face: 'monospace',
          align: 'left',
          size: 12,
        },
      }));


      const edges = [];
      for (let i = 0; i < commits.length - 1; i++) {
        edges.push({
          from: i + 1,
          to: i,
          arrows: {
            to: {
              enabled: true,
              type: 'arrow',
            },
          },
        });
      }


      const data = { nodes, edges };
      const options = {
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'LR', // Left to Right
            sortMethod: 'directed',
            nodeSpacing: 250,
            levelSeparation: 300,
          },
        },
        edges: {
          smooth: {
            type: 'cubicBezier',
            forceDirection: 'horizontal',
            roundness: 0.4,
          },
        },
        nodes: {
          shape: 'box',
        },
        physics: {
          enabled: false,
        },
        interaction: {
          navigationButtons: true,
          keyboard: true,
        },
      };

      const network = new Network(graphRef.current, data, options);
      networkInstanceRef.current = network;

      network.on('click', function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedCommit(commits[nodeId]);
        } else {
          setSelectedCommit(null);
        }
      });
    } else {
      console.log('Conditions not met for initializing network'); // Add this line
      console.log('Loading:', loading);
      console.log('Commits length:', commits.length);
      console.log('graphRef.current:', graphRef.current);
    }
  }, [loading, commits]);

  const handleRollback = async () => {
    if (confirm('Are you sure you want to roll back to this commit?')) {
      try {
        const response = await fetch('/api/rollbackToCommit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ commitHash: selectedCommit.hash }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('Successfully rolled back to the selected commit.');
          // Optionally reload the page or navigate to the home page
          router.reload();
        } else {
          alert('Failed to roll back: ' + data.error);
        }
      } catch (error) {
        console.error('Error rolling back:', error);
        alert('An error occurred while rolling back.');
      }
    }
  };

  const handleResetToLatest = async () => {
    if (confirm('Are you sure you want to reset to the latest commit?')) {
      try {
        const response = await fetch('/api/resetToLatestCommit', {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok) {
          alert('Successfully reset to the latest commit.');
          router.reload();
        } else {
          alert('Failed to reset: ' + data.error);
        }
      } catch (error) {
        console.error('Error resetting:', error);
        alert('An error occurred while resetting.');
      }
    }
  };


  return (
    <Layout>
      <h1 className={styles.heading}>Git Commit History</h1>
      {loading ? (
        <p>Loading commit history...</p>
      ) : (
        // Visualization will go here
        <div>
          <div ref={graphRef} id="commit-history-graph" className={styles.graphContainer}></div>
          {selectedCommit && (
            <div className={styles.commitDetails}>
              <h3>Selected Commit Details</h3>
              <p>
                <strong>Hash:</strong> {selectedCommit.hash}
              </p>
              <p>
                <strong>Author:</strong> {selectedCommit.author_name}
              </p>
              <p>
                <strong>Date:</strong> {selectedCommit.date}
              </p>
              <p>
                <strong>Message:</strong> {selectedCommit.message}
              </p>
              <button onClick={handleRollback} className={styles.button}>
                Roll Back to This Commit
              </button>
            </div>
          )}
          <button onClick={handleResetToLatest} className={styles.button}>
            Reset to Latest Commit
          </button>
        </div>


      )}
    </Layout>
  );

}
