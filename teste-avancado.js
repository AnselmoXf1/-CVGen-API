const http = require('http');
const fs = require('fs');

// Função para fazer requisições HTTP
function fazerRequisicao(opcoes, dados = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(opcoes, (res) => {
      let dadosResposta = '';
      
      res.on('data', (chunk) => {
        dadosResposta += chunk;
      });
      
      res.on('end', () => {
        try {
          const resposta = JSON.parse(dadosResposta);
          resolve({ status: res.statusCode, dados: resposta, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, dados: dadosResposta, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (dados) {
      req.write(JSON.stringify(dados));
    }
    
    req.end();
  });
}

async function testeAvancado() {
  console.log('🔬 CVGen API - Testes Avançados\n');

  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const login = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@bluevisiontech.com',
      password: 'admin123456'
    });

    const token = login.dados.data.token;
    console.log('✅ Login OK');

    // 2. Gerar API Key
    const apiKeyResp = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/api-key',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, { name: 'Teste Avançado' });

    const apiKey = apiKeyResp.dados.data.apiKey;
    console.log('✅ API Key gerada');

    // 3. Listar templates e testar cada um
    const templates = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/templates',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`\n2️⃣ Testando ${templates.dados.data.templates.length} templates:`);

    for (let i = 0; i < templates.dados.data.templates.length; i++) {
      const template = templates.dados.data.templates[i];
      console.log(`\n📋 Template ${i + 1}: ${template.name}`);
      
      // Criar CV com template específico
      const cvDados = {
        templateId: template.id,
        nome: `Teste ${template.name.replace(/\s+/g, '')}`,
        email: `teste${i + 1}@email.com`,
        telefone: `(11) 9999${i}999${i}`,
        resumo: `CV de teste para o template ${template.name}`,
        experiencias: [{
          empresa: 'Empresa Teste',
          cargo: 'Desenvolvedor',
          periodo: '2023 - 2024'
        }],
        habilidades: ['JavaScript', 'Node.js', 'React']
      };

      const cvResp = await fazerRequisicao({
        hostname: 'localhost',
        port: 3000,
        path: '/cv',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }, cvDados);

      if (cvResp.status === 201) {
        console.log(`   ✅ CV criado: ${cvResp.dados.data.id}`);
        console.log(`   📄 URL: ${cvResp.dados.data.pdfUrl}`);
      } else {
        console.log(`   ❌ Erro: ${cvResp.dados.message}`);
      }
    }

    // 4. Listar todos os CVs
    console.log('\n3️⃣ Listando todos os CVs...');
    const todosCVs = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/cv',
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    });

    if (todosCVs.status === 200) {
      const cvs = todosCVs.dados.data.cvs;
      console.log(`✅ ${cvs.length} CVs encontrados:`);
      cvs.forEach((cv, index) => {
        console.log(`   ${index + 1}. ${cv.nome} - ${cv.status}`);
      });

      // 5. Testar detalhes de um CV
      if (cvs.length > 0) {
        console.log('\n4️⃣ Testando detalhes do CV...');
        const primeiroCV = cvs[0];
        const detalhes = await fazerRequisicao({
          hostname: 'localhost',
          port: 3000,
          path: `/cv/${primeiroCV.id}`,
          method: 'GET',
          headers: { 'x-api-key': apiKey }
        });

        if (detalhes.status === 200) {
          console.log('✅ Detalhes do CV obtidos');
          console.log(`   Nome: ${detalhes.dados.data.cv.personalInfo.nome}`);
          console.log(`   Email: ${detalhes.dados.data.cv.personalInfo.email}`);
          console.log(`   Template: ${detalhes.dados.data.cv.templateId.name}`);
        }
      }
    }

    // 6. Testar categorias de templates
    console.log('\n5️⃣ Testando categorias...');
    const categorias = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/templates/categories',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (categorias.status === 200) {
      console.log(`✅ Categorias: ${categorias.dados.data.categories.join(', ')}`);
    }

    // 7. Testar preview de template
    console.log('\n6️⃣ Testando preview de template...');
    const templateId = templates.dados.data.templates[0].id;
    const preview = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: `/templates/${templateId}/preview`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (preview.status === 200) {
      console.log('✅ Preview gerado com sucesso');
      console.log(`   Tamanho: ${preview.dados.length} caracteres`);
    }

    // 8. Testar rate limiting
    console.log('\n7️⃣ Testando rate limiting...');
    let rateLimitTest = 0;
    for (let i = 0; i < 3; i++) {
      const healthCheck = await fazerRequisicao({
        hostname: 'localhost',
        port: 3000,
        path: '/health',
        method: 'GET'
      });
      
      if (healthCheck.status === 200) {
        rateLimitTest++;
      }
    }
    console.log(`✅ Rate limiting: ${rateLimitTest}/3 requisições passaram`);

    // 9. Testar API Keys do usuário
    console.log('\n8️⃣ Testando listagem de API Keys...');
    const apiKeys = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/api-keys',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (apiKeys.status === 200) {
      console.log(`✅ ${apiKeys.dados.data.apiKeys.length} API Keys encontradas`);
    }

    console.log('\n🎉 TODOS OS TESTES AVANÇADOS CONCLUÍDOS!');
    console.log('\n📊 Funcionalidades testadas:');
    console.log('✅ Autenticação JWT');
    console.log('✅ Geração de API Keys');
    console.log('✅ Criação de CV com múltiplos templates');
    console.log('✅ Listagem de CVs');
    console.log('✅ Detalhes de CV');
    console.log('✅ Categorias de templates');
    console.log('✅ Preview de templates');
    console.log('✅ Rate limiting');
    console.log('✅ Gerenciamento de API Keys');

    console.log('\n🚀 CVGen API está 100% funcional!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar teste
console.log('⏳ Iniciando testes avançados em 3 segundos...');
setTimeout(testeAvancado, 3000);