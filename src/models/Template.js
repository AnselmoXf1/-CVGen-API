const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  cssStyles: {
    type: String,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  previewImage: {
    type: String // URL to preview image
  },
  category: {
    type: String,
    enum: ['professional', 'creative', 'modern', 'classic'],
    default: 'professional'
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);