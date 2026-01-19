const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import middlewares
const { generalLimiter } = require('./src/middlewares/rateLimiter');

// Import routes
const authRoutes = require('./src/routes/auth-memory');
const cvRoutes = require('./src/routes/cv-memory');
const templateRoutes = require('./src/routes/templates-memory');
const downloadRoutes = require('./src/routes/download-temp');

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
    ? ['https://mozdjob.com', 'https://bluevisiontech.vercel.app']
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'sucesso',
    message: 'CVGen API está funcionando (Memory DB)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'memory'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API Routes
app.use('/auth', authRoutes);
app.use('/cv', cvRoutes);
app.use('/templates', templateRoutes);
app.use('/download', downloadRoutes);

// Serve static files (PDFs)
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'sucesso',
    message: 'Bem-vindo à CVGen API - BlueVision Tech (Memory DB)',
    version: '1.0.0',
    database: 'memory',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: '/auth',
      cv: '/cv',
      templates: '/templates'
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
    availableEndpoints: ['/auth', '/cv', '/templates']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
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