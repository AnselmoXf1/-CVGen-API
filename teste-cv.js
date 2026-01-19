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

async function testarAPI() {
  console.log('🚀 Testando CVGen API - Criação de CV\n');

  try {
    // 1. Fazer login como admin
    console.log('1️⃣ Fazendo login como admin...');
    const loginResposta = await fazerRequisicao({
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

    if (loginResposta.status === 200 && loginResposta.dados.data?.token) {
      console.log('✅ Login realizado com sucesso!');
      const token = loginResposta.dados.data.token;
      console.log(`🔑 Token: ${token.substring(0, 20)}...`);
      
      // 2. Listar templates
      console.log('\n2️⃣ Listando templates disponíveis...');
      const templatesResposta = await fazerRequisicao({
        hostname: 'localhost',
        port: 3000,
        path: '/templates',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (templatesResposta.status === 200) {
        const templates = templatesResposta.dados.data.templates;
        console.log(`✅ ${templates.length} templates encontrados:`);
        
        templates.forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name} (${template.category}) ${template.isPremium ? '👑 Premium' : '🆓 Free'}`);
        });

        if (templates.length > 0) {
          const templateId = templates[0].id;
          console.log(`\n📋 Usando template: ${templates[0].name}`);
          
          // 3. Gerar API Key
          console.log('\n3️⃣ Gerando API Key...');
          const apiKeyResposta = await fazerRequisicao({
            hostname: 'localhost',
            port: 3000,
            path: '/auth/api-key',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }, {
            name: 'Teste API Key'
          });

          if (apiKeyResposta.status === 200) {
            const apiKey = apiKeyResposta.dados.data.apiKey;
            console.log('✅ API Key gerada com sucesso!');
            console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
            
            // 4. Criar CV usando API Key
            console.log('\n4️⃣ Criando CV...');
            const cvDados = {
              templateId: templateId,
              nome: 'João Silva Santos',
              email: 'joao.santos@email.com',
              telefone: '(11) 99999-9999',
              endereco: 'São Paulo, SP',
              linkedin: 'https://linkedin.com/in/joaosantos',
              github: 'https://github.com/joaosantos',
              resumo: 'Desenvolvedor Full Stack com 5 anos de experiência em tecnologias modernas como Node.js, React e MongoDB. Especialista em desenvolvimento de APIs RESTful e aplicações web escaláveis.',
              experiencias: [
                {
                  empresa: 'BlueVision Tech',
                  cargo: 'Desenvolvedor Senior',
                  periodo: '2022 - Atual',
                  descricao: 'Desenvolvimento de APIs SaaS e sistemas de geração de PDF. Liderança técnica em projetos de alta complexidade.',
                  localizacao: 'São Paulo, SP'
                },
                {
                  empresa: 'TechCorp Solutions',
                  cargo: 'Desenvolvedor Full Stack',
                  periodo: '2020 - 2022',
                  descricao: 'Desenvolvimento de aplicações web usando React, Node.js e MongoDB. Implementação de sistemas de autenticação e autorização.',
                  localizacao: 'São Paulo, SP'
                }
              ],
              educacao: [
                {
                  instituicao: 'Universidade de São Paulo',
                  curso: 'Bacharelado em Ciência da Computação',
                  periodo: '2016 - 2020',
                  descricao: 'Formação sólida em algoritmos, estruturas de dados e engenharia de software.'
                }
              ],
              habilidades: [
                'JavaScript', 'Node.js', 'React', 'MongoDB', 'Express.js',
                'HTML5', 'CSS3', 'Git', 'Docker', 'AWS', 'REST APIs',
                'JWT', 'Puppeteer', 'Swagger', 'Jest'
              ],
              idiomas: [
                { idioma: 'Português', nivel: 'nativo' },
                { idioma: 'Inglês', nivel: 'avançado' },
                { idioma: 'Espanhol', nivel: 'intermediário' }
              ],
              certificacoes: [
                {
                  nome: 'AWS Certified Developer',
                  instituicao: 'Amazon Web Services',
                  data: '2023',
                  url: 'https://aws.amazon.com/certification/'
                },
                {
                  nome: 'MongoDB Certified Developer',
                  instituicao: 'MongoDB University',
                  data: '2022'
                }
              ],
              projetos: [
                {
                  nome: 'CVGen API',
                  descricao: 'API SaaS para geração automática de currículos em PDF com múltiplos templates e sistema de planos.',
                  tecnologias: ['Node.js', 'Express', 'MongoDB', 'Puppeteer', 'JWT'],
                  url: 'https://github.com/bluevisiontech/cvgen-api'
                },
                {
                  nome: 'E-commerce Platform',
                  descricao: 'Plataforma completa de e-commerce com painel administrativo e integração de pagamentos.',
                  tecnologias: ['React', 'Node.js', 'Stripe', 'PostgreSQL']
                }
              ]
            };

            const cvResposta = await fazerRequisicao({
              hostname: 'localhost',
              port: 3000,
              path: '/cv',
              method: 'POST',
              headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
              }
            }, cvDados);

            if (cvResposta.status === 201) {
              console.log('✅ CV criado com sucesso!');
              console.log(`📄 URL do CV: ${cvResposta.dados.data.pdfUrl}`);
              console.log(`📊 Status: ${cvResposta.dados.data.status}`);
              console.log(`🆔 ID do CV: ${cvResposta.dados.data.id}`);
              
              // 5. Listar CVs do usuário
              console.log('\n5️⃣ Listando CVs criados...');
              const listaCVs = await fazerRequisicao({
                hostname: 'localhost',
                port: 3000,
                path: '/cv',
                method: 'GET',
                headers: {
                  'x-api-key': apiKey
                }
              });

              if (listaCVs.status === 200) {
                const cvs = listaCVs.dados.data.cvs;
                console.log(`✅ ${cvs.length} CV(s) encontrado(s):`);
                cvs.forEach((cv, index) => {
                  console.log(`   ${index + 1}. ${cv.nome} - ${cv.status} (${new Date(cv.createdAt).toLocaleDateString('pt-BR')})`);
                });
              }

              console.log('\n🎉 TESTE COMPLETO REALIZADO COM SUCESSO!');
              console.log('\n📋 Resumo dos testes:');
              console.log('✅ Login de administrador');
              console.log('✅ Listagem de templates');
              console.log('✅ Geração de API Key');
              console.log('✅ Criação de CV completo');
              console.log('✅ Listagem de CVs');
              
              console.log('\n🔗 Links úteis:');
              console.log('📚 Documentação: http://localhost:3000/api-docs');
              console.log('🏥 Health Check: http://localhost:3000/health');
              console.log('🌐 API Base: http://localhost:3000');
              
            } else {
              console.log('❌ Erro ao criar CV:', cvResposta.dados);
            }
          } else {
            console.log('❌ Erro ao gerar API Key:', apiKeyResposta.dados);
          }
        }
      } else {
        console.log('❌ Erro ao listar templates:', templatesResposta.dados);
      }
    } else {
      console.log('❌ Erro no login:', loginResposta.dados);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando: node server.js');
  }
}

// Aguardar um pouco para o servidor inicializar, depois executar teste
console.log('⏳ Aguardando servidor inicializar...');
setTimeout(testarAPI, 5000);