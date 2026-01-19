const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testCompleteFlow() {
  console.log('🧪 Testando CVGen API - Fluxo Completo\n');

  try {
    // 1. Test Health
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Health Check: OK');
    } else {
      console.log('❌ Health Check: FALHOU');
      return;
    }

    // 2. Test Login
    console.log('\n2️⃣ Testando Login Admin...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@bluevisiontech.com',
      password: 'admin123456'
    });

    if (loginResponse.status === 200 && loginResponse.data.data?.token) {
      console.log('✅ Login Admin: OK');
      const token = loginResponse.data.data.token;
      
      // 3. Test Templates List
      console.log('\n3️⃣ Testando Lista de Templates...');
      const templatesResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/templates',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (templatesResponse.status === 200 && templatesResponse.data.data?.templates) {
        console.log('✅ Templates: OK');
        console.log(`📋 ${templatesResponse.data.data.templates.length} templates encontrados`);
        
        const templates = templatesResponse.data.data.templates;
        if (templates.length > 0) {
          const templateId = templates[0].id;
          
          // 4. Generate API Key
          console.log('\n4️⃣ Gerando API Key...');
          const apiKeyResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/auth/api-key',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }, {
            name: 'Test API Key'
          });

          if (apiKeyResponse.status === 200 && apiKeyResponse.data.data?.apiKey) {
            console.log('✅ API Key: OK');
            const apiKey = apiKeyResponse.data.data.apiKey;
            
            // 5. Test CV Creation
            console.log('\n5️⃣ Testando Criação de CV...');
            const cvResponse = await makeRequest({
              hostname: 'localhost',
              port: 3000,
              path: '/cv',
              method: 'POST',
              headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
              }
            }, {
              templateId: templateId,
              nome: 'João Silva Teste',
              email: 'joao.teste@email.com',
              telefone: '11999999999',
              resumo: 'Desenvolvedor Full Stack com experiência em Node.js e React',
              experiencias: [{
                empresa: 'Tech Company',
                cargo: 'Desenvolvedor Senior',
                periodo: '2020 - 2024',
                descricao: 'Desenvolvimento de aplicações web modernas'
              }],
              educacao: [{
                instituicao: 'Universidade de São Paulo',
                curso: 'Ciência da Computação',
                periodo: '2016 - 2020'
              }],
              habilidades: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Express']
            });

            if (cvResponse.status === 201 && cvResponse.data.data?.pdfUrl) {
              console.log('✅ Criação de CV: OK');
              console.log(`📄 CV gerado: ${cvResponse.data.data.pdfUrl}`);
              
              console.log('\n🎉 TODOS OS TESTES PASSARAM!');
              console.log('\n📊 Resumo:');
              console.log('✅ Health Check');
              console.log('✅ Login Admin');
              console.log('✅ Lista Templates');
              console.log('✅ Geração API Key');
              console.log('✅ Criação de CV');
              console.log('\n🚀 CVGen API está 100% funcional!');
              console.log('🔗 Acesse: http://localhost:3000/api-docs');
              
            } else {
              console.log('❌ Criação de CV: FALHOU');
              console.log('Response:', cvResponse);
            }
          } else {
            console.log('❌ API Key: FALHOU');
            console.log('Response:', apiKeyResponse);
          }
        }
      } else {
        console.log('❌ Templates: FALHOU');
        console.log('Response:', templatesResponse);
      }
    } else {
      console.log('❌ Login Admin: FALHOU');
      console.log('Response:', loginResponse);
    }

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando: node server.js');
  }
}

// Wait a moment for server to be ready, then test
setTimeout(testCompleteFlow, 3000);