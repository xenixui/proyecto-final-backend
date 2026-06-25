const multer = require('multer');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
        return;
    }
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP'));
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
    },
});

const uploadArticleImages = upload.array('images', MAX_FILES);
const uploadProfilePhoto = upload.single('photo');

function handleUploadErrors(err, _req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'El archivo supera el tamaño máximo permitido (5 MB)',
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Demasiadas imágenes. Máximo 5 por solicitud',
            });
        }
        return res.status(400).json({ message: err.message });
    }

    if (err) {
        return res.status(400).json({ message: err.message });
    }

    next();
}

module.exports = {
    uploadArticleImages,
    uploadProfilePhoto,
    handleUploadErrors,
};
