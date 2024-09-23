// pages/projects/[projectId]/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export async function getStaticPaths() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'static', 'project');
  const projectFolders = fs.readdirSync(projectsDirectory);

  const paths = projectFolders.map((projectFolder) => ({
    params: { projectId: projectFolder },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { projectId } = params;
  const batchesDirectory = path.join(
    process.cwd(),
    'public',
    'static',
    'project',
    projectId,
    'batches'
  );

  const batchFolders = fs.readdirSync(batchesDirectory);

  const batches = batchFolders.map((batchFolder) => {
    const metadataPath = path.join(batchesDirectory, batchFolder, 'metadata.json');
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);

    return {
      batchId: batchFolder,
      metadata,
    };
  });

  return {
    props: { projectId, batches },
  };
}

export default function ProjectPage({ projectId, batches }) {
  return (
    <div>
      <h1>Project: {projectId}</h1>
      <ul>
        {batches.map(({ batchId, metadata }) => (
          <li key={batchId}>
            <Link href={`/projects/${projectId}/batches/${batchId}`}>
              {metadata.title || batchId}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/">Back to Home</Link>
      </p>
    </div>
  );
}
