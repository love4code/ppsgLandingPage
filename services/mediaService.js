const sharp = require('sharp');
const Media = require('../models/Media');
const MediaStorage = require('../models/MediaStorage');

const processAndSaveImage = async (file) => {
  const imageBuffer = file.buffer;
  const originalName = file.originalname;
  const mimeType = file.mimetype;
  
  // Generate unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  
  // Process images in three sizes
  const [largeBuffer, mediumBuffer, thumbBuffer] = await Promise.all([
    sharp(imageBuffer)
      .resize(1600, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer(),
    sharp(imageBuffer)
      .resize(900, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer(),
    sharp(imageBuffer)
      .resize(400, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer()
  ]);
  
  // Get dimensions
  const [largeMeta, mediumMeta, thumbMeta] = await Promise.all([
    sharp(largeBuffer).metadata(),
    sharp(mediumBuffer).metadata(),
    sharp(thumbBuffer).metadata()
  ]);
  
  // Save to storage
  const [largeStorage, mediumStorage, thumbStorage] = await Promise.all([
    MediaStorage.create({
      data: largeBuffer,
      contentType: 'image/jpeg'
    }),
    MediaStorage.create({
      data: mediumBuffer,
      contentType: 'image/jpeg'
    }),
    MediaStorage.create({
      data: thumbBuffer,
      contentType: 'image/jpeg'
    })
  ]);
  
  // Create media record
  const media = await Media.create({
    filename,
    originalName,
    mimeType,
    sizes: {
      large: {
        storageId: largeStorage._id,
        width: largeMeta.width,
        height: largeMeta.height,
        bytes: largeBuffer.length
      },
      medium: {
        storageId: mediumStorage._id,
        width: mediumMeta.width,
        height: mediumMeta.height,
        bytes: mediumBuffer.length
      },
      thumb: {
        storageId: thumbStorage._id,
        width: thumbMeta.width,
        height: thumbMeta.height,
        bytes: thumbBuffer.length
      }
    }
  });
  
  return media;
};

module.exports = {
  processAndSaveImage
};

