const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CVGen API - BlueVision Tech',
      version: '1.0.0',
      description: 'API SaaS para geração automática de currículos (CVs) em PDF',
      contact: {
        name: 'BlueVision Tech',
        email: 'contato@bluevisiontech.com',
        url: 'https://bluevisiontech.vercel.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.bluevisiontech.com',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key para integração externa'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso inválido ou ausente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'erro'
                  },
                  message: {
                    type: 'string',
                    example: 'Token de acesso requerido'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acesso negado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'erro'
                  },
                  message: {
                    type: 'string',
                    example: 'Acesso negado'
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'erro'
                  },
                  message: {
                    type: 'string',
                    example: 'Recurso não encontrado'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'erro'
                  },
                  message: {
                    type: 'string',
                    example: 'Dados inválidos'
                  }
                }
              }
            }
          }
        },
        RateLimitError: {
          description: 'Limite de requisições excedido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'erro'
                  },
                  message: {
                    type: 'string',
                    example: 'Muitas requisições. Tente novamente em alguns minutos.'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Autenticação e gerenciamento de API Keys'
      },
      {
        name: 'CV',
        description: 'Geração e gerenciamento de currículos'
      },
      {
        name: 'Templates',
        description: 'Templates para currículos'
      },
      {
        name: 'Clients',
        description: 'Gerenciamento de clientes (Admin)'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1f2937; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'CVGen API - BlueVision Tech',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};