import path from 'path';

export const VIDEOS_DIR = path.join(process.cwd(), 'videos');

export const FILE_SIZE_LIMIT = 500 * 1024 * 1024;  // 500MB

export const SUPPORTED_EXTENSIONS = ['.mp4', '.webm', '.avi'];

export const VIDEO_FORMAT = 'mp4';
