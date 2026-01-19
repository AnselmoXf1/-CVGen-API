const express = require('express');
const router = express.Router();
const MemoryTemplate = require('../models/MemoryTemplate');
const MemoryUser = require('../models/MemoryUser');
const { authenticateToken, authenticateApiKey } = require('../middlewares/auth');

// Get all templates (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { category, isPremium } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';

    const templates = await MemoryTemplate.find(query);

    // Get unique categories
    const categories = await MemoryTemplate.distinct('category', { isActive: true });

    res.json({
      status: 'sucesso',
      data: {
        templates: templates.map(template => ({
          id: template._id,
          name: template.name,
          description: template.description,
          category: template.category,
          isPremium: template.isPremium,
          usageCount: template.usageCount,
          createdAt: template.createdAt
        })),
        categories,
        total: templates.length
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await MemoryTemplate.findById(req.params.id);
    
    if (!template || !template.isActive) {
      return res.status(404).json({
        status: 'erro',
        message: 'Template não encontrado'
      });
    }

    res.json({
      status: 'sucesso',
      data: {
        template: {
          id: template._id,
          name: template.name,
          description: template.description,
          category: template.category,
          isPremium: template.isPremium,
          htmlContent: template.htmlContent,
          cssStyles: template.cssStyles,
          usageCount: template.usageCount,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Preview template (requires authentication)
router.get('/:id/preview', authenticateApiKey, async (req, res) => {
  try {
    const template = await MemoryTemplate.findById(req.params.id);
    
    if (!template || !template.isActive) {
      return res.status(404).json({
        status: 'erro',
        message: 'Template não encontrado'
      });
    }

    // Get user from API key or JWT
    let user;
    if (req.user) {
      user = await MemoryUser.findById(req.user.id);
    } else if (req.apiKeyUser) {
      user = req.apiKeyUser;
    }

    if (!user) {
      return res.status(401).json({
        status: 'erro',
        message: 'Usuário não encontrado'
      });
    }

    // Check if user can access premium template
    const userLimits = MemoryUser.getPlanLimits(user.plan);
    if (template.isPremium && !userLimits.premiumTemplates) {
      return res.status(403).json({
        status: 'erro',
        message: 'Template premium disponível apenas para planos Pro e Enterprise'
      });
    }

    // Sample data for preview
    const sampleData = {
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      endereco: 'São Paulo, SP',
      resumo: 'Profissional experiente com mais de 5 anos de atuação na área de tecnologia.',
      experiencias: [
        {
          empresa: 'Tech Company',
          cargo: 'Desenvolvedor Senior',
          periodo: '2020 - Atual',
          descricao: 'Desenvolvimento de aplicações web usando tecnologias modernas.'
        },
        {
          empresa: 'StartUp Inc',
          cargo: 'Desenvolvedor Pleno',
          periodo: '2018 - 2020',
          descricao: 'Participação em projetos inovadores e desenvolvimento de MVPs.'
        }
      ],
      educacao: [
        {
          instituicao: 'Universidade Federal',
          curso: 'Ciência da Computação',
          periodo: '2014 - 2018'
        }
      ],
      habilidades: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git']
    };

    // Generate preview HTML
    let previewHTML = template.htmlContent;
    
    // Replace placeholders
    previewHTML = previewHTML.replace(/{{nome}}/g, sampleData.nome);
    previewHTML = previewHTML.replace(/{{email}}/g, sampleData.email);
    previewHTML = previewHTML.replace(/{{telefone}}/g, sampleData.telefone);
    previewHTML = previewHTML.replace(/{{endereco}}/g, sampleData.endereco);
    previewHTML = previewHTML.replace(/{{resumo}}/g, sampleData.resumo);
    
    // Replace experiences
    const experienciasHTML = sampleData.experiencias.map(exp => `
      <div class="experiencia-item">
        <h4>${exp.cargo}</h4>
        <h5>${exp.empresa}</h5>
        <p class="periodo">${exp.periodo}</p>
        <p>${exp.descricao}</p>
      </div>
    `).join('');
    previewHTML = previewHTML.replace(/{{experiencias}}/g, experienciasHTML);
    
    // Replace education
    const educacaoHTML = sampleData.educacao.map(edu => `
      <div class="educacao-item">
        <h4>${edu.curso}</h4>
        <h5>${edu.instituicao}</h5>
        <p class="periodo">${edu.periodo}</p>
      </div>
    `).join('');
    previewHTML = previewHTML.replace(/{{educacao}}/g, educacaoHTML);
    
    // Replace skills
    const habilidadesHTML = sampleData.habilidades.map(skill => 
      `<span class="skill-tag">${skill}</span>`
    ).join(' ');
    previewHTML = previewHTML.replace(/{{habilidades}}/g, habilidadesHTML);

    // Complete HTML with CSS
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Preview - ${template.name}</title>
        <style>
          ${template.cssStyles}
        </style>
      </head>
      <body>
        ${previewHTML}
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(fullHTML);

  } catch (error) {
    console.error('Template preview error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Create template (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await MemoryUser.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'erro',
        message: 'Acesso negado. Apenas administradores podem criar templates.'
      });
    }

    const {
      name,
      description,
      category,
      isPremium = false,
      htmlContent,
      cssStyles
    } = req.body;

    // Validation
    if (!name || !description || !category || !htmlContent) {
      return res.status(400).json({
        status: 'erro',
        message: 'Campos obrigatórios: name, description, category, htmlContent'
      });
    }

    const template = await MemoryTemplate.create({
      name,
      description,
      category,
      isPremium,
      htmlContent,
      cssStyles: cssStyles || '',
      isActive: true
    });

    res.status(201).json({
      status: 'sucesso',
      message: 'Template criado com sucesso',
      data: {
        template: {
          id: template._id,
          name: template.name,
          description: template.description,
          category: template.category,
          isPremium: template.isPremium,
          createdAt: template.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Update template (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await MemoryUser.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'erro',
        message: 'Acesso negado. Apenas administradores podem editar templates.'
      });
    }

    const template = await MemoryTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        status: 'erro',
        message: 'Template não encontrado'
      });
    }

    const {
      name,
      description,
      category,
      isPremium,
      htmlContent,
      cssStyles,
      isActive
    } = req.body;

    // Update template
    Object.assign(template, {
      ...(name && { name }),
      ...(description && { description }),
      ...(category && { category }),
      ...(isPremium !== undefined && { isPremium }),
      ...(htmlContent && { htmlContent }),
      ...(cssStyles !== undefined && { cssStyles }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date()
    });

    res.json({
      status: 'sucesso',
      message: 'Template atualizado com sucesso',
      data: {
        template: {
          id: template._id,
          name: template.name,
          description: template.description,
          category: template.category,
          isPremium: template.isPremium,
          isActive: template.isActive,
          updatedAt: template.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Delete template (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await MemoryUser.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'erro',
        message: 'Acesso negado. Apenas administradores podem deletar templates.'
      });
    }

    const template = await MemoryTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        status: 'erro',
        message: 'Template não encontrado'
      });
    }

    // Soft delete - just mark as inactive
    template.isActive = false;
    template.updatedAt = new Date();

    res.json({
      status: 'sucesso',
      message: 'Template deletado com sucesso'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;