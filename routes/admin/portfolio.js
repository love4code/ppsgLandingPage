const express = require('express');
const router = express.Router();
const PortfolioPost = require('../../models/PortfolioPost');
const Media = require('../../models/Media');
const { body, validationResult } = require('express-validator');

// List all portfolio posts
router.get('/', async (req, res) => {
  try {
    const posts = await PortfolioPost.find().sort({ createdAt: -1 });
    res.render('admin/portfolio/list', {
      title: 'Portfolio',
      layout: 'layouts/admin',
      posts
    });
  } catch (error) {
    console.error('Portfolio list error:', error);
    res.status(500).render('errors/500', { title: 'Server Error', layout: 'layouts/admin' });
  }
});

// Create portfolio post form
router.get('/new', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 }).limit(50);
    res.render('admin/portfolio/form', {
      title: 'New Portfolio Post',
      layout: 'layouts/admin',
      post: null,
      media
    });
  } catch (error) {
    console.error('New portfolio form error:', error);
    res.status(500).render('errors/500', { title: 'Server Error', layout: 'layouts/admin' });
  }
});

// Edit portfolio post form
router.get('/:id/edit', async (req, res) => {
  try {
    const post = await PortfolioPost.findById(req.params.id).populate('mediaIds');
    if (!post) {
      return res.status(404).render('errors/404', { title: 'Portfolio Post Not Found', layout: 'layouts/admin' });
    }
    
    const media = await Media.find().sort({ createdAt: -1 }).limit(50);
    res.render('admin/portfolio/form', {
      title: 'Edit Portfolio Post',
      layout: 'layouts/admin',
      post,
      media
    });
  } catch (error) {
    console.error('Edit portfolio form error:', error);
    res.status(500).render('errors/500', { title: 'Server Error', layout: 'layouts/admin' });
  }
});

// Create/Update portfolio post
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('excerpt').optional().trim(),
  body('content').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  
  try {
    const mediaIds = Array.isArray(req.body.mediaIds) ? req.body.mediaIds : 
                     req.body.mediaIds ? [req.body.mediaIds] : [];
    
    const postData = {
      title: req.body.title,
      excerpt: req.body.excerpt || '',
      content: req.body.content || '',
      projectDate: req.body.projectDate ? new Date(req.body.projectDate) : undefined,
      location: req.body.location || '',
      published: req.body.published === 'on' || req.body.published === true,
      mediaIds: mediaIds.map(id => id).filter(Boolean)
    };
    
    if (req.body.id) {
      // Update
      if (!errors.isEmpty()) {
        const post = await PortfolioPost.findById(req.body.id).populate('mediaIds');
        const media = await Media.find().sort({ createdAt: -1 }).limit(50);
        return res.render('admin/portfolio/form', {
          title: 'Edit Portfolio Post',
          layout: 'layouts/admin',
          post,
          media,
          errors: errors.array()
        });
      }
      
      await PortfolioPost.findByIdAndUpdate(req.body.id, postData);
      req.session.flash = { type: 'success', message: 'Portfolio post updated successfully' };
      res.redirect('/admin/portfolio');
    } else {
      // Create
      if (!errors.isEmpty()) {
        const media = await Media.find().sort({ createdAt: -1 }).limit(50);
        return res.render('admin/portfolio/form', {
          title: 'New Portfolio Post',
          layout: 'layouts/admin',
          post: postData,
          media,
          errors: errors.array()
        });
      }
      
      await PortfolioPost.create(postData);
      req.session.flash = { type: 'success', message: 'Portfolio post created successfully' };
      res.redirect('/admin/portfolio');
    }
  } catch (error) {
    console.error('Save portfolio post error:', error);
    req.session.flash = { type: 'error', message: 'Error saving portfolio post' };
    res.redirect(req.body.id ? `/admin/portfolio/${req.body.id}/edit` : '/admin/portfolio/new');
  }
});

// Delete portfolio post
router.post('/:id/delete', async (req, res) => {
  try {
    await PortfolioPost.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', message: 'Portfolio post deleted successfully' };
    res.redirect('/admin/portfolio');
  } catch (error) {
    console.error('Delete portfolio post error:', error);
    req.session.flash = { type: 'error', message: 'Error deleting portfolio post' };
    res.redirect('/admin/portfolio');
  }
});

module.exports = router;

