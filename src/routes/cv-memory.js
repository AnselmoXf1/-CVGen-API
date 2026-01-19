const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const MemoryCV = require('../models/MemoryCV');
const MemoryUser = require('../models/MemoryUser');
const MemoryTemplate = require('../models/MemoryTemplate');
const { authenticateToken, authenticateJwtOrApiKey } = require('../middlewares/auth-memory');
const { validateCVCreation } = require('../middlewares/validation');
const { cvGenerationLimiter } = require('../middlewares/rateLimiter');
const pdfService = require('../services/pdfService');
const temporaryStorage = require('../services/temporaryStorageService');

// Create CV
router.post('/', cvGenerationLimiter, authenticateJwtOrApiKey, validateCVCreation, async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      endereco = '',
      resumo,
      experiencias = [],
      educacao = [],
      habilidades = [],
      templateId
    } = req.body;

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

    // Check if user can create CV (plan limits)
    if (!MemoryUser.canCreateCV(user)) {
      const limits = MemoryUser.getPlanLimits(user.plan);
      return res.status(403).json({
        status: 'erro',
        message: `Limite de CVs atingido para o plano ${user.plan}. Limite: ${limits.cvLimit} CVs por mês`
      });
    }

    // Get template
    const template = await MemoryTemplate.findById(templateId);
    if (!template || !template.isActive) {
      return res.status(404).json({
        status: 'erro',
        message: 'Template não encontrado'
      });
    }

    // Check if user can use premium template
    const userLimits = MemoryUser.getPlanLimits(user.plan);
    if (template.isPremium && !userLimits.premiumTemplates) {
      return res.status(403).json({
        status: 'erro',
        message: 'Template premium disponível apenas para planos Pro e Enterprise'
      });
    }

    // Create CV data
    const cvData = {
      userId: user._id,
      templateId,
      nome,
      email,
      telefone,
      endereco,
      resumo,
      experiencias,
      educacao,
      habilidades,
      status: 'processing'
    };

    // Create CV record
    const cv = await MemoryCV.create(cvData);

    try {
      // Generate PDF com armazenamento temporário
      const pdfResult = await pdfService.generatePDF(template.htmlContent, template.cssStyles, cvData);
      
      // Atualizar CV com informações do arquivo temporário
      cv.status = 'completed';
      cv.downloadUrl = pdfResult.downloadUrl;
      cv.expiresAt = pdfResult.expiresAt;
      cv.fileType = pdfResult.type; // 'temporary'
      cv.fileName = pdfResult.fileName;

      // Update user monthly usage
      user.monthlyUsage.cvCount++;
      await MemoryUser.updateUser(user._id, user);

      // Update template usage count
      template.usageCount++;

      res.status(201).json({
        status: 'sucesso',
        message: 'CV gerado com sucesso! Baixe imediatamente.',
        data: {
          cvId: cv._id,
          downloadUrl: pdfResult.downloadUrl,
          directDownload: `${process.env.API_BASE_URL}${pdfResult.downloadUrl}`,
          expiresAt: pdfResult.expiresAt,
          fileName: pdfResult.fileName,
          size: pdfResult.size,
          status: cv.status,
          createdAt: cv.createdAt,
          warning: 'Este arquivo será automaticamente deletado em 1 hora. Baixe imediatamente!'
        }
      });

    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      
      // Update CV status to failed
      cv.status = 'failed';
      cv.errorMessage = pdfError.message;

      res.status(500).json({
        status: 'erro',
        message: 'Erro ao gerar PDF do CV',
        error: pdfError.message
      });
    }

  } catch (error) {
    console.error('CV creation error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// List user CVs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user.id };
    if (status) query.status = status;

    const cvs = await MemoryCV.find(query);
    
    // Simple pagination for memory DB
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCVs = cvs.slice(startIndex, endIndex);

    const cvsWithTemplates = await Promise.all(
      paginatedCVs.map(async (cv) => {
        const template = await MemoryTemplate.findById(cv.templateId);
        return {
          id: cv._id,
          nome: cv.nome,
          email: cv.email,
          status: cv.status,
          template: template ? {
            id: template._id,
            name: template.name,
            category: template.category
          } : null,
          pdfUrl: cv.pdfUrl,
          downloadUrl: cv.pdfUrl ? `${process.env.API_BASE_URL}/cv/${cv._id}/download` : null,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt
        };
      })
    );

    res.json({
      status: 'sucesso',
      data: {
        cvs: cvsWithTemplates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(cvs.length / limit),
          totalItems: cvs.length,
          itemsPerPage: parseInt(limit)
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
});

// Get CV details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const cv = await MemoryCV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({
        status: 'erro',
        message: 'CV não encontrado'
      });
    }

    // Check if user owns this CV
    if (cv.userId !== req.user.id) {
      return res.status(403).json({
        status: 'erro',
        message: 'Acesso negado'
      });
    }

    const template = await MemoryTemplate.findById(cv.templateId);

    res.json({
      status: 'sucesso',
      data: {
        cv: {
          id: cv._id,
          nome: cv.nome,
          email: cv.email,
          telefone: cv.telefone,
          endereco: cv.endereco,
          resumo: cv.resumo,
          experiencias: cv.experiencias,
          educacao: cv.educacao,
          habilidades: cv.habilidades,
          status: cv.status,
          template: template ? {
            id: template._id,
            name: template.name,
            category: template.category
          } : null,
          pdfUrl: cv.pdfUrl,
          downloadUrl: cv.pdfUrl ? `${process.env.API_BASE_URL}/cv/${cv._id}/download` : null,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get CV error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Download CV PDF
router.get('/:id/download', async (req, res) => {
  try {
    const cv = await MemoryCV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({
        status: 'erro',
        message: 'CV não encontrado'
      });
    }

    if (!cv.pdfPath || cv.status !== 'completed') {
      return res.status(404).json({
        status: 'erro',
        message: 'PDF não disponível'
      });
    }

    // Check if file exists
    try {
      await fs.access(cv.pdfPath);
    } catch {
      return res.status(404).json({
        status: 'erro',
        message: 'Arquivo PDF não encontrado'
      });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv_${cv.nome.replace(/\s+/g, '_')}.pdf"`);
    
    // Send file
    res.sendFile(path.resolve(cv.pdfPath));

  } catch (error) {
    console.error('Download CV error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Delete CV
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cv = await MemoryCV.findById(req.params.id);
    
    if (!cv) {
      return res.status(404).json({
        status: 'erro',
        message: 'CV não encontrado'
      });
    }

    // Check if user owns this CV
    if (cv.userId !== req.user.id) {
      return res.status(403).json({
        status: 'erro',
        message: 'Acesso negado'
      });
    }

    // Delete PDF file if exists
    if (cv.pdfPath) {
      try {
        await fs.unlink(cv.pdfPath);
      } catch (error) {
        console.log('PDF file not found or already deleted:', error.message);
      }
    }

    // Delete CV from memory
    await MemoryCV.findByIdAndDelete(cv._id);

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
});

module.exports = router;