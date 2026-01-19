const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  personalInfo: {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: String,
    endereco: String,
    linkedin: String,
    github: String,
    website: String,
    foto: String // URL da foto
  },
  resumo: String,
  experiencias: [{
    empresa: { type: String, required: true },
    cargo: { type: String, required: true },
    periodo: { type: String, required: true },
    descricao: String,
    localizacao: String
  }],
  educacao: [{
    instituicao: { type: String, required: true },
    curso: { type: String, required: true },
    periodo: String,
    descricao: String
  }],
  habilidades: [String],
  idiomas: [{
    idioma: String,
    nivel: { type: String, enum: ['básico', 'intermediário', 'avançado', 'fluente', 'nativo'] }
  }],
  certificacoes: [{
    nome: String,
    instituicao: String,
    data: String,
    url: String
  }],
  projetos: [{
    nome: String,
    descricao: String,
    tecnologias: [String],
    url: String
  }],
  pdfUrl: String,
  fileName: String,
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CV', cvSchema);