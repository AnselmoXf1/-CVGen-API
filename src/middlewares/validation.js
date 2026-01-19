const Joi = require('joi');

// User registration validation
const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    plan: Joi.string().valid('free', 'pro', 'enterprise').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'erro',
      message: error.details[0].message
    });
  }
  next();
};

// User login validation
const validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'erro',
      message: error.details[0].message
    });
  }
  next();
};

// CV creation validation
const validateCVCreation = (req, res, next) => {
  const schema = Joi.object({
    templateId: Joi.string().required(),
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    telefone: Joi.string().optional(),
    endereco: Joi.string().optional(),
    linkedin: Joi.string().uri().optional(),
    github: Joi.string().uri().optional(),
    website: Joi.string().uri().optional(),
    resumo: Joi.string().max(500).optional(),
    experiencias: Joi.array().items(
      Joi.object({
        empresa: Joi.string().required(),
        cargo: Joi.string().required(),
        periodo: Joi.string().required(),
        descricao: Joi.string().optional(),
        localizacao: Joi.string().optional()
      })
    ).optional(),
    educacao: Joi.array().items(
      Joi.object({
        instituicao: Joi.string().required(),
        curso: Joi.string().required(),
        periodo: Joi.string().optional(),
        descricao: Joi.string().optional()
      })
    ).optional(),
    habilidades: Joi.array().items(Joi.string()).optional(),
    idiomas: Joi.array().items(
      Joi.object({
        idioma: Joi.string().required(),
        nivel: Joi.string().valid('básico', 'intermediário', 'avançado', 'fluente', 'nativo').required()
      })
    ).optional(),
    certificacoes: Joi.array().items(
      Joi.object({
        nome: Joi.string().required(),
        instituicao: Joi.string().optional(),
        data: Joi.string().optional(),
        url: Joi.string().uri().optional()
      })
    ).optional(),
    projetos: Joi.array().items(
      Joi.object({
        nome: Joi.string().required(),
        descricao: Joi.string().optional(),
        tecnologias: Joi.array().items(Joi.string()).optional(),
        url: Joi.string().uri().optional()
      })
    ).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'erro',
      message: error.details[0].message
    });
  }
  next();
};

// Template creation validation
const validateTemplateCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).required(),
    htmlContent: Joi.string().required(),
    cssStyles: Joi.string().required(),
    isPremium: Joi.boolean().optional(),
    category: Joi.string().valid('professional', 'creative', 'modern', 'classic').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'erro',
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCVCreation,
  validateTemplateCreation
};