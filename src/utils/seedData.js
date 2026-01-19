const User = require('../models/User');
const Template = require('../models/Template');
const defaultTemplate = require('../templates/default');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Administrador',
        email: process.env.ADMIN_EMAIL || 'admin@bluevisiontech.com',
        password: process.env.ADMIN_PASSWORD || 'admin123456',
        role: 'admin',
        plan: 'enterprise'
      });
      await adminUser.save();
      console.log('✅ Usuário admin criado');
    }

    // Create default template if not exists
    const templateExists = await Template.findOne({ name: defaultTemplate.name });
    if (!templateExists) {
      const template = new Template(defaultTemplate);
      await template.save();
      console.log('✅ Template padrão criado');
    }

    // Create additional templates
    const templates = [
      {
        name: 'Moderno Criativo',
        description: 'Template moderno com design criativo, ideal para áreas de design e marketing',
        category: 'creative',
        isPremium: true,
        htmlContent: `
          <div class="cv-container modern">
            <div class="sidebar">
              <div class="profile-section">
                <h1 class="name">{{nome}}</h1>
                <div class="contact-info">
                  <div class="contact-item">{{email}}</div>
                  {{#if telefone}}<div class="contact-item">{{telefone}}</div>{{/if}}
                  {{#if endereco}}<div class="contact-item">{{endereco}}</div>{{/if}}
                </div>
              </div>
              
              {{#if habilidades}}
              <div class="sidebar-section">
                <h3>Habilidades</h3>
                <div class="skills">{{habilidades}}</div>
              </div>
              {{/if}}
            </div>
            
            <div class="main-content">
              {{#if resumo}}
              <section class="section">
                <h2>Sobre</h2>
                <p>{{resumo}}</p>
              </section>
              {{/if}}
              
              {{#if experiencias}}
              <section class="section">
                <h2>Experiência</h2>
                <div class="timeline">{{experiencias}}</div>
              </section>
              {{/if}}
              
              {{#if educacao}}
              <section class="section">
                <h2>Educação</h2>
                <div class="timeline">{{educacao}}</div>
              </section>
              {{/if}}
            </div>
          </div>
        `,
        cssStyles: `
          .cv-container.modern {
            display: grid;
            grid-template-columns: 300px 1fr;
            min-height: 100vh;
          }
          
          .sidebar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
          }
          
          .name {
            font-size: 1.8rem;
            margin-bottom: 20px;
            font-weight: 300;
          }
          
          .main-content {
            padding: 40px;
          }
          
          .section h2 {
            color: #667eea;
            font-size: 1.5rem;
            margin-bottom: 20px;
            position: relative;
          }
          
          .section h2::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 50px;
            height: 3px;
            background: #667eea;
          }
        `
      },
      {
        name: 'Executivo Premium',
        description: 'Template elegante para executivos e cargos de liderança',
        category: 'professional',
        isPremium: true,
        htmlContent: `
          <div class="cv-container executive">
            <header class="header">
              <h1 class="name">{{nome}}</h1>
              <div class="title-line"></div>
              <div class="contact-grid">
                <span>{{email}}</span>
                {{#if telefone}}<span>{{telefone}}</span>{{/if}}
                {{#if endereco}}<span>{{endereco}}</span>{{/if}}
              </div>
            </header>
            
            {{#if resumo}}
            <section class="executive-summary">
              <h2>Executive Summary</h2>
              <p>{{resumo}}</p>
            </section>
            {{/if}}
            
            <div class="content-grid">
              <div class="main-column">
                {{#if experiencias}}
                <section>
                  <h2>Professional Experience</h2>
                  {{experiencias}}
                </section>
                {{/if}}
              </div>
              
              <div class="side-column">
                {{#if educacao}}
                <section>
                  <h3>Education</h3>
                  {{educacao}}
                </section>
                {{/if}}
                
                {{#if habilidades}}
                <section>
                  <h3>Core Competencies</h3>
                  {{habilidades}}
                </section>
                {{/if}}
              </div>
            </div>
          </div>
        `,
        cssStyles: `
          .cv-container.executive {
            font-family: 'Georgia', serif;
            color: #2c3e50;
          }
          
          .header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 2px solid #34495e;
          }
          
          .name {
            font-size: 2.5rem;
            font-weight: normal;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          
          .title-line {
            width: 100px;
            height: 2px;
            background: #e74c3c;
            margin: 20px auto;
          }
          
          .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            margin-top: 40px;
          }
        `
      }
    ];

    for (const templateData of templates) {
      const exists = await Template.findOne({ name: templateData.name });
      if (!exists) {
        const template = new Template(templateData);
        await template.save();
        console.log(`✅ Template "${templateData.name}" criado`);
      }
    }

    console.log('🎉 Seed do banco de dados concluído!');
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  }
};

module.exports = seedDatabase;