const http = require('http');

// Test the health endpoint
const testHealth = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Health Check Response:');
      console.log(JSON.parse(data));
      console.log('\n🎉 CVGen API está funcionando corretamente!');
      console.log('📚 Acesse a documentação em: http://localhost:3000/api-docs');
      console.log('🔧 API Base URL: http://localhost:3000');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro ao conectar com a API:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando com: node server.js');
  });

  req.end();
};

// Wait a moment for server to start, then test
setTimeout(testHealth, 2000);