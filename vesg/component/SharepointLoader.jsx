// file: SharePointExcelIframe.jsx
import React from 'react';

function SharepointLoader({ embedUrl, width = '100%', height = '600' }) {
  if (!embedUrl) {
    return <p>No embed URL provided.</p>;
  }

  return (
    <iframe
      src={embedUrl}
      width={width}
      height={height}
      frameBorder="0"
      style={{ border: 'none' }}
      scrolling="no"
      allowFullScreen={true}
    />
  );
}

export default SharepointLoader;
