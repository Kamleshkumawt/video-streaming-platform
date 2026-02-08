import React, { useState } from "react";
import axios from "../config/axios";
import { Link, useNavigate } from "react-router-dom";

const VideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setProgress(0);
    setUploading(true);

    const formData = new FormData(e.target);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setProgress(Math.round(progress)); // Update progress state
          }
        },
      };

      const response = await axios.post("/upload/video", formData, config);

      if (response.status === 201) {
        setSuccessMessage("Video uploaded successfully!");
      } else {
        setErrorMessage("Error uploading video. Please try again.");
      }
      setTimeout(()=>{
        navigate("/");
      },1000)
    } catch (error) {
      console.error("Error during video upload:", error);
      setErrorMessage("Unexpected error occurred. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Upload Video
          </h1>
          <form
            id="upload-form"
            onSubmit={handleFormSubmit}
            className="space-y-4"
          >
            <div className="flex flex-col items-center">
              <label
                htmlFor="video-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-6 w-full text-center transition-colors duration-200"
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload a video file
                </span>
                <input
                  id="video-upload"
                  type="file"
                  name="video"
                  accept="video/*"
                  required
                  className="hidden"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className={`w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>

          {uploading && (
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600">
                {progress}%
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
              {errorMessage}
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
