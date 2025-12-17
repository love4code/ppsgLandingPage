const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ContactSubmission = require('../models/ContactSubmission');
const Product = require('../models/Product');
const PortfolioPost = require('../models/PortfolioPost');
const Media = require('../models/Media');
const emailService = require('../services/emailService');

// Home page
router.get('/', async (req, res) => {
  try {
    const portfolioPosts = await PortfolioPost.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('mediaIds');
    
    const products = await Product.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('mediaIds');
    
    res.render('public/home', {
      title: 'Home',
      portfolioPosts,
      products
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('errors/500', { title: 'Server Error' });
  }
});

// Portfolio list
router.get('/portfolio', async (req, res) => {
  try {
    const posts = await PortfolioPost.find({ published: true })
      .sort({ createdAt: -1 })
      .populate('mediaIds');
    
    res.render('public/portfolio-list', {
      title: 'Portfolio',
      posts
    });
  } catch (error) {
    console.error('Portfolio list error:', error);
    res.status(500).render('errors/500', { title: 'Server Error' });
  }
});

// Portfolio detail
router.get('/portfolio/:slug', async (req, res) => {
  try {
    const post = await PortfolioPost.findOne({ slug: req.params.slug, published: true })
      .populate('mediaIds');
    
    if (!post) {
      return res.status(404).render('errors/404', { title: 'Portfolio Post Not Found' });
    }
    
    res.render('public/portfolio-detail', {
      title: post.title,
      post
    });
  } catch (error) {
    console.error('Portfolio detail error:', error);
    res.status(500).render('errors/500', { title: 'Server Error' });
  }
});

// Products list
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ published: true })
      .sort({ createdAt: -1 })
      .populate('mediaIds');
    
    res.render('public/products-list', {
      title: 'Products',
      products
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).render('errors/500', { title: 'Server Error' });
  }
});

// Product detail
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, published: true })
      .populate('mediaIds');
    
    if (!product) {
      return res.status(404).render('errors/404', { title: 'Product Not Found' });
    }
    
    // Check for inquiry success/error in session
    const inquirySuccess = req.session.inquirySuccess;
    const inquiryError = req.session.inquiryError;
    delete req.session.inquirySuccess;
    delete req.session.inquiryError;
    
    res.render('public/product-detail', {
      title: product.name,
      product,
      inquirySuccess,
      inquiryError
    });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).render('errors/500', { title: 'Server Error' });
  }
});

// Product inquiry form submission
router.post('/products/:slug/inquire', [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().escape(),
  body('town').trim().notEmpty().withMessage('Town/City is required').escape(),
  body('message').trim().notEmpty().withMessage('Message is required').escape(),
  body('productName').trim().escape(),
  body('selectedSize').optional().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.session.inquiryError = errors.array().map(e => e.msg).join(', ');
    return res.redirect(`/products/${req.params.slug}`);
  }
  
  try {
    const submission = await ContactSubmission.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      town: req.body.town,
      message: req.body.message,
      productName: req.body.productName || '',
      selectedSize: req.body.selectedSize || ''
    });
    
    // Send email
    try {
      await emailService.sendContactEmail(submission);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    req.session.inquirySuccess = true;
    return res.redirect(`/products/${req.params.slug}`);
  } catch (error) {
    console.error('Product inquiry error:', error);
    req.session.inquiryError = 'An error occurred. Please try again.';
    return res.redirect(`/products/${req.params.slug}`);
  }
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('public/contact', {
    title: 'Contact Us'
  });
});

// Contact form submission
router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().escape(),
  body('town').trim().notEmpty().withMessage('Town/City is required').escape(),
  body('message').trim().notEmpty().withMessage('Message is required').escape()
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('public/contact', {
      title: 'Contact Us',
      errors: errors.array(),
      formData: req.body
    });
  }
  
  try {
    const submission = await ContactSubmission.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      town: req.body.town,
      message: req.body.message
    });
    
    // Send email
    try {
      await emailService.sendContactEmail(submission);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }
    
    req.session.contactSuccess = true;
    return res.redirect('/contact');
  } catch (error) {
    console.error('Contact submission error:', error);
    res.render('public/contact', {
      title: 'Contact Us',
      error: 'An error occurred. Please try again.',
      formData: req.body
    });
  }
});

module.exports = router;

