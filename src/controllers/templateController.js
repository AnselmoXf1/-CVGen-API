const Template = require('../models/Template');

class TemplateController {
  // Create new template (Admin only)
  async createTemplate(req, res) {
    try {
      const { name, description, htmlContent, cssStyles, isPremium, category } = req.body;

      const template = new Template({
        name,
        description,
        htmlContent,
        cssStyles,
        isPremium: isPremium || false,
        category: category || 'professional'
      });

      await template.save();

      res.status(201).json({
        status: 'sucesso',
        message: 'Template criado com sucesso',
        data: { template }
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // List templates
  async listTemplates(req, res) {
    try {
      const { category, premium } = req.query;
      const userPlan = req.user?.plan || 'free';
      
      let filter = { isActive: true };
      
      // Filter by category if specified
      if (category) {
        filter.category = category;
      }

      // Filter premium templates based on user plan
      const userLimits = req.user?.getPlanLimits() || { premiumTemplates: false };
      if (!userLimits.premiumTemplates) {
        filter.isPremium = false;
      } else if (premium === 'true') {
        filter.isPremium = true;
      } else if (premium === 'false') {
        filter.isPremium = false;
      }

      const templates = await Template.find(filter)
        .select('name description category isPremium previewImage usageCount createdAt')
        .sort({ usageCount: -1, createdAt: -1 });

      res.json({
        status: 'sucesso',
        data: {
          templates: templates.map(template => ({
            id: template._id,
            name: template.name,
            description: template.description,
            category: template.category,
            isPremium: template.isPremium,
            previewImage: template.previewImage,
            usageCount: template.usageCount,
            available: !template.isPremium || userLimits.premiumTemplates
          }))
        }
      });
    } catch (error) {
      console.error('List templates error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Get template details
  async getTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          status: 'erro',
          message: 'Template não encontrado'
        });
      }

      // Check if user can access premium template
      const userLimits = req.user?.getPlanLimits() || { premiumTemplates: false };
      if (template.isPremium && !userLimits.premiumTemplates) {
        return res.status(403).json({
          status: 'erro',
          message: 'Template premium requer plano Pro ou Enterprise'
        });
      }

      res.json({
        status: 'sucesso',
        data: { template }
      });
    } catch (error) {
      console.error('Get template error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Update template (Admin only)
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({
          status: 'erro',
          message: 'Template não encontrado'
        });
      }

      // Update template
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          template[key] = updateData[key];
        }
      });

      await template.save();

      res.json({
        status: 'sucesso',
        message: 'Template atualizado com sucesso',
        data: { template }
      });
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Delete template (Admin only)
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;

      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({
          status: 'erro',
          message: 'Template não encontrado'
        });
      }

      // Soft delete - just mark as inactive
      template.isActive = false;
      await template.save();

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
  }

  // Get template preview (returns HTML for preview)
  async previewTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          status: 'erro',
          message: 'Template não encontrado'
        });
      }

      // Sample data for preview
      const sampleData = {
        personalInfo: {
          nome: 'João Silva',
          email: 'joao@email.com',
          telefone: '(11) 99999-9999',
          endereco: 'São Paulo, SP',
          linkedin: 'linkedin.com/in/joaosilva',
          github: 'github.com/joaosilva'
        },
        resumo: 'Desenvolvedor Full Stack com 5 anos de experiência em tecnologias web modernas.',
        experiencias: [{
          empresa: 'Tech Company',
          cargo: 'Desenvolvedor Senior',
          periodo: '2020 - Atual',
          descricao: 'Desenvolvimento de aplicações web usando React e Node.js'
        }],
        educacao: [{
          instituicao: 'Universidade de São Paulo',
          curso: 'Ciência da Computação',
          periodo: '2015 - 2019'
        }],
        habilidades: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git']
      };

      // Compile template with sample data
      const pdfService = require('../services/pdfService');
      const compiledHTML = pdfService.compileTemplate(
        template.htmlContent,
        template.cssStyles,
        sampleData
      );

      res.setHeader('Content-Type', 'text/html');
      res.send(compiledHTML);
    } catch (error) {
      console.error('Preview template error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Get template categories
  async getCategories(req, res) {
    try {
      const categories = await Template.distinct('category', { isActive: true });
      
      res.json({
        status: 'sucesso',
        data: { categories }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new TemplateController();