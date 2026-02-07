import { Router } from "express";
import { getAllVideosController, getVideoByFilename, streamVideo, uploadVideoController } from "../controllers/video.controller.js";

const router = Router();

router.post("/upload/video", uploadVideoController);

router.get("/all/videos", getAllVideosController);

router.get("/videos/:filename", getVideoByFilename);

router.get("/videos/stream/:filename", streamVideo);

export default router;
