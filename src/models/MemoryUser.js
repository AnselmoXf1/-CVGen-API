const bcrypt = require('bcryptjs');
const memoryDB = require('../config/memoryDB');

class MemoryUser {
  static async findOne(query) {
    return memoryDB.findUser(query);
  }

  static async findById(id) {
    return memoryDB.findUser({ _id: id });
  }

  static async create(userData) {
    // Hash password
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    return memoryDB.createUser(userData);
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateUser(id, updateData) {
    return memoryDB.updateUser(id, updateData);
  }

  static getPlanLimits(plan) {
    const limits = {
      free: { cvLimit: 20, premiumTemplates: false },
      pro: { cvLimit: 500, premiumTemplates: true },
      enterprise: { cvLimit: -1, premiumTemplates: true } // -1 = unlimited
    };
    return limits[plan];
  }

  static canCreateCV(user) {
    const limits = this.getPlanLimits(user.plan);
    if (limits.cvLimit === -1) return true; // unlimited
    
    // Reset monthly usage if needed
    const now = new Date();
    const resetDate = new Date(user.monthlyUsage.resetDate);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      user.monthlyUsage.cvCount = 0;
      user.monthlyUsage.resetDate = now;
    }
    
    return user.monthlyUsage.cvCount < limits.cvLimit;
  }
}

module.exports = MemoryUser;