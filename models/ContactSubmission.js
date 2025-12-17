const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  town: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    trim: true
  },
  selectedSize: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted'],
    default: 'new'
  }
}, {
  timestamps: true
});

contactSubmissionSchema.index({ createdAt: -1 });
contactSubmissionSchema.index({ status: 1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);

