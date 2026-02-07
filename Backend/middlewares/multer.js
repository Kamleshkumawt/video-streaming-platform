import multer from "multer";
import { FILE_SIZE_LIMIT, VIDEOS_DIR } from "../config/config.js";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
}).single("video");

// Middleware for handling video uploads
// export const uploadVideo = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({
//           success: false,
//           message: `File upload error: ${err.message}`,
//         });
//       }
//       return res.status(500).json({
//         success: false,
//         message: `Server error: ${err.message}`,
//       });
//     }

//     // After file upload, perform any processing (e.g., transcoding, saving metadata, etc.)
//     const filePath = path.join(VIDEOS_DIR, req.file.filename);
//     console.log(`Video uploaded successfully: ${filePath}`);

//     // Perform additional processing on the uploaded video (e.g., transcoding or metadata saving)

//     next();
//   });
// };

// export const checkVideoFileExists = (filename) => {
//   const filePath = path.join(VIDEOS_DIR, filename);
//   return fs.existsSync(filePath);
// };

// Function to stream video with range support (for large files)
// export const streamVideo = (req, res) => {
//   const filename = decodeURIComponent(req.params.filename);
//   const filePath = path.join(VIDEOS_DIR, filename);

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).send("Video not found");
//   }

//   const stat = fs.statSync(filePath);
//   const fileSize = stat.size;
//   const range = req.headers.range;

//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-");
//     const start = parseInt(parts[0], 10);
//     const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//     const chunkSize = end - start + 1;

//     res.status(206);  // Partial content response for range requests
//     res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
//     res.setHeader("Accept-Ranges", "bytes");
//     res.setHeader("Content-Length", chunkSize);
//     res.setHeader("Content-Type", "video/mp4");

//     const stream = fs.createReadStream(filePath, { start, end });
//     stream.pipe(res);
//   } else {
//     res.status(200);  // Full content response
//     res.setHeader("Content-Length", fileSize);
//     res.setHeader("Content-Type", "video/mp4");
//     fs.createReadStream(filePath).pipe(res);
//   }
// };

export default upload;