import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { TailSpin } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import config from '../config/config';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideos = async (retries = 3) => {
    try {
      const response = await axios.get('/all/videos');
      console.log(response.data.videos);
      setVideos(response.data.videos);
      setError(null);
    } catch (err) {
      console.error('Error loading videos:', err);
      if (retries > 0) {
        console.log(`Retrying... attempts left: ${retries}`);
        setTimeout(() => loadVideos(retries - 1), 1000);
      } else {
        setError('Failed to load videos. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Handle video play on hover (using event target for multiple videos)
  // const handleMouseEnter = (videoElement) => {
  //   if (videoElement) {
  //     videoElement.play().catch((err) => console.warn('Autoplay prevented:', err));
  //   }
  // };

  // const handleMouseLeave = (videoElement) => {
  //   if (videoElement) {
  //     videoElement.pause();
  //     videoElement.currentTime = 0;
  //   }
  // };

  const renderVideos = () => {
    if (videos.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No videos available. <Link to="/upload-video" className="text-blue-600 hover:underline">Upload one now</Link>.</p>
        </div>
      );
    }

    return videos.map((video) => (
      <div
        className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
        key={video.filename}
      >
        <Link to={`/video/${video.filename}`} className="block">
          <div className="relative aspect-video overflow-hidden">
            <video
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              muted
              preload="metadata"
            //   onMouseEnter={(e) => handleMouseEnter(e.target)}
            //   onMouseLeave={(e) => handleMouseLeave(e.target)}
              // poster="/path/to/default-poster.jpg" // Optional: Add a default poster image
            >
              <source
                src={`${config.API_BASE_URL}/videos/stream/${video.filename}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
           
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
           
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/80 rounded-full p-3">
                <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
              {video.filename}
            </h2>
            {/* Optional: Add metadata like duration if available in video object */}
            {video.duration && (
              <p className="text-sm text-gray-500 mt-1">{video.duration}</p>
            )}
          </div>
        </Link>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Video Dashboard</h1>
          <Link
            to="/upload-video"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Upload New Video
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[75vh]">
            <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  loadVideos();
                }}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderVideos()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;