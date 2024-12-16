// lib/getAllBatches.js
import fs from 'fs';
import path from 'path';

export function getAllBatches() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'static', 'project');

  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const projectFolders = fs.readdirSync(projectsDirectory);
  let batches = [];

  projectFolders.forEach((projectFolder) => {
    const projectPath = path.join(projectsDirectory, projectFolder);
    const batchesDirectory = path.join(projectPath, 'batches');

    // Read project-level metadata
    const projectMetadataPath = path.join(projectPath, 'metadata.json');
    let projectMetadata = {};
    if (fs.existsSync(projectMetadataPath)) {
      try {
        const projectMetadataContent = fs.readFileSync(projectMetadataPath, 'utf8');
        projectMetadata = JSON.parse(projectMetadataContent);
      } catch (error) {
        console.error(`Error parsing ${projectMetadataPath}:`, error);
      }
    }

    let projectMetadataLastModified = null;
    if (fs.existsSync(projectMetadataPath)) {
      try {
        const stats = fs.statSync(projectMetadataPath);
        projectMetadataLastModified = stats.mtime;
      } catch (error) {
        console.error(`Error getting stats for ${projectMetadataPath}:`, error);
      }
    }

    if (fs.existsSync(batchesDirectory)) {
      const batchFolders = fs.readdirSync(batchesDirectory);
      batchFolders.forEach((batchFolder) => {
        const batchMetadataPath = path.join(batchesDirectory, batchFolder, 'metadata.json');
        let batchMetadata = { batchId: batchFolder };

        if (fs.existsSync(batchMetadataPath)) {
          try {
            const metadataContent = fs.readFileSync(batchMetadataPath, 'utf8');
            batchMetadata = { ...batchMetadata, ...JSON.parse(metadataContent) };
          } catch (error) {
            console.error(`Error parsing ${batchMetadataPath}:`, error);
          }
        }

        const originalFilename = projectMetadata.originalFilename || 'N/A';

        batches.push({
          projectId: projectFolder,
          batchId: batchFolder,
          batchMetadata,
          projectMetadata: {
            provider: projectMetadata.provider || 'N/A',
            productName: projectMetadata.productName || 'N/A',
            originalFilename,
            projectMetadataLastModified: projectMetadataLastModified
              ? projectMetadataLastModified.toISOString()
              : 'N/A',
          },
        });
      });
    }
  });

  // Sort all batches by projectId first, then by batchId
  batches.sort((a, b) => {
    const projCompare = a.projectId.localeCompare(b.projectId);
    if (projCompare !== 0) return projCompare;
    return a.batchId.localeCompare(b.batchId);
  });

  return batches;
}
