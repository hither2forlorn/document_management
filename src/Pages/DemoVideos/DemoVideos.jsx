import React from 'react';
import { useLocation } from 'react-router-dom';

const DemoVideos = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const videoParam = params.get("videos");

  let videoUrls = [];

  try {
    videoUrls = videoParam ? JSON.parse(videoParam) : [];
  } catch (error) {
    console.error("Invalid video list:", error);
  }

  return (
    <div style={{ 
      backgroundColor: '#f0f8ff', 
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 100, 0.1)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        color: '#0047ab', 
        borderBottom: '2px solid #4682b4',
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>Demo Videos</h1>
      {videoUrls.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          {videoUrls.map((url, index) => {
            const videoName = url.split('/').pop(); // Extract filename
            return (
              <div key={index} style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e1e4e8',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  backgroundColor: '#e1e4e8',
                  padding: '10px',
                  color: 'white'
                }}>
                  <h4 style={{ 
                    margin: '0',
                    fontSize: '14px',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{videoName}</h4>
                </div>
                <div style={{ padding: '10px', flexGrow: 1 }}>
                  <video 
                    controls 
                    style={{ 
                      width: '100%',
                      borderRadius: '4px',
                      border: '1px solid #e1e4e8'
                    }}>
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: '#3a5fcd', textAlign: 'center', fontSize: '16px' }}>No videos found</p>
      )}
    </div>
  );
}

export default DemoVideos;