// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/Home.module.css'; // Import the CSS module
import Layout from '@/components/Layout';

export async function getStaticProps() {
  const projectsDirectory = path.join(process.cwd(), 'public', 'static', 'project');

  // Check if the projects directory exists
  if (!fs.existsSync(projectsDirectory)) {
    return {
      props: { batches: [] },
    };
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

    // Get last modified date of project metadata.json
    let projectMetadataLastModified = null;
    if (fs.existsSync(projectMetadataPath)) {
      try {
        const stats = fs.statSync(projectMetadataPath);
        projectMetadataLastModified = stats.mtime;
      } catch (error) {
        console.error(`Error getting stats for ${projectMetadataPath}:`, error);
      }
    }

    // Check if the batches directory exists
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

        // Get originalFilename from project metadata.json
        let originalFilename = 'N/A';
        if (projectMetadata.originalFilename) {
          originalFilename = projectMetadata.originalFilename;
        }

        batches.push({
          projectId: projectFolder,
          batchId: batchFolder,
          batchMetadata,
          projectMetadata: {
            provider: projectMetadata.provider || 'N/A',
            productName: projectMetadata.productName || 'N/A',
            originalFilename: originalFilename,
            projectMetadataLastModified: projectMetadataLastModified
              ? projectMetadataLastModified.toISOString()
              : 'N/A',
          },
        });
      });
    }
  });

  return {
    props: { batches },
  };
}

export default function HomePage({ batches }) {
  // State for filtering
  const [filter, setFilter] = useState({
    publishedDate: '',
    provider: '',
    productName: '',
  });

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters to batches
  const filteredBatches = batches.filter((batch) => {
    const { batchMetadata, projectMetadata } = batch;

    // Published Date Filter
    const matchesPublishedDate = filter.publishedDate
      ? batchMetadata.publishedDate &&
        formatDate(batchMetadata.publishedDate) === filter.publishedDate
      : true;

    // Provider Filter
    const matchesProvider = filter.provider
      ? projectMetadata.provider.toLowerCase().includes(filter.provider.toLowerCase())
      : true;

    // Product Name Filter
    const matchesProductName = filter.productName
      ? projectMetadata.productName.toLowerCase().includes(filter.productName.toLowerCase())
      : true;

    return matchesPublishedDate && matchesProvider && matchesProductName;
  });

  // Helper function to truncate text
  const truncate = (str, maxLength) => {
    if (!str) return 'N/A';
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  };

  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-US');
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Apply the .heading class */}
        <h1 className={styles.heading}>Knowledge Graph Management Console</h1>

        {/* Filtering UI */}
        <div className={styles.filterContainer}>
          <label>
            Published Date:
            <input
              type="date"
              name="publishedDate"
              value={filter.publishedDate}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </label>

          <label>
            Provider:
            <input
              type="text"
              name="provider"
              value={filter.provider}
              onChange={handleFilterChange}
              placeholder="Provider name"
              className={styles.filterInput}
            />
          </label>

          <label>
            Product Name:
            <input
              type="text"
              name="productName"
              value={filter.productName}
              onChange={handleFilterChange}
              placeholder="Product name"
              className={styles.filterInput}
            />
          </label>

          {/* Add more filter inputs as needed */}
        </div>

        {/* Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              {/* Removed Batch Column */}
              <th>Request ID</th>
              <th>Published Date</th>
              <th>Comment</th>
              <th>Reviewer</th>
              <th>Provider</th>
              <th>Product Name</th>
              <th>Project Metadata Last Modified</th>
              <th>Original Filename</th>
              <th>Is Published</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length > 0 ? (
              filteredBatches.map(({ projectId, batchId, batchMetadata, projectMetadata }) => (
                <tr key={`${projectId}-${batchId}`}>
                  {/* Request ID with Link */}
                  <td>
                    <Link href={`/projects/${projectId}/batches/${batchId}`} className={styles.link}>
                      {batchMetadata.requestId || 'N/A'}
                    </Link>
                  </td>
                  <td>{formatDate(batchMetadata.publishedDate)}</td>
                  <td>{truncate(batchMetadata.commentMessage, 50)}</td>
                  <td>{batchMetadata.reviewer || 'N/A'}</td>
                  <td>{projectMetadata.provider}</td>
                  <td>{projectMetadata.productName}</td>
                  <td>
                    {projectMetadata.projectMetadataLastModified !== 'N/A'
                      ? formatDate(projectMetadata.projectMetadataLastModified)
                      : 'N/A'}
                  </td>
                  <td>{projectMetadata.originalFilename}</td>
                  <td>
                    {batchMetadata.isPublished !== undefined ? (
                      batchMetadata.isPublished ? '✅' : '❌'
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {batchMetadata.reference ? (
                      <a
                        href={`/static/project/${projectId}/batches/${batchId}/${batchMetadata.reference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        Download
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                  No batches found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
