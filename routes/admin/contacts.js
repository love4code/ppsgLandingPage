const express = require('express');
const router = express.Router();
const ContactSubmission = require('../../models/ContactSubmission');

// List all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await ContactSubmission.find()
      .sort({ createdAt: -1 });
    
    res.render('admin/contacts/list', {
      title: 'Contacts',
      layout: 'layouts/admin',
      contacts
    });
  } catch (error) {
    console.error('Contacts list error:', error);
    res.status(500).render('errors/500', { title: 'Server Error', layout: 'layouts/admin' });
  }
});

// View contact details
router.get('/:id', async (req, res) => {
  try {
    const contact = await ContactSubmission.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).render('errors/404', { title: 'Contact Not Found', layout: 'layouts/admin' });
    }
    
    res.render('admin/contacts/view', {
      title: 'Contact Details',
      layout: 'layouts/admin',
      contact
    });
  } catch (error) {
    console.error('Contact view error:', error);
    res.status(500).render('errors/500', { title: 'Server Error', layout: 'layouts/admin' });
  }
});

// Mark as contacted
router.post('/:id/contacted', async (req, res) => {
  try {
    await ContactSubmission.findByIdAndUpdate(req.params.id, { status: 'contacted' });
    req.session.flash = { type: 'success', message: 'Contact marked as contacted' };
    res.redirect('/admin/contacts/' + req.params.id);
  } catch (error) {
    console.error('Mark contacted error:', error);
    req.session.flash = { type: 'error', message: 'Error updating contact status' };
    res.redirect('/admin/contacts/' + req.params.id);
  }
});

// Delete contact
router.post('/:id/delete', async (req, res) => {
  try {
    await ContactSubmission.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', message: 'Contact deleted successfully' };
    res.redirect('/admin/contacts');
  } catch (error) {
    console.error('Delete contact error:', error);
    req.session.flash = { type: 'error', message: 'Error deleting contact' };
    res.redirect('/admin/contacts');
  }
});

module.exports = router;

