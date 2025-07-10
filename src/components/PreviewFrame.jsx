import React, { useEffect, useRef } from 'react';

const PreviewFrame = ({ code }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    }
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      title="Generated Website"
      style={{ width: '100%', height: '600px', border: '1px solid #ccc', marginTop: '1rem' }}
    />
  );
};

export default PreviewFrame;
