// pages/projects/[projectId]/batches/[batchId].js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export async function getStaticPaths() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'static', 'project');
  const projectFolders = fs.readdirSync(projectsDirectory);

  let paths = [];

  projectFolders.forEach((projectFolder) => {
    const batchesDirectory = path.join(projectsDirectory, projectFolder, 'batches');
    if (fs.existsSync(batchesDirectory)) {
      const batchFolders = fs.readdirSync(batchesDirectory);
      batchFolders.forEach((batchFolder) => {
        paths.push({
          params: {
            projectId: projectFolder,
            batchId: batchFolder,
          },
        });
      });
    }
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { projectId, batchId } = params;
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

  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  const metadata = JSON.parse(metadataContent);

  return {
    props: { projectId, batchId, metadata },
  };
}

export default function BatchPage({ projectId, batchId, metadata }) {
  return (
    <div>
      <h1>{metadata.title}</h1>
      <p>{metadata.description}</p>
      {/* Display additional data as needed */}
      <p>
        <Link href={`/projects/${projectId}`}>Back to Project</Link>
      </p>
      <p>
        <Link href="/">Back to Home</Link>
      </p>
    </div>
  );
}
