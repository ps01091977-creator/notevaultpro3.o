import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Download, AlertCircle, ArrowLeft } from 'lucide-react';

const PdfViewer = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title') || 'Document Viewer';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use Google Docs Viewer for reliable PDF rendering across devices
  const googleDocsViewerUrl = url ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` : '';

  useEffect(() => {
    if (!url) {
      setError(true);
      setLoading(false);
    }
  }, [url]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError(true);
    setLoading(false);
  };

  if (!url) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Document Specified</h1>
        <p className="text-muted mb-6">The document URL is missing or invalid.</p>
        <button 
          onClick={() => window.close()} 
          className="btn-primary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Close Tab
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a35] bg-[#12121a] shadow-sm z-10">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-500" />
          <h1 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-2xl" title={title}>
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => window.close()} className="btn-secondary flex items-center gap-2 hidden sm:flex">
             <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <a 
            href={url} 
            download 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] hover:bg-[#2a2a35] transition-colors rounded-lg text-sm font-medium border border-[#2a2a35]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-neutral-900 w-full h-full">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f] z-10">
            <div className="w-12 h-12 border-4 border-[#2a2a35] border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading Document...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few seconds depending on file size</p>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f] z-10 p-4 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Failed to Load Document</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              We couldn't load the document viewer. The file might be too large, restricted, or no longer available.
            </p>
            <div className="flex gap-4">
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary"
              >
                Open Directly
              </a>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-secondary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={googleDocsViewerUrl}
            title={title}
            className="w-full h-full border-none"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
