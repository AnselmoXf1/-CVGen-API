const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const temporaryStorage = require('./temporaryStorageService');

class PDFService {
  constructor() {
    this.browser = null;
    this.storageDir = process.env.PDF_STORAGE_PATH || './storage/pdfs';
    this.useTemporaryStorage = process.env.USE_TEMPORARY_STORAGE !== 'false'; // Padrão: usar storage temporário
    
    if (!this.useTemporaryStorage) {
      this.ensureStorageDir();
    }
    
    console.log(`📁 Modo de armazenamento: ${this.useTemporaryStorage ? 'Temporário (Download Direto)' : 'Permanente'}`);
  }

  async ensureStorageDir() {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  async initBrowser() {
    try {
      if (!this.browser) {
        const puppeteer = require('puppeteer');
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        });
      }
      return this.browser;
    } catch (error) {
      console.warn('Puppeteer not available:', error.message);
      return null;
    }
  }

  async generatePDF(htmlContent, cssStyles, cvData) {
    try {
      const browser = await this.initBrowser();
      
      if (!browser) {
        // Fallback: Generate HTML file instead of PDF
        return await this.generateHTMLFallback(htmlContent, cssStyles, cvData);
      }

      const page = await browser.newPage();

      // Compile HTML with data
      const compiledHTML = this.compileTemplate(htmlContent, cssStyles, cvData);

      await page.setContent(compiledHTML, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Generate PDF buffer
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      await page.close();

      // Usar armazenamento temporário ou permanente
      if (this.useTemporaryStorage) {
        return await this.handleTemporaryStorage(pdfBuffer, cvData);
      } else {
        return await this.handlePermanentStorage(pdfBuffer, cvData);
      }

    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback to HTML
      return await this.generateHTMLFallback(htmlContent, cssStyles, cvData);
    }
  }

  // Armazenamento temporário (Download Direto)
  async handleTemporaryStorage(pdfBuffer, cvData) {
    const originalName = `cv-${cvData.nome.replace(/\s+/g, '-').toLowerCase()}`;
    const fileInfo = await temporaryStorage.createTemporaryFile(pdfBuffer, originalName);
    
    console.log(`✅ PDF temporário gerado: ${fileInfo.fileName} (${fileInfo.size} bytes)`);
    
    return {
      type: 'temporary',
      fileName: fileInfo.fileName,
      downloadUrl: fileInfo.downloadUrl,
      expiresAt: fileInfo.expiresAt,
      size: fileInfo.size,
      message: 'PDF gerado com sucesso! Baixe imediatamente, o arquivo será removido automaticamente.'
    };
  }

  // Armazenamento permanente (método antigo)
  async handlePermanentStorage(pdfBuffer, cvData) {
    const fileName = `cv-${cvData.nome.replace(/\s+/g, '-').toLowerCase()}-${uuidv4()}.pdf`;
    const filePath = path.join(this.storageDir, fileName);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, pdfBuffer);

    console.log(`✅ PDF permanente gerado: ${fileName}`);

    return {
      type: 'permanent',
      fileName,
      filePath,
      url: `${process.env.API_BASE_URL}/storage/pdfs/${fileName}`,
      size: pdfBuffer.length
    };
  }

  async generateHTMLFallback(htmlContent, cssStyles, cvData) {
    try {
      // Generate unique filename
      const fileName = `cv-${cvData.nome.replace(/\s+/g, '-').toLowerCase()}-${uuidv4()}.html`;
      const filePath = path.join(this.storageDir, fileName);

      // Compile HTML with data
      const compiledHTML = this.compileTemplate(htmlContent, cssStyles, cvData);

      // Save HTML file
      await fs.writeFile(filePath, compiledHTML, 'utf8');

      console.log('⚠️  PDF generation unavailable, generated HTML instead');

      return {
        fileName,
        filePath,
        url: `${process.env.API_BASE_URL}/cv/download/${fileName}`,
        type: 'html'
      };
    } catch (error) {
      console.error('HTML fallback generation error:', error);
      throw new Error('Erro ao gerar arquivo do CV');
    }
  }

  compileTemplate(htmlContent, cssStyles, cvData) {
    let compiledHTML = htmlContent;

    // Replace personal info
    const personalInfo = cvData.personalInfo || cvData;
    Object.keys(personalInfo).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiledHTML = compiledHTML.replace(regex, personalInfo[key] || '');
    });

    // Replace other fields
    ['resumo'].forEach(field => {
      const regex = new RegExp(`{{\\s*${field}\\s*}}`, 'g');
      compiledHTML = compiledHTML.replace(regex, cvData[field] || '');
    });

    // Replace arrays (experiencias, educacao, etc.)
    compiledHTML = this.replaceArrayFields(compiledHTML, cvData);

    // Add CSS styles
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${cssStyles}
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .cv-container { max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body>
        ${compiledHTML}
      </body>
      </html>
    `;

    return fullHTML;
  }

  replaceArrayFields(html, cvData) {
    let compiledHTML = html;

    // Handle experiencias
    if (cvData.experiencias && cvData.experiencias.length > 0) {
      const experienciasHTML = cvData.experiencias.map(exp => `
        <div class="experiencia-item">
          <h4>${exp.empresa} - ${exp.cargo}</h4>
          <p class="periodo">${exp.periodo}</p>
          ${exp.localizacao ? `<p class="localizacao">${exp.localizacao}</p>` : ''}
          ${exp.descricao ? `<p class="descricao">${exp.descricao}</p>` : ''}
        </div>
      `).join('');
      compiledHTML = compiledHTML.replace(/{{experiencias}}/g, experienciasHTML);
    } else {
      compiledHTML = compiledHTML.replace(/{{experiencias}}/g, '');
    }

    // Handle educacao
    if (cvData.educacao && cvData.educacao.length > 0) {
      const educacaoHTML = cvData.educacao.map(edu => `
        <div class="educacao-item">
          <h4>${edu.instituicao}</h4>
          <p class="curso">${edu.curso}</p>
          ${edu.periodo ? `<p class="periodo">${edu.periodo}</p>` : ''}
          ${edu.descricao ? `<p class="descricao">${edu.descricao}</p>` : ''}
        </div>
      `).join('');
      compiledHTML = compiledHTML.replace(/{{educacao}}/g, educacaoHTML);
    } else {
      compiledHTML = compiledHTML.replace(/{{educacao}}/g, '');
    }

    // Handle habilidades
    if (cvData.habilidades && cvData.habilidades.length > 0) {
      const habilidadesHTML = cvData.habilidades.map(skill => 
        `<span class="skill-tag">${skill}</span>`
      ).join('');
      compiledHTML = compiledHTML.replace(/{{habilidades}}/g, habilidadesHTML);
    } else {
      compiledHTML = compiledHTML.replace(/{{habilidades}}/g, '');
    }

    return compiledHTML;
  }

  async deletePDF(fileName) {
    try {
      const filePath = path.join(this.storageDir, fileName);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFService();