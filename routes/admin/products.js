const express = require('express')
const router = express.Router()
const Product = require('../../models/Product')
const Media = require('../../models/Media')
const { body, validationResult } = require('express-validator')

// List all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.render('admin/products/list', {
      title: 'Products',
      layout: 'layouts/admin',
      products
    })
  } catch (error) {
    console.error('Products list error:', error)
    res
      .status(500)
      .render('errors/500', { title: 'Server Error', layout: 'layouts/admin' })
  }
})

// Create product form
router.get('/new', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 }).limit(50)
    res.render('admin/products/form', {
      title: 'New Product',
      layout: 'layouts/admin',
      product: null,
      media
    })
  } catch (error) {
    console.error('New product form error:', error)
    res
      .status(500)
      .render('errors/500', { title: 'Server Error', layout: 'layouts/admin' })
  }
})

// Edit product form
router.get('/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('mediaIds')
    if (!product) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        layout: 'layouts/admin'
      })
    }

    const media = await Media.find().sort({ createdAt: -1 }).limit(50)
    res.render('admin/products/form', {
      title: 'Edit Product',
      layout: 'layouts/admin',
      product,
      media
    })
  } catch (error) {
    console.error('Edit product form error:', error)
    res
      .status(500)
      .render('errors/500', { title: 'Server Error', layout: 'layouts/admin' })
  }
})

// Create/Update product
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('shortDescription').optional().trim(),
    body('description').optional().trim(),
    body('price')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('featured').optional(),
    body('published').optional()
  ],
  async (req, res) => {
    const errors = validationResult(req)

    try {
      const mediaIds = Array.isArray(req.body.mediaIds)
        ? req.body.mediaIds
        : req.body.mediaIds
        ? [req.body.mediaIds]
        : []

      // Parse sizes from comma-separated or array
      let sizes = []
      if (req.body.sizes) {
        if (Array.isArray(req.body.sizes)) {
          sizes = req.body.sizes.filter(s => s.trim())
        } else {
          sizes = req.body.sizes
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        }
      }

      const productData = {
        name: req.body.name,
        shortDescription: req.body.shortDescription || '',
        description: req.body.description || '',
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        featured: req.body.featured === 'on' || req.body.featured === true,
        published: req.body.published === 'on' || req.body.published === true,
        mediaIds: mediaIds.map(id => id).filter(Boolean),
        sizes: sizes,
        seo: req.body.seo || {}
      }

      if (req.body.id) {
        // Update
        if (!errors.isEmpty()) {
          const product = await Product.findById(req.body.id).populate(
            'mediaIds'
          )
          const media = await Media.find().sort({ createdAt: -1 }).limit(50)
          return res.render('admin/products/form', {
            title: 'Edit Product',
            layout: 'layouts/admin',
            product,
            media,
            errors: errors.array()
          })
        }

        const existingProduct = await Product.findById(req.body.id)
        Object.assign(existingProduct, productData)
        await existingProduct.save()
        req.session.flash = {
          type: 'success',
          message: 'Product updated successfully'
        }
        res.redirect('/admin/products')
      } else {
        // Create
        if (!errors.isEmpty()) {
          const media = await Media.find().sort({ createdAt: -1 }).limit(50)
          return res.render('admin/products/form', {
            title: 'New Product',
            layout: 'layouts/admin',
            product: productData,
            media,
            errors: errors.array()
          })
        }

        const newProduct = new Product(productData)
        await newProduct.save()
        req.session.flash = {
          type: 'success',
          message: 'Product created successfully'
        }
        res.redirect('/admin/products')
      }
    } catch (error) {
      console.error('Save product error:', error)
      req.session.flash = { type: 'error', message: 'Error saving product' }
      res.redirect(
        req.body.id
          ? `/admin/products/${req.body.id}/edit`
          : '/admin/products/new'
      )
    }
  }
)

// Delete product
router.post('/:id/delete', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    req.session.flash = {
      type: 'success',
      message: 'Product deleted successfully'
    }
    res.redirect('/admin/products')
  } catch (error) {
    console.error('Delete product error:', error)
    req.session.flash = { type: 'error', message: 'Error deleting product' }
    res.redirect('/admin/products')
  }
})

module.exports = router
