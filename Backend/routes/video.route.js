import { Router } from "express";
import { getAllVideosController, getVideoByFilename, streamVideo, uploadVideoController } from "../controllers/video.controller.js";
import { handleValidationErrors } from "../middlewares/validateRequest.middleware.js";
import { body, param } from "express-validator";

const router = Router();

router.post("/upload/video", uploadVideoController);

router.get(
  "/all/videos",
  [
    body("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  ],
  handleValidationErrors,
  getAllVideosController
);

router.get(
  "/videos/:filename",
  [
    param("filename")
      .isString()
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage("Filename contains invalid characters"),
  ],
  handleValidationErrors,
  getVideoByFilename
);

router.get(
  "/videos/stream/:filename",
  [
    param("filename")
      .isString()
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage("Filename contains invalid characters"),
  ],
  handleValidationErrors,
  streamVideo
);

export default router;
