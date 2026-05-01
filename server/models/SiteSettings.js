const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // Global Settings
  siteName: { type: String, default: 'NoteVault Pro' },
  supportEmail: { type: String, default: 'support@notevaultpro.com' },
  developerName: { type: String, default: 'Priyanshu Shakya' },

  // Home Page - Hero Section
  heroTitle: { type: String, default: 'Master Your Engineering Exams' },
  heroSubtitle: { type: String, default: 'The ultimate academic arsenal for engineering students. High-quality structured notes, premium video lectures, and previous year papers curated by top educators.' },

  // Home Page - Features
  features: [{
    title: String,
    desc: String,
    icon: String, // String identifier for lucide-react icon
    color: String,
    bg: String
  }],

  // Home Page - Testimonials
  testimonials: [{
    name: String,
    role: String,
    text: String
  }],

  // About Page - Story & Mission
  aboutMission: { type: String, default: 'We are on a mission to democratize quality education. By eliminating clutter and organizing materials logically, we empower engineering students to focus purely on learning and scoring high.' },
  aboutStory: { type: String, default: 'NoteVault Pro was born out of a simple frustration: finding the right study material before exams was harder than actually studying it.' },

  // Contact Page Settings
  contactAddress: { type: String, default: '123 Education Hub, Tech Park' },
  contactPhone: { type: String, default: '+91 9876543210' },

  // Social Links
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/' },
    linkedin: { type: String, default: 'https://linkedin.com/' },
    youtube: { type: String, default: 'https://youtube.com/' },
    github: { type: String, default: 'https://github.com/' }
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
