const app = require('./app-memory');
const pdfService = require('./src/services/pdfService');

const PORT = process.env.PORT || 3000;

// Initialize memory database
console.log('🌱 Inicializando banco de dados em memória...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await pdfService.closeBrowser();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await pdfService.closeBrowser();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 CVGen API - BlueVision Tech (Memory DB)
📍 Servidor rodando na porta ${PORT}
🌐 URL: http://localhost:${PORT}
📚 Documentação: http://localhost:${PORT}/api-docs
🔧 Ambiente: ${process.env.NODE_ENV || 'development'}
💾 Banco: Memória (para demonstração)
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;