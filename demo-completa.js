const http = require('http');

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

async function demoCompleta() {
  console.log('🚀 CVGen API - Demo Completa para mozdjob.com\n');

  try {
    // 1. Login como admin
    console.log('1️⃣ Fazendo login...');
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
    console.log('✅ Login realizado');

    // 2. Gerar API Key para mozdjob
    console.log('\n2️⃣ Gerando API Key para mozdjob.com...');
    const apiKeyResp = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/api-key',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, { name: 'mozdjob.com Integration' });

    const apiKey = apiKeyResp.dados.data.apiKey;
    console.log(`✅ API Key gerada: ${apiKey.substring(0, 20)}...`);

    // 3. Simular dados de candidatos do mozdjob
    const candidatos = [
      {
        nome: 'Ana Paula Santos',
        email: 'ana.santos@email.com',
        telefone: '(11) 99999-1111',
        area: 'Desenvolvimento Frontend',
        experiencia: 'Senior',
        dados: {
          resumo: 'Desenvolvedora Frontend Senior com 6 anos de experiência em React, Vue.js e Angular.',
          experiencias: [
            {
              empresa: 'Google Brasil',
              cargo: 'Senior Frontend Developer',
              periodo: '2021 - Atual',
              descricao: 'Desenvolvimento de interfaces para produtos Google usando React e TypeScript.'
            },
            {
              empresa: 'Nubank',
              cargo: 'Frontend Developer',
              periodo: '2019 - 2021',
              descricao: 'Criação de componentes reutilizáveis e otimização de performance.'
            }
          ],
          educacao: [
            {
              instituicao: 'USP',
              curso: 'Ciência da Computação',
              periodo: '2015 - 2019'
            }
          ],
          habilidades: ['React', 'Vue.js', 'TypeScript', 'JavaScript', 'CSS3', 'HTML5', 'Git', 'Jest']
        }
      },
      {
        nome: 'Carlos Eduardo Lima',
        email: 'carlos.lima@email.com',
        telefone: '(21) 88888-2222',
        area: 'Backend Development',
        experiencia: 'Pleno',
        dados: {
          resumo: 'Desenvolvedor Backend especializado em Node.js e Python com foco em APIs escaláveis.',
          experiencias: [
            {
              empresa: 'iFood',
              cargo: 'Backend Developer',
              periodo: '2020 - Atual',
              descricao: 'Desenvolvimento de microserviços usando Node.js, MongoDB e Redis.'
            }
          ],
          educacao: [
            {
              instituicao: 'UFRJ',
              curso: 'Engenharia de Software',
              periodo: '2016 - 2020'
            }
          ],
          habilidades: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Redis']
        }
      },
      {
        nome: 'Fernanda Costa Silva',
        email: 'fernanda.silva@email.com',
        telefone: '(31) 77777-3333',
        area: 'Full Stack',
        experiencia: 'Junior',
        dados: {
          resumo: 'Desenvolvedora Full Stack Junior apaixonada por tecnologia e aprendizado contínuo.',
          experiencias: [
            {
              empresa: 'Startup Tech',
              cargo: 'Desenvolvedora Junior',
              periodo: '2023 - Atual',
              descricao: 'Desenvolvimento de aplicações web usando React e Node.js.'
            }
          ],
          educacao: [
            {
              instituicao: 'UFMG',
              curso: 'Sistemas de Informação',
              periodo: '2019 - 2023'
            }
          ],
          habilidades: ['React', 'Node.js', 'JavaScript', 'HTML', 'CSS', 'Git', 'MySQL']
        }
      }
    ];

    // 4. Listar templates
    console.log('\n3️⃣ Listando templates disponíveis...');
    const templates = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/templates',
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    });

    const templatesDisponiveis = templates.dados.data.templates;
    console.log(`✅ ${templatesDisponiveis.length} templates encontrados:`);
    templatesDisponiveis.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category}) ${template.isPremium ? '👑 Premium' : '🆓 Free'}`);
    });

    // 5. Gerar CVs para cada candidato
    console.log('\n4️⃣ Gerando CVs para candidatos do mozdjob...');
    const cvsGerados = [];

    for (let i = 0; i < candidatos.length; i++) {
      const candidato = candidatos[i];
      console.log(`\n📋 Candidato ${i + 1}: ${candidato.nome} (${candidato.area})`);
      
      // Escolher template baseado na experiência
      let templateEscolhido;
      if (candidato.experiencia === 'Senior') {
        templateEscolhido = templatesDisponiveis.find(t => t.name.includes('Executivo')) || templatesDisponiveis[0];
      } else if (candidato.experiencia === 'Pleno') {
        templateEscolhido = templatesDisponiveis.find(t => t.name.includes('Moderno')) || templatesDisponiveis[1];
      } else {
        templateEscolhido = templatesDisponiveis.find(t => !t.isPremium) || templatesDisponiveis[2];
      }

      console.log(`   📄 Template: ${templateEscolhido.name}`);

      // Preparar dados do CV
      const dadosCV = {
        templateId: templateEscolhido.id,
        nome: candidato.nome,
        email: candidato.email,
        telefone: candidato.telefone,
        resumo: candidato.dados.resumo,
        experiencias: candidato.dados.experiencias,
        educacao: candidato.dados.educacao,
        habilidades: candidato.dados.habilidades
      };

      // Gerar CV
      const cvResp = await fazerRequisicao({
        hostname: 'localhost',
        port: 3000,
        path: '/cv',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }, dadosCV);

      if (cvResp.status === 201) {
        console.log(`   ✅ CV gerado com sucesso!`);
        console.log(`   📄 URL: ${cvResp.dados.data.pdfUrl}`);
        console.log(`   🆔 ID: ${cvResp.dados.data.id}`);
        
        cvsGerados.push({
          candidato: candidato.nome,
          cvId: cvResp.dados.data.id,
          url: cvResp.dados.data.pdfUrl,
          template: templateEscolhido.name
        });
      } else {
        console.log(`   ❌ Erro: ${cvResp.dados.message}`);
      }
    }

    // 6. Resumo final
    console.log('\n5️⃣ Resumo da geração de CVs:');
    console.log(`✅ ${cvsGerados.length}/${candidatos.length} CVs gerados com sucesso`);
    
    cvsGerados.forEach((cv, index) => {
      console.log(`   ${index + 1}. ${cv.candidato} - ${cv.template}`);
      console.log(`      📄 ${cv.url}`);
    });

    // 7. Estatísticas da API
    console.log('\n6️⃣ Verificando estatísticas...');
    const todosCVs = await fazerRequisicao({
      hostname: 'localhost',
      port: 3000,
      path: '/cv',
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    });

    if (todosCVs.status === 200) {
      const totalCVs = todosCVs.dados.data.cvs.length;
      console.log(`📊 Total de CVs na conta: ${totalCVs}`);
      
      // Agrupar por status
      const porStatus = {};
      todosCVs.dados.data.cvs.forEach(cv => {
        porStatus[cv.status] = (porStatus[cv.status] || 0) + 1;
      });
      
      Object.keys(porStatus).forEach(status => {
        console.log(`   ${status}: ${porStatus[status]} CVs`);
      });
    }

    console.log('\n🎉 DEMO COMPLETA FINALIZADA!');
    console.log('\n📋 Integração mozdjob.com + CVGen API:');
    console.log('✅ Autenticação via API Key');
    console.log('✅ Seleção automática de templates');
    console.log('✅ Geração de CVs em lote');
    console.log('✅ Monitoramento de estatísticas');
    console.log('✅ URLs de download prontas');

    console.log('\n🔗 Para integrar no mozdjob.com:');
    console.log(`1. Use esta API Key: ${apiKey}`);
    console.log('2. Endpoint base: http://localhost:3000');
    console.log('3. Documentação: http://localhost:3000/api-docs');
    console.log('4. Implemente tratamento de erros');
    console.log('5. Configure webhooks para notificações');

  } catch (error) {
    console.error('❌ Erro na demo:', error.message);
  }
}

// Executar demo
console.log('⏳ Iniciando demo completa em 3 segundos...');
setTimeout(demoCompleta, 3000);