import upload from "../middlewares/multer.js";
import Video from "../models/video.model.js";
import {VIDEOS_DIR } from "../config/config.js";
import path from "path";
import fs from "fs";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport for production: new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

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

      // console.log(`Video uploaded successfully: ${filename}`);

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

// Get all videos
export const getAllVideosController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find().skip(skip).limit(limit).sort({ uploadedAt: -1 });
    const total = await Video.countDocuments();

    res.status(200).json({
      success: true,
      message: "Videos retrieved successfully",
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error("Error retrieving videos", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Error retrieving videos.",
    });
  }
};

// Get a specific video by filename
export const getVideoByFilename = async (req, res) => {
  const { filename } = req.params;

  if (!filename || /[^a-zA-Z0-9._-]/.test(filename)) {
    return res.status(400).json({
      success: false,
      message: "Invalid filename.",
    });
  }

  try {
    const video = await Video.findOne({ filename });
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (err) {
    logger.error("Error retrieving video", { error: err.message, filename });
    res.status(500).json({
      success: false,
      message: "Error retrieving video.",
    });
  }
}

export const streamVideo = async (req, res) => {
  const { filename } = req.params;

  if (!filename || /[^a-zA-Z0-9._-]/.test(filename)) {
    return res.status(400).send("Invalid filename.");
  }

  try {
    const video = await Video.findOne({ filename });
    if (!video) {
      return res.status(404).send("Video not found.");
    }

    const filePath = path.resolve(VIDEOS_DIR, filename); // Safe path resolution

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Video file not found.");
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", video.mimeType); // Use stored MIME type

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return res.status(416).send("Range not satisfiable.");
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", chunkSize);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on("error", (err) => {
        logger.error("Error streaming video", { error: err.message, filename });
        res.status(500).send("Error streaming video.");
      });
      stream.pipe(res);
    } else {
      res.status(200);
      res.setHeader("Content-Length", fileSize);
      const stream = fs.createReadStream(filePath);
      stream.on("error", (err) => {
        logger.error("Error streaming video", { error: err.message, filename });
        res.status(500).send("Error streaming video.");
      });
      stream.pipe(res);
    }
  } catch (err) {
    logger.error("Error in streamVideo", { error: err.message, filename });
    res.status(500).send("Server error.");
  }
};