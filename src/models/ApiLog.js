const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  apiKey: String,
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: Number, // in milliseconds
  ip: String,
  userAgent: String,
  requestBody: mongoose.Schema.Types.Mixed,
  responseBody: mongoose.Schema.Types.Mixed,
  error: String
}, {
  timestamps: true
});

// Index for performance
apiLogSchema.index({ userId: 1, createdAt: -1 });
apiLogSchema.index({ apiKey: 1, createdAt: -1 });

module.exports = mongoose.model('ApiLog', apiLogSchema);