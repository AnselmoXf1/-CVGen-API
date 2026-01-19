// In-memory database for demonstration
class MemoryDB {
  constructor() {
    this.users = new Map();
    this.templates = new Map();
    this.cvs = new Map();
    this.apiLogs = new Map();
    this.counters = {
      users: 0,
      templates: 0,
      cvs: 0,
      apiLogs: 0
    };
    
    this.initializeData();
  }

  initializeData() {
    // Create admin user
    const adminId = this.generateId('users');
    this.users.set(adminId, {
      _id: adminId,
      name: 'Administrador',
      email: 'admin@bluevisiontech.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      plan: 'enterprise',
      isActive: true,
      monthlyUsage: { cvCount: 0, resetDate: new Date() },
      apiKeys: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create default templates
    const templates = [
      {
        name: 'Profissional Clássico',
        description: 'Template profissional e limpo, ideal para a maioria das áreas',
        category: 'professional',
        isPremium: false,
        isActive: true,
        htmlContent: `
          <div class="cv-container">
            <header class="cv-header">
              <h1>{{nome}}</h1>
              <div class="contact-info">
                <p>{{email}} | {{telefone}}</p>
                <p>{{endereco}}</p>
              </div>
            </header>
            <section class="resumo">
              <h2>Resumo Profissional</h2>
              <p>{{resumo}}</p>
            </section>
            <section class="experiencias">
              <h2>Experiência Profissional</h2>
              {{experiencias}}
            </section>
            <section class="educacao">
              <h2>Educação</h2>
              {{educacao}}
            </section>
            <section class="habilidades">
              <h2>Habilidades</h2>
              {{habilidades}}
            </section>
          </div>
        `,
        cssStyles: `
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .cv-container { max-width: 800px; margin: 0 auto; }
          .cv-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .cv-header h1 { color: #2563eb; font-size: 2.5rem; margin-bottom: 10px; }
          .contact-info { color: #666; }
          section { margin-bottom: 30px; }
          h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .experiencia-item, .educacao-item { margin-bottom: 20px; }
          .experiencia-item h4, .educacao-item h4 { color: #2563eb; margin-bottom: 5px; }
          .skill-tag { background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 5px; font-size: 0.8rem; }
        `,
        usageCount: 0
      },
      {
        name: 'Moderno Criativo',
        description: 'Template moderno com design criativo, ideal para áreas de design e marketing',
        category: 'creative',
        isPremium: true,
        isActive: true,
        htmlContent: `
          <div class="cv-container modern">
            <div class="sidebar">
              <h1>{{nome}}</h1>
              <div class="contact">{{email}}<br>{{telefone}}</div>
              <div class="skills">{{habilidades}}</div>
            </div>
            <div class="main-content">
              <section class="resumo">
                <h2>Sobre</h2>
                <p>{{resumo}}</p>
              </section>
              <section>
                <h2>Experiência</h2>
                {{experiencias}}
              </section>
              <section>
                <h2>Educação</h2>
                {{educacao}}
              </section>
            </div>
          </div>
        `,
        cssStyles: `
          .cv-container.modern { display: grid; grid-template-columns: 300px 1fr; min-height: 100vh; }
          .sidebar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; }
          .sidebar h1 { font-size: 1.8rem; margin-bottom: 20px; }
          .main-content { padding: 40px; }
          h2 { color: #667eea; font-size: 1.5rem; margin-bottom: 20px; }
        `,
        usageCount: 0
      },
      {
        name: 'Executivo Premium',
        description: 'Template elegante para executivos e cargos de liderança',
        category: 'professional',
        isPremium: true,
        isActive: true,
        htmlContent: `
          <div class="cv-container executive">
            <header>
              <h1>{{nome}}</h1>
              <div class="contact-grid">
                <span>{{email}}</span>
                <span>{{telefone}}</span>
                <span>{{endereco}}</span>
              </div>
            </header>
            <section class="executive-summary">
              <h2>Executive Summary</h2>
              <p>{{resumo}}</p>
            </section>
            <div class="content-grid">
              <div class="main-column">
                <h2>Professional Experience</h2>
                {{experiencias}}
              </div>
              <div class="side-column">
                <h3>Education</h3>
                {{educacao}}
                <h3>Core Competencies</h3>
                {{habilidades}}
              </div>
            </div>
          </div>
        `,
        cssStyles: `
          .cv-container.executive { font-family: 'Georgia', serif; color: #2c3e50; }
          header { text-align: center; padding: 40px 0; border-bottom: 2px solid #34495e; }
          header h1 { font-size: 2.5rem; font-weight: normal; letter-spacing: 2px; }
          .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; margin-top: 40px; }
        `,
        usageCount: 0
      }
    ];

    templates.forEach(template => {
      const id = this.generateId('templates');
      this.templates.set(id, {
        _id: id,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    console.log('✅ Banco de dados em memória inicializado');
    console.log(`✅ Admin criado: admin@bluevisiontech.com`);
    console.log(`✅ ${templates.length} templates criados`);
  }

  generateId(collection) {
    this.counters[collection]++;
    return `${collection}_${this.counters[collection]}_${Date.now()}`;
  }

  // User methods
  findUser(query) {
    for (let [id, user] of this.users) {
      if (query.email && user.email === query.email) return user;
      if (query._id && user._id === query._id) return user;
    }
    return null;
  }

  createUser(userData) {
    const id = this.generateId('users');
    const user = {
      _id: id,
      ...userData,
      monthlyUsage: { cvCount: 0, resetDate: new Date() },
      apiKeys: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  updateUser(id, updateData) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updateData, { updatedAt: new Date() });
      this.users.set(id, user);
      return user;
    }
    return null;
  }

  // Template methods
  findTemplates(query = {}) {
    const templates = Array.from(this.templates.values());
    return templates.filter(template => {
      if (query.isActive !== undefined && template.isActive !== query.isActive) return false;
      if (query.category && template.category !== query.category) return false;
      if (query.isPremium !== undefined && template.isPremium !== query.isPremium) return false;
      return true;
    });
  }

  findTemplate(id) {
    return this.templates.get(id);
  }

  // CV methods
  createCV(cvData) {
    const id = this.generateId('cvs');
    const cv = {
      _id: id,
      ...cvData,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cvs.set(id, cv);
    return cv;
  }

  findCVs(query = {}) {
    const cvs = Array.from(this.cvs.values());
    return cvs.filter(cv => {
      if (query.userId && cv.userId !== query.userId) return false;
      return true;
    });
  }

  findCV(id) {
    return this.cvs.get(id);
  }

  deleteCV(id) {
    return this.cvs.delete(id);
  }

  // API Log methods
  createApiLog(logData) {
    const id = this.generateId('apiLogs');
    const log = {
      _id: id,
      ...logData,
      createdAt: new Date()
    };
    this.apiLogs.set(id, log);
    return log;
  }
}

module.exports = new MemoryDB();