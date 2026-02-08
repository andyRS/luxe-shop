import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/authMiddleware.js';
import { cloudinary, upload } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se envió ninguna imagen' });
  }

  // Cloudinary devuelve la URL en req.file.path
  res.json({
    message: 'Imagen subida correctamente',
    url: req.file.path,
    public_id: req.file.filename,
  });
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private/Admin
router.delete('/upload/:public_id', protect, admin, async (req, res) => {
  try {
    const { public_id } = req.params;
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.json({ message: 'Imagen eliminada correctamente' });
    } else {
      res.status(400).json({ message: 'No se pudo eliminar la imagen' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manejo de errores de Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'La imagen no puede exceder 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
