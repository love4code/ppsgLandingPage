require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Setting = require('../models/Setting');

const seed = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquarian-pool-spa';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aquarianpoolandspa.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const admin = await Admin.create({
        email: adminEmail,
        password: adminPassword
      });
      console.log('Admin user created:', admin.email);
    }
    
    // Create default settings
    const existingSettings = await Setting.findOne();
    if (existingSettings) {
      console.log('Settings already exist');
    } else {
      const settings = await Setting.create({
        companyName: 'Aquarian Pool and Spa',
        phone: '',
        email: '',
        address: '',
        businessHours: '',
        socials: {
          facebook: '',
          instagram: '',
          google: '',
          twitter: '',
          linkedin: ''
        },
        hero: {
          useImage: false,
          headline: 'Welcome to Aquarian Pool and Spa',
          subheadline: 'Your trusted partner for premium pool and spa solutions',
          ctaText: 'Get Started',
          ctaLink: '/contact'
        },
        theme: {
          mode: 'preset',
          presetName: 'ocean-blue'
        }
      });
      console.log('Default settings created');
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();

