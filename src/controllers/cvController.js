const CV = require('../models/CV');
const Template = require('../models/Template');
const User = require('../models/User');
const pdfService = require('../services/pdfService');
const path = require('path');
const fs = require('fs').promises;

class CVController {
  // Create new CV
  async createCV(req, res) {
    try {
      const userId = req.user.id;
      const cvData = req.body;

      // Check if user can create CV (plan limits)
      if (!req.user.canCreateCV()) {
        return res.status(403).json({
          status: 'erro',
          message: 'Limite mensal de CVs excedido. Faça upgrade do seu plano.'
        });
      }

      // Validate template
      const template = await Template.findById(cvData.templateId);
      if (!template || !template.isActive) {
        return res.status(404).json({
          status: 'erro',
          message: 'Template não encontrado'
        });
      }

      // Check if template is premium and user has access
      if (template.isPremium && !req.user.getPlanLimits().premiumTemplates) {
        return res.status(403).json({
          status: 'erro',
          message: 'Template premium requer plano Pro ou Enterprise'
        });
      }

      // Create CV record
      const cv = new CV({
        userId,
        templateId: cvData.templateId,
        personalInfo: {
          nome: cvData.nome,
          email: cvData.email,
          telefone: cvData.telefone,
          endereco: cvData.endereco,
          linkedin: cvData.linkedin,
          github: cvData.github,
          website: cvData.website,
          foto: cvData.foto
        },
        resumo: cvData.resumo,
        experiencias: cvData.experiencias || [],
        educacao: cvData.educacao || [],
        habilidades: cvData.habilidades || [],
        idiomas: cvData.idiomas || [],
        certificacoes: cvData.certificacoes || [],
        projetos: cvData.projetos || [],
        status: 'processing'
      });

      await cv.save();

      // Generate PDF asynchronously
      try {
        const pdfResult = await pdfService.generatePDF(
          template.htmlContent,
          template.cssStyles,
          {
            personalInfo: cv.personalInfo,
            resumo: cv.resumo,
            experiencias: cv.experiencias,
            educacao: cv.educacao,
            habilidades: cv.habilidades,
            idiomas: cv.idiomas,
            certificacoes: cv.certificacoes,
            projetos: cv.projetos,
            nome: cv.personalInfo.nome
          }
        );

        // Update CV with PDF info
        cv.pdfUrl = pdfResult.url;
        cv.fileName = pdfResult.fileName;
        cv.status = 'completed';
        await cv.save();

        // Update user usage count
        req.user.monthlyUsage.cvCount += 1;
        await req.user.save();

        // Update template usage count
        template.usageCount += 1;
        await template.save();

        res.status(201).json({
          status: 'sucesso',
          message: 'CV criado com sucesso',
          data: {
            id: cv._id,
            pdfUrl: cv.pdfUrl,
            status: cv.status
          }
        });
      } catch (pdfError) {
        // Update CV status to failed
        cv.status = 'failed';
        await cv.save();

        console.error('PDF generation failed:', pdfError);
        res.status(500).json({
          status: 'erro',
          message: 'Erro ao gerar PDF do CV'
        });
      }
    } catch (error) {
      console.error('Create CV error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // List user CVs
  async listCVs(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const cvs = await CV.find({ userId })
        .populate('templateId', 'name category')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await CV.countDocuments({ userId });

      res.json({
        status: 'sucesso',
        data: {
          cvs: cvs.map(cv => ({
            id: cv._id,
            nome: cv.personalInfo.nome,
            template: cv.templateId?.name,
            status: cv.status,
            pdfUrl: cv.pdfUrl,
            createdAt: cv.createdAt
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('List CVs error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Get CV details
  async getCVDetails(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const cv = await CV.findOne({ _id: id, userId })
        .populate('templateId', 'name description category');

      if (!cv) {
        return res.status(404).json({
          status: 'erro',
          message: 'CV não encontrado'
        });
      }

      res.json({
        status: 'sucesso',
        data: { cv }
      });
    } catch (error) {
      console.error('Get CV details error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Download CV PDF
  async downloadCV(req, res) {
    try {
      const { fileName } = req.params;
      
      // Find CV by filename
      const cv = await CV.findOne({ fileName });
      if (!cv) {
        return res.status(404).json({
          status: 'erro',
          message: 'CV não encontrado'
        });
      }

      // Check if user owns the CV or if it's accessed via API key
      if (req.user && cv.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'erro',
          message: 'Acesso negado'
        });
      }

      const filePath = path.join(process.env.PDF_STORAGE_PATH || './storage/pdfs', fileName);
      
      try {
        await fs.access(filePath);
        res.download(filePath, fileName);
      } catch (fileError) {
        res.status(404).json({
          status: 'erro',
          message: 'Arquivo PDF não encontrado'
        });
      }
    } catch (error) {
      console.error('Download CV error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Delete CV
  async deleteCV(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const cv = await CV.findOne({ _id: id, userId });
      if (!cv) {
        return res.status(404).json({
          status: 'erro',
          message: 'CV não encontrado'
        });
      }

      // Delete PDF file
      if (cv.fileName) {
        await pdfService.deletePDF(cv.fileName);
      }

      // Delete CV record
      await CV.findByIdAndDelete(id);

      res.json({
        status: 'sucesso',
        message: 'CV deletado com sucesso'
      });
    } catch (error) {
      console.error('Delete CV error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Update CV
  async updateCV(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const cv = await CV.findOne({ _id: id, userId });
      if (!cv) {
        return res.status(404).json({
          status: 'erro',
          message: 'CV não encontrado'
        });
      }

      // Update CV data
      Object.keys(updateData).forEach(key => {
        if (key !== 'templateId' && updateData[key] !== undefined) {
          cv[key] = updateData[key];
        }
      });

      cv.status = 'processing';
      await cv.save();

      // Regenerate PDF if needed
      if (updateData.templateId || Object.keys(updateData).length > 0) {
        try {
          const template = await Template.findById(cv.templateId);
          
          const pdfResult = await pdfService.generatePDF(
            template.htmlContent,
            template.cssStyles,
            {
              personalInfo: cv.personalInfo,
              resumo: cv.resumo,
              experiencias: cv.experiencias,
              educacao: cv.educacao,
              habilidades: cv.habilidades,
              idiomas: cv.idiomas,
              certificacoes: cv.certificacoes,
              projetos: cv.projetos,
              nome: cv.personalInfo.nome
            }
          );

          // Delete old PDF
          if (cv.fileName) {
            await pdfService.deletePDF(cv.fileName);
          }

          cv.pdfUrl = pdfResult.url;
          cv.fileName = pdfResult.fileName;
          cv.status = 'completed';
          await cv.save();
        } catch (pdfError) {
          cv.status = 'failed';
          await cv.save();
          throw pdfError;
        }
      }

      res.json({
        status: 'sucesso',
        message: 'CV atualizado com sucesso',
        data: {
          id: cv._id,
          pdfUrl: cv.pdfUrl,
          status: cv.status
        }
      });
    } catch (error) {
      console.error('Update CV error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new CVController();