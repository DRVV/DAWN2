// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import styles from '../styles/Home.module.css'; // Import the CSS module
import Layout from '@/components/Layout';

export async function getStaticProps() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'static', 'project');
  const projectFolders = fs.readdirSync(projectsDirectory);

  let batches = [];

  projectFolders.forEach((projectFolder) => {
    const batchesDirectory = path.join(projectsDirectory, projectFolder, 'batches');

    if (fs.existsSync(batchesDirectory)) {
      const batchFolders = fs.readdirSync(batchesDirectory);

      batchFolders.forEach((batchFolder) => {
        const metadataPath = path.join(batchesDirectory, batchFolder, 'metadata.json');
        let metadata = { batchId: batchFolder };

        if (fs.existsSync(metadataPath)) {
          const metadataContent = fs.readFileSync(metadataPath, 'utf8');
          metadata = JSON.parse(metadataContent);
        }

        batches.push({
          projectId: projectFolder,
          batchId: batchFolder,
          metadata,
        });
      });
    }
  });

  return {
    props: { batches },
  };
}

export default function HomePage({ batches }) {
  return (
    <Layout>
    <div className={styles.container}>
      <h1>Knowledge Graph Management Console</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Request ID</th>
            <th>Published</th>
            <th>Review Status</th>
            <th>Reference</th>
            <th>Graph</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(({ projectId, batchId, metadata }) => (
            <tr key={`${projectId}-${batchId}`}>
              <td>
                <Link href={`/projects/${projectId}/batches/${batchId}`} className={styles.link}>
                  {metadata.batchId || `${projectId} - ${batchId}`}
                </Link>
              </td>
              <td>{metadata.requestId}</td>
              <td>{metadata.isPublished ? '✅' : '❌'}</td>
              <td>
                {metadata.isReviewed.map((reviewed, index) => (
                  <span
                    key={index}
                    className={`${styles.reviewStatus} ${
                      reviewed ? styles.approved : styles.pending
                    }`}
                  >
                    {`Party ${index + 1}: `}
                    {reviewed ? '✅' : '❌'}
                  </span>
                ))}
              </td>
              <td>
                <a
                  href={`/static/project/${projectId}/batches/${batchId}/${metadata.reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </td>
              <td>
                <a
                  href={`/static/project/${projectId}/batches/${batchId}/${metadata.graphPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Graph
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}
