const express = require('express')
const router = express.Router()
const multer = require('multer')
const Media = require('../../models/Media')
const MediaStorage = require('../../models/MediaStorage')
const sharp = require('sharp')
const mediaService = require('../../services/mediaService')

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// List all media
router.get('/', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 })
    res.render('admin/media/list', {
      title: 'Media Library',
      layout: 'layouts/admin',
      media
    })
  } catch (error) {
    console.error('Media list error:', error)
    res
      .status(500)
      .render('errors/500', { title: 'Server Error', layout: 'layouts/admin' })
  }
})

// Upload media (single or multiple)
router.post('/upload', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadedMedia = []

    for (const file of req.files) {
      try {
        const media = await mediaService.processAndSaveImage(file)
        uploadedMedia.push(media)
      } catch (error) {
        console.error('Error processing image:', error)
        // Continue with other files
      }
    }

    res.json({ success: true, media: uploadedMedia })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// Get media image (serves resized images)
router.get('/image/:id/:size', async (req, res) => {
  try {
    const { id, size } = req.params
    const media = await Media.findById(id)

    if (!media || !['large', 'medium', 'thumb'].includes(size)) {
      return res.status(404).send('Image not found')
    }

    const storageId = media.sizes[size].storageId
    const storage = await MediaStorage.findById(storageId)

    if (!storage) {
      return res.status(404).send('Image not found')
    }

    res.contentType(storage.contentType)
    res.send(storage.data)
  } catch (error) {
    console.error('Get image error:', error)
    res.status(500).send('Error loading image')
  }
})

// Update media title and alt
router.post('/:id/update', async (req, res) => {
  try {
    const { title, alt } = req.body
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { title, alt },
      { new: true }
    )
    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }
    res.json({ success: true, media })
  } catch (error) {
    console.error('Update media error:', error)
    res.status(500).json({ error: 'Error updating media' })
  }
})

// Delete media
router.post('/:id/delete', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }

    // Check if media is referenced
    const Product = require('../../models/Product')
    const PortfolioPost = require('../../models/PortfolioPost')
    const Setting = require('../../models/Setting')

    const [productRefs, portfolioRefs, settingRefs] = await Promise.all([
      Product.countDocuments({ mediaIds: media._id }),
      PortfolioPost.countDocuments({ mediaIds: media._id }),
      Setting.countDocuments({
        $or: [{ logoMediaId: media._id }, { 'hero.heroMediaId': media._id }]
      })
    ])

    if (productRefs > 0 || portfolioRefs > 0 || settingRefs > 0) {
      return res.status(400).json({
        error:
          'Cannot delete: Media is referenced in products, portfolio, or settings'
      })
    }

    // Delete storage records
    await Promise.all([
      MediaStorage.findByIdAndDelete(media.sizes.large.storageId),
      MediaStorage.findByIdAndDelete(media.sizes.medium.storageId),
      MediaStorage.findByIdAndDelete(media.sizes.thumb.storageId)
    ])

    // Delete media record
    await Media.findByIdAndDelete(media._id)

    res.json({ success: true })
  } catch (error) {
    console.error('Delete media error:', error)
    res.status(500).json({ error: 'Error deleting media' })
  }
})

module.exports = router
