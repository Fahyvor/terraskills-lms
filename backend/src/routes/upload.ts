import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { videoUpload, imageUpload } from '../middleware/upload.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const uploadRouter = Router();

// Wrapper helper to catch Multer errors (file size limits, mime filter rejects)
function handleMulter(uploadMiddleware: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size limit exceeded. Please upload a smaller file.' });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || 'File upload failed.' });
      }
      next();
    });
  };
}

// Upload video endpoint (Instructors & Admins only)
uploadRouter.post(
  '/video',
  authenticateToken,
  requireRole(['instructor', 'admin']),
  handleMulter(videoUpload.single('video')),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided.' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    return res.status(201).json({
      message: 'Video uploaded successfully',
      url: videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
    });
  }
);

// Upload thumbnail endpoint (Instructors & Admins only)
uploadRouter.post(
  '/thumbnail',
  authenticateToken,
  requireRole(['instructor', 'admin']),
  handleMulter(imageUpload.single('image')),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const imageUrl = `/uploads/thumbnails/${req.file.filename}`;

    return res.status(201).json({
      message: 'Thumbnail uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  }
);

