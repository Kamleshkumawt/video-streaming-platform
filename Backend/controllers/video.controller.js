import upload from "../middlewares/multer.js";
import Video from "../models/video.model.js";
import {VIDEOS_DIR } from "../config/config.js";
import path from "path";
import fs from "fs";

export const uploadVideoController = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      }
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`,
      });
    }


    console.log('req.file', req.file);

    const { filename, originalname, size, mimetype } = req.file;

    try {
      const newVideo = new Video({
        filename,
        originalName: originalname,
        size,
        mimeType: mimetype,
      });

      // Save the video metadata to MongoDB
      await newVideo.save();

      console.log(`Video uploaded successfully: ${filename}`);

      res.status(201).json({
        success: true,
        message: `Video ${originalname} uploaded successfully!`,
        video: newVideo,
      });

    } catch (err) {
      console.error("Error saving video metadata:", err);
      res.status(500).json({
        success: false,
        message: "Error saving video, Please try again later.",
        error: err.message,
      });
    }

    next();
  });
};

// Get all videos (retrieve video metadata from MongoDB)
export const getAllVideosController = async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json({
      success: true,
      message: "Videos retrieved successfully",
      videos,
    });
  } catch (err) {
    console.error("Error retrieving videos:", err);
    res.status(500).json({
      success: false,
      message: "Error retrieving videos.",
      error: err.message,
    });
  }
};

// Get a specific video by filename (fetch video metadata)
export const getVideoByFilename = async (req, res) => {
  const { filename } = req.params;
  try {
    const video = await Video.findOne({ filename });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (err) {
    console.error("Error retrieving video:", err);
    res.status(500).json({
      success: false,
      message: "Error retrieving video.",
    });
  }
};

// Function to stream video with range support (for large files)
export const streamVideo = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(VIDEOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Video not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.status(206);  // Partial content response for range requests
    res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", chunkSize);
    res.setHeader("Content-Type", "video/mp4");

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  } else {
    res.status(200);  // Full content response
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Type", "video/mp4");
    fs.createReadStream(filePath).pipe(res);
  }
};