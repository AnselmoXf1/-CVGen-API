const app = require('./app');
const connectDB = require('./src/config/database');
const seedDatabase = require('./src/utils/seedData');
const pdfService = require('./src/services/pdfService');

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Seed database with initial data
if (process.env.NODE_ENV !== 'production') {
  seedDatabase();
}

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
🚀 CVGen API - BlueVision Tech
📍 Servidor rodando na porta ${PORT}
🌐 URL: http://localhost:${PORT}
📚 Documentação: http://localhost:${PORT}/api-docs
🔧 Ambiente: ${process.env.NODE_ENV || 'development'}
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