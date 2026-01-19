const memoryDB = require('../config/memoryDB');

class MemoryCV {
  static async create(cvData) {
    return memoryDB.createCV(cvData);
  }

  static async find(query = {}) {
    return memoryDB.findCVs(query);
  }

  static async findById(id) {
    return memoryDB.findCV(id);
  }

  static async findOne(query) {
    const cvs = memoryDB.findCVs(query);
    return cvs[0] || null;
  }

  static async findByIdAndDelete(id) {
    const cv = memoryDB.findCV(id);
    if (cv) {
      memoryDB.deleteCV(id);
      return cv;
    }
    return null;
  }

  static async countDocuments(query = {}) {
    const cvs = memoryDB.findCVs(query);
    return cvs.length;
  }

  static async aggregate(pipeline) {
    // Simplified aggregation for memory DB
    const cvs = Array.from(memoryDB.cvs.values());
    return cvs.map(cv => ({ _id: cv.status, count: 1 }));
  }
}

module.exports = MemoryCV;