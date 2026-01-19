const memoryDB = require('../config/memoryDB');

class MemoryTemplate {
  static async find(query = {}) {
    return memoryDB.findTemplates(query);
  }

  static async findById(id) {
    return memoryDB.findTemplate(id);
  }

  static async create(templateData) {
    const id = memoryDB.generateId('templates');
    const template = {
      _id: id,
      ...templateData,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDB.templates.set(id, template);
    return template;
  }

  static async distinct(field, query = {}) {
    const templates = memoryDB.findTemplates(query);
    const values = [...new Set(templates.map(t => t[field]))];
    return values;
  }
}

module.exports = MemoryTemplate;