// file: SomePage.jsx
import React from 'react';
import SharepointLoader from '@/component/SharepointLoader';

function testPage() {
  // This embed URL should come from your real embed code.
  // Below is a (fake) example.
  const embedLink =
    //'https://onedrive.live.com/embed?resid=XXXXX&authkey=YYYYY&em=2';
    //'https://1drv.ms/x/c/03297dd301a3d982/EST-wgC9Fj9OgwUZWLwE82oB7VO1a4HElQnGRnmfvxVQow?e=s31Aeq'
    'https://1drv.ms/x/c/03297dd301a3d982/IQQk_sIAvRY_ToMFGVi8BPNqAaxcFgoN0BOPUmcxCOzgLOo'

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Embedded Excel from SharePoint/OneDrive</h1>
      <SharepointLoader embedUrl={embedLink} height="800" />
    </div>
  );
}

export default testPage;
