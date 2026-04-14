const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp'
]);

async function saveUploadedImage(file, uploadRoot) {
    if (!file)
        throw new Error('No file');

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype))
        throw new Error('Invalid file type');

    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext))
        throw new Error('Invalid file extension');

    if (!fs.existsSync(uploadRoot))
        fs.mkdirSync(uploadRoot, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const savePath = path.join(uploadRoot, filename);

    await file.mv(savePath);

    return {
        filename,
        publicPath: `/uploads/${filename}`
    };
}

module.exports = {
    saveUploadedImage
};