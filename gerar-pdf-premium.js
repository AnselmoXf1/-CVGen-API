// Script para gerar um PDF premium
const http = require('http');

const API_URL = 'localhost';
const API_PORT = 3000;

function makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_URL,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function gerarPDFPremium() {
    console.log('🎨 Gerando PDF Premium - CVGen API\n');

    try {
        // 1. Carregar templates disponíveis
        console.log('1. Carregando templates...');
        const templatesResponse = await makeRequest('/templates');
        const templates = templatesResponse.data.data.templates;
        
        console.log('✅ Templates disponíveis:');
        templates.forEach(template => {
            console.log(`   - ${template.name} (${template.isPremium ? '💎 Premium' : '🆓 Gratuito'})`);
        });

        // 2. Encontrar template premium
        const premiumTemplate = templates.find(t => t.isPremium);
        if (!premiumTemplate) {
            console.log('❌ Nenhum template premium encontrado!');
            return;
        }

        console.log(`\n2. Usando template premium: ${premiumTemplate.name}`);

        // 3. Fazer login como admin (que tem acesso a templates premium)
        console.log('\n3. Fazendo login como admin...');
        const loginData = {
            email: 'admin@bluevisiontech.com',
            password: 'password' // Senha padrão do admin
        };

        const loginResponse = await makeRequest('/auth/login', 'POST', loginData);
        
        if (loginResponse.data.status !== 'sucesso') {
            console.log('❌ Erro ao fazer login:', loginResponse.data.message);
            return;
        }

        console.log('✅ Login realizado como:', loginResponse.data.data.user.name);
        console.log('   Plano:', loginResponse.data.data.user.plan.toUpperCase());
        const token = loginResponse.data.data.token;

        // 4. Criar CV com dados profissionais
        console.log('\n4. Criando CV premium...');
        const cvData = {
            templateId: premiumTemplate.id,
            nome: 'Maria Silva Santos',
            email: 'maria.santos@email.com',
            telefone: '+55 (11) 99999-8888',
            endereco: 'São Paulo, SP - Brasil',
            linkedin: 'https://linkedin.com/in/maria-santos',
            github: 'https://github.com/maria-santos',
            resumo: 'Executiva sênior com mais de 15 anos de experiência em liderança de equipes de tecnologia, transformação digital e gestão de produtos. Especialista em estratégias de crescimento, inovação e desenvolvimento de soluções escaláveis para empresas de grande porte.',
            experiencias: [
                {
                    empresa: 'TechCorp International',
                    cargo: 'Chief Technology Officer (CTO)',
                    periodo: '2020 - Atual',
                    descricao: 'Liderança da estratégia tecnológica da empresa, gerenciando equipe de 150+ desenvolvedores. Responsável pela migração para cloud, implementação de DevOps e aumento de 300% na performance dos sistemas.'
                },
                {
                    empresa: 'InnovaTech Solutions',
                    cargo: 'Diretora de Engenharia',
                    periodo: '2017 - 2020',
                    descricao: 'Gestão de múltiplas equipes de desenvolvimento, implementação de metodologias ágeis e lançamento de 5 produtos que geraram R$ 50M+ em receita anual.'
                },
                {
                    empresa: 'StartupXYZ',
                    cargo: 'Head of Product',
                    periodo: '2014 - 2017',
                    descricao: 'Liderança do desenvolvimento de produto desde MVP até escala, crescimento de 0 a 1M+ usuários ativos. Responsável por roadmap, UX/UI e estratégia de produto.'
                },
                {
                    empresa: 'Consultoria Tech',
                    cargo: 'Senior Software Architect',
                    periodo: '2010 - 2014',
                    descricao: 'Arquitetura de sistemas complexos para clientes enterprise, mentoria técnica e definição de padrões de desenvolvimento para equipes distribuídas.'
                }
            ],
            educacao: [
                {
                    instituicao: 'Stanford University',
                    curso: 'Executive Program in Leadership',
                    periodo: '2019'
                },
                {
                    instituicao: 'Universidade de São Paulo (USP)',
                    curso: 'Mestrado em Ciência da Computação',
                    periodo: '2008 - 2010'
                },
                {
                    instituicao: 'Instituto Tecnológico de Aeronáutica (ITA)',
                    curso: 'Bacharelado em Engenharia da Computação',
                    periodo: '2004 - 2008'
                }
            ],
            habilidades: [
                'Liderança Executiva',
                'Transformação Digital',
                'Arquitetura de Software',
                'Cloud Computing (AWS, Azure)',
                'DevOps & CI/CD',
                'Metodologias Ágeis',
                'Gestão de Produtos',
                'Python, Java, JavaScript',
                'Machine Learning',
                'Blockchain',
                'Microserviços',
                'Kubernetes',
                'Data Science',
                'Estratégia Tecnológica',
                'Gestão de Equipes'
            ],
            certificacoes: [
                {
                    nome: 'AWS Solutions Architect Professional',
                    instituicao: 'Amazon Web Services',
                    data: '2023'
                },
                {
                    nome: 'Certified Kubernetes Administrator',
                    instituicao: 'Cloud Native Computing Foundation',
                    data: '2022'
                }
            ],
            idiomas: [
                { idioma: 'Português', nivel: 'nativo' },
                { idioma: 'Inglês', nivel: 'fluente' },
                { idioma: 'Espanhol', nivel: 'avançado' }
            ]
        };

        console.log(`   Template: ${premiumTemplate.name}`);
        console.log(`   Categoria: ${premiumTemplate.category}`);
        console.log(`   Candidato: ${cvData.nome}`);

        const cvResponse = await makeRequest('/cv', 'POST', cvData, {
            'Authorization': `Bearer ${token}`
        });

        if (cvResponse.data.status === 'sucesso') {
            console.log('\n🎉 PDF Premium gerado com sucesso!');
            console.log('📄 Detalhes do CV:');
            console.log(`   ID: ${cvResponse.data.data.cvId}`);
            console.log(`   Status: ${cvResponse.data.data.status}`);
            console.log(`   PDF URL: ${cvResponse.data.data.pdfUrl}`);
            console.log(`   Download: ${cvResponse.data.data.downloadUrl}`);
            
            console.log('\n💎 Características Premium:');
            console.log('   ✅ Template premium usado');
            console.log('   ✅ Design profissional avançado');
            console.log('   ✅ Layout executivo');
            console.log('   ✅ Dados completos e detalhados');
            console.log('   ✅ Múltiplas seções (experiência, educação, habilidades, certificações)');
            
            console.log('\n🌐 Acesse o PDF:');
            console.log(`   Browser: ${cvResponse.data.data.pdfUrl}`);
            console.log(`   Download direto: ${cvResponse.data.data.downloadUrl}`);
            
        } else {
            console.log('❌ Erro ao gerar CV:', cvResponse.data.message);
            console.log('   Resposta completa:', JSON.stringify(cvResponse.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar geração
gerarPDFPremium();