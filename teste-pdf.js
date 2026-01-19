const http = require('http');

async function testarPDF() {
  console.log('🧪 Testando geração de PDF...\n');

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@bluevisiontech.com',
      password: 'admin123456'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Erro no login:', loginResponse.dados);
      return;
    }

    const token = loginResponse.dados.data.token;
    console.log('✅ Login OK');

    // 2. Gerar API Key
    console.log('\n2️⃣ Gerando API Key...');
    const apiKeyResp = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/api-key',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, { name: 'Teste PDF' });

    const apiKey = apiKeyResp.dados.data.apiKey;
    console.log('✅ API Key gerada');

    // 3. Listar templates
    console.log('\n3️⃣ Listando templates...');
    const templatesResp = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/templates',
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    });

    const templates = templatesResp.dados.data.templates;
    const templateId = templates[0].id;
    console.log(`✅ Usando template: ${templates[0].name}`);

    // 4. Criar CV
    console.log('\n4️⃣ Criando CV...');
    const cvData = {
      templateId: templateId,
      nome: 'Teste PDF User',
      email: 'teste@pdf.com',
      telefone: '(11) 99999-9999',
      resumo: 'Testando geração de PDF com Puppeteer',
      experiencias: [{
        empresa: 'BlueVision Tech',
        cargo: 'Desenvolvedor',
        periodo: '2024 - Atual',
        descricao: 'Desenvolvimento da CVGen API'
      }],
      educacao: [{
        instituicao: 'Universidade Teste',
        curso: 'Ciência da Computação',
        periodo: '2020 - 2024'
      }],
      habilidades: ['JavaScript', 'Node.js', 'Puppeteer', 'PDF Generation']
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
    }, cvData);

    if (cvResp.status === 201) {
      console.log('✅ CV criado com sucesso!');
      console.log(`📄 URL: ${cvResp.dados.data.pdfUrl}`);
      console.log(`🆔 ID: ${cvResp.dados.data.id}`);
      
      // Verificar se é PDF ou HTML
      if (cvResp.dados.data.pdfUrl.includes('.pdf')) {
        console.log('🎉 PDF GERADO COM SUCESSO!');
      } else {
        console.log('⚠️  Gerado como HTML (fallback)');
      }
    } else {
      console.log('❌ Erro ao criar CV:', cvResp.dados);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

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
          resolve({ status: res.statusCode, dados: resposta });
        } catch (error) {
          resolve({ status: res.statusCode, dados: dadosResposta });
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

// Executar teste
setTimeout(testarPDF, 2000);