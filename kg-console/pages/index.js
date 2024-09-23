// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

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
        let metadata = { title: batchFolder };

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
    <div>
      <h1>All Batches</h1>
      <ul>
        {batches.map(({ projectId, batchId, metadata }) => (
          <li key={`${projectId}-${batchId}`}>
            <Link href={`/projects/${projectId}/batches/${batchId}`}>
              {metadata.requestId || `${projectId} - ${batchId}`}
            </Link>
            {metadata.batchId}, 
            
            {metadata.isPublished},

            {metadata.isReviewed},

            {metadata.reference}

          </li>
        ))}
      </ul>
    </div>
  );
}
