const cloudinary = require('../config/cloudinary');

function uploadImage(buffer, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            },
        );
        uploadStream.end(buffer);
    });
}

async function deleteImage(secureUrl) {
    const publicId = _extractPublicId(secureUrl);
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId);
}

function _extractPublicId(secureUrl) {
    const parts = secureUrl.split('/upload/');
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^.]+$/, '');
}

module.exports = {
    uploadImage,
    deleteImage,
};
