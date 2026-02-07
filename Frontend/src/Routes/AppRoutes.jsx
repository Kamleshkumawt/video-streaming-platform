import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../screens/Dashboard";
import VideoUpload from "../screens/VideoUpload";
import VideoPlayerPage from "../screens/VideoPlayerPage";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/upload-video" element={<VideoUpload/>} />
         <Route path="/video/:filename" element={<VideoPlayerPage/>} />
      </Routes>
    </>
  );
};

export default AppRoutes;
