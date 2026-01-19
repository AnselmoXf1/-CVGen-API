// Default template for CV generation
const defaultTemplate = {
  name: 'Profissional Clássico',
  description: 'Template profissional e limpo, ideal para a maioria das áreas',
  category: 'professional',
  isPremium: false,
  htmlContent: `
    <div class="cv-container">
      <header class="cv-header">
        <div class="personal-info">
          <h1 class="name">{{nome}}</h1>
          <div class="contact-info">
            <div class="contact-item">
              <span class="icon">📧</span>
              <span>{{email}}</span>
            </div>
            {{#if telefone}}
            <div class="contact-item">
              <span class="icon">📱</span>
              <span>{{telefone}}</span>
            </div>
            {{/if}}
            {{#if endereco}}
            <div class="contact-item">
              <span class="icon">📍</span>
              <span>{{endereco}}</span>
            </div>
            {{/if}}
            {{#if linkedin}}
            <div class="contact-item">
              <span class="icon">💼</span>
              <span>{{linkedin}}</span>
            </div>
            {{/if}}
            {{#if github}}
            <div class="contact-item">
              <span class="icon">🔗</span>
              <span>{{github}}</span>
            </div>
            {{/if}}
          </div>
        </div>
      </header>

      {{#if resumo}}
      <section class="cv-section">
        <h2 class="section-title">Resumo Profissional</h2>
        <p class="resumo">{{resumo}}</p>
      </section>
      {{/if}}

      {{#if experiencias}}
      <section class="cv-section">
        <h2 class="section-title">Experiência Profissional</h2>
        <div class="experiencias">
          {{experiencias}}
        </div>
      </section>
      {{/if}}

      {{#if educacao}}
      <section class="cv-section">
        <h2 class="section-title">Educação</h2>
        <div class="educacao">
          {{educacao}}
        </div>
      </section>
      {{/if}}

      {{#if habilidades}}
      <section class="cv-section">
        <h2 class="section-title">Habilidades</h2>
        <div class="habilidades">
          {{habilidades}}
        </div>
      </section>
      {{/if}}

      {{#if idiomas}}
      <section class="cv-section">
        <h2 class="section-title">Idiomas</h2>
        <div class="idiomas">
          {{#each idiomas}}
          <div class="idioma-item">
            <span class="idioma">{{idioma}}</span>
            <span class="nivel">{{nivel}}</span>
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}

      {{#if certificacoes}}
      <section class="cv-section">
        <h2 class="section-title">Certificações</h2>
        <div class="certificacoes">
          {{#each certificacoes}}
          <div class="certificacao-item">
            <h4>{{nome}}</h4>
            {{#if instituicao}}<p class="instituicao">{{instituicao}}</p>{{/if}}
            {{#if data}}<p class="data">{{data}}</p>{{/if}}
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}

      {{#if projetos}}
      <section class="cv-section">
        <h2 class="section-title">Projetos</h2>
        <div class="projetos">
          {{#each projetos}}
          <div class="projeto-item">
            <h4>{{nome}}</h4>
            {{#if descricao}}<p class="descricao">{{descricao}}</p>{{/if}}
            {{#if tecnologias}}
            <div class="tecnologias">
              {{#each tecnologias}}
              <span class="tech-tag">{{this}}</span>
              {{/each}}
            </div>
            {{/if}}
          </div>
          {{/each}}
        </div>
      </section>
      {{/if}}
    </div>
  `,
  cssStyles: `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }

    .cv-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }

    .cv-header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 30px;
      margin-bottom: 30px;
    }

    .name {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
    }

    .icon {
      font-size: 1.1rem;
    }

    .cv-section {
      margin-bottom: 35px;
    }

    .section-title {
      font-size: 1.4rem;
      color: #1e40af;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .resumo {
      font-size: 1rem;
      line-height: 1.7;
      text-align: justify;
    }

    .experiencia-item,
    .educacao-item,
    .certificacao-item,
    .projeto-item {
      margin-bottom: 25px;
      padding-left: 20px;
      border-left: 3px solid #e5e7eb;
    }

    .experiencia-item h4,
    .educacao-item h4,
    .certificacao-item h4,
    .projeto-item h4 {
      font-size: 1.1rem;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .periodo,
    .curso,
    .instituicao,
    .data {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .descricao {
      font-size: 0.95rem;
      line-height: 1.6;
      margin-top: 8px;
    }

    .localizacao {
      font-size: 0.85rem;
      color: #9ca3af;
      font-style: italic;
    }

    .habilidades {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .skill-tag,
    .tech-tag {
      background: #eff6ff;
      color: #1e40af;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid #bfdbfe;
    }

    .idiomas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .idioma-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }

    .idioma {
      font-weight: 500;
    }

    .nivel {
      font-size: 0.85rem;
      color: #6b7280;
      text-transform: capitalize;
    }

    .tecnologias {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    @media print {
      .cv-container {
        padding: 20px;
      }
      
      .name {
        font-size: 2rem;
      }
      
      .section-title {
        font-size: 1.2rem;
      }
    }
  `
};

module.exports = defaultTemplate;