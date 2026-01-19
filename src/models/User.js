const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  monthlyUsage: {
    cvCount: { type: Number, default: 0 },
    resetDate: { type: Date, default: Date.now }
  },
  apiKeys: [{
    key: String,
    name: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get plan limits
userSchema.methods.getPlanLimits = function() {
  const limits = {
    free: { cvLimit: 20, premiumTemplates: false },
    pro: { cvLimit: 500, premiumTemplates: true },
    enterprise: { cvLimit: -1, premiumTemplates: true } // -1 = unlimited
  };
  return limits[this.plan];
};

// Check if user can create CV
userSchema.methods.canCreateCV = function() {
  const limits = this.getPlanLimits();
  if (limits.cvLimit === -1) return true; // unlimited
  
  // Reset monthly usage if needed
  const now = new Date();
  const resetDate = new Date(this.monthlyUsage.resetDate);
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    this.monthlyUsage.cvCount = 0;
    this.monthlyUsage.resetDate = now;
  }
  
  return this.monthlyUsage.cvCount < limits.cvLimit;
};

module.exports = mongoose.model('User', userSchema);