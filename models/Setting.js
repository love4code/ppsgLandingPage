const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Aquarian Pool and Spa'
  },
  phone: String,
  email: String,
  address: String,
  businessHours: String,
  socials: {
    facebook: String,
    instagram: String,
    google: String,
    twitter: String,
    linkedin: String
  },
  logoMediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  hero: {
    useImage: {
      type: Boolean,
      default: false
    },
    headline: String,
    subheadline: String,
    ctaText: String,
    ctaLink: String,
    heroMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }
  },
  theme: {
    mode: {
      type: String,
      enum: ['preset', 'custom'],
      default: 'preset'
    },
    presetName: {
      type: String,
      enum: ['ocean-blue', 'deep-teal', 'crystal-clear', 'midnight-blue', 'tropical-turquoise'],
      default: 'ocean-blue'
    },
    custom: {
      primary: String,
      secondary: String,
      background: String,
      text: String,
      accent: String
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);

