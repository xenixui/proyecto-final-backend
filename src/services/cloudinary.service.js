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

module.exports = {
    uploadImage,
};
