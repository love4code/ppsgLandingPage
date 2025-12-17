const express = require('express');
const router = express.Router();
const Setting = require('../../models/Setting');
const Media = require('../../models/Media');
const { body, validationResult } = require('express-validator');

// Get settings page
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        companyName: 'Aquarian Pool and Spa',
        theme: {
          mode: 'preset',
          presetName: 'ocean-blue'
        }
      });
    }
    
    const media = await Media.find().sort({ createdAt: -1 }).limit(50);
    
    res.render('admin/settings/form', {
      title: 'Settings',
      layout: 'layouts/admin',
      settings,
      media
    });
  } catch (error) {
    console.error('Settings page error:', error);
    res.status(500).render('errors/500', { title: 'Server Error', layout: 'layouts/admin' });
  }
});

// Update settings
router.post('/', [
  body('companyName').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().trim().isEmail().withMessage('Valid email required'),
  body('address').optional().trim(),
  body('businessHours').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    
    // Company info
    settings.companyName = req.body.companyName || settings.companyName;
    settings.phone = req.body.phone || '';
    settings.email = req.body.email || '';
    settings.address = req.body.address || '';
    settings.businessHours = req.body.businessHours || '';
    
    // Social links
    settings.socials = {
      facebook: req.body.facebook || '',
      instagram: req.body.instagram || '',
      google: req.body.google || '',
      twitter: req.body.twitter || '',
      linkedin: req.body.linkedin || ''
    };
    
    // Logo
    if (req.body.logoMediaId) {
      settings.logoMediaId = req.body.logoMediaId;
    }
    
    // Hero settings
    settings.hero = {
      useImage: req.body.heroUseImage === 'on',
      headline: req.body.heroHeadline || '',
      subheadline: req.body.heroSubheadline || '',
      ctaText: req.body.heroCtaText || '',
      ctaLink: req.body.heroCtaLink || '',
      heroMediaId: req.body.heroMediaId || null
    };
    
    // Theme settings
    settings.theme = {
      mode: req.body.themeMode || 'preset',
      presetName: req.body.presetName || 'ocean-blue',
      custom: {
        primary: req.body.customPrimary || '#0d6efd',
        secondary: req.body.customSecondary || '#6c757d',
        background: req.body.customBackground || '#ffffff',
        text: req.body.customText || '#212529',
        accent: req.body.customAccent || '#0d6efd'
      }
    };
    
    settings.updatedAt = new Date();
    
    if (!errors.isEmpty()) {
      const media = await Media.find().sort({ createdAt: -1 }).limit(50);
      return res.render('admin/settings/form', {
        title: 'Settings',
        layout: 'layouts/admin',
        settings,
        media,
        errors: errors.array()
      });
    }
    
    await settings.save();
    req.session.flash = { type: 'success', message: 'Settings updated successfully' };
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('Update settings error:', error);
    req.session.flash = { type: 'error', message: 'Error updating settings' };
    res.redirect('/admin/settings');
  }
});

module.exports = router;

