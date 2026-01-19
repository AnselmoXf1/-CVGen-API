const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import middlewares
const { generalLimiter } = require('./src/middlewares/rateLimiter');
const { logApiRequest } = require('./src/middlewares/logger');

// Import routes
const authRoutes = require('./src/routes/auth');
const cvRoutes = require('./src/routes/cv');
const templateRoutes = require('./src/routes/templates');
const clientRoutes = require('./src/routes/clients');

// Import swagger
const { specs, swaggerUi, swaggerOptions } = require('./src/docs/swagger');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mozdjob.com', 'https://bluevisiontech.com']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// API logging
app.use(logApiRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'sucesso',
    message: 'CVGen API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API Routes
app.use('/auth', authRoutes);
app.use('/cv', cvRoutes);
app.use('/templates', templateRoutes);
app.use('/clients', clientRoutes);

// Serve static files (PDFs)
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'sucesso',
    message: 'Bem-vindo à CVGen API - BlueVision Tech',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: '/auth',
      cv: '/cv',
      templates: '/templates',
      clients: '/clients (admin only)'
    },
    authentication: {
      jwt: 'Bearer token in Authorization header',
      apiKey: 'x-api-key header for external integrations'
    },
    plans: {
      free: { cvLimit: 20, premiumTemplates: false },
      pro: { cvLimit: 500, premiumTemplates: true },
      enterprise: { cvLimit: 'unlimited', premiumTemplates: true }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'erro',
    message: 'Endpoint não encontrado',
    availableEndpoints: ['/auth', '/cv', '/templates', '/clients']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      status: 'erro',
      message: 'Erro de validação',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      status: 'erro',
      message: `${field} já existe`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'erro',
      message: 'Token inválido'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'erro',
      message: 'Token expirado'
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    status: 'erro',
    message: error.message || 'Erro interno do servidor'
  });
});

module.exports = app;