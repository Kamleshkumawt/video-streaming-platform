import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
import { TailSpin } from 'react-loader-spinner';
import config from '../config/config';

const VideoPlayerPage = () => {
  const { filename } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch video data by filename
  const loadVideoData = async () => {
    try {
      const response = await axios.get(`/videos/${filename}`);
      setVideoData(response.data.video);
    } catch (err) {
      console.error('Error loading video:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideoData();
  }, [filename]);

  return (
   <div className="container mx-auto px-4 py-8">
  {loading ? (
    <div className="flex justify-center items-center min-h-[75vh]">
      <TailSpin height="80" width="80" color="#4fa94d" ariaLabel="loading" />
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <video
            className="w-full h-auto max-h-[70vh] object-contain"
            controls
            preload="metadata"
            // poster="/path/to/poster-image.jpg" // Optional: Add a poster image for better UX
            autoPlay
          >
            <source
              src={`${config.API_BASE_URL}/videos/stream/${videoData.filename}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
            {videoData.filename}
          </h2>
          {/* Optional: Add more metadata like duration, size, etc., if available */}
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default VideoPlayerPage;
