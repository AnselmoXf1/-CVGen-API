// Teste para verificar se o admin consegue criar CV via API
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

async function testAdminCV() {
    console.log('🧪 Testando criação de CV pelo admin...\n');

    try {
        // 1. Login como admin
        console.log('1. Fazendo login como admin...');
        const loginData = {
            email: 'admin@bluevisiontech.com',
            password: 'password'
        };

        const loginResponse = await makeRequest('/auth/login', 'POST', loginData);
        
        if (loginResponse.data.status !== 'sucesso') {
            console.log('❌ Erro no login:', loginResponse.data.message);
            return;
        }

        console.log('✅ Login realizado:', loginResponse.data.data.user.name);
        console.log('   Plano:', loginResponse.data.data.user.plan);
        const token = loginResponse.data.data.token;
        console.log('   Token:', token.substring(0, 50) + '...');

        // 2. Carregar templates
        console.log('\n2. Carregando templates...');
        const templatesResponse = await makeRequest('/templates');
        const templates = templatesResponse.data.data.templates;
        console.log('✅ Templates disponíveis:', templates.length);

        // 3. Criar CV com token JWT
        console.log('\n3. Criando CV com token JWT...');
        const cvData = {
            templateId: templates[0].id, // Primeiro template
            nome: 'Admin Teste',
            email: 'admin@teste.com',
            telefone: '(11) 99999-9999',
            resumo: 'Administrador do sistema testando criação de CV',
            experiencias: [
                {
                    empresa: 'BlueVision Tech',
                    cargo: 'Administrador',
                    periodo: '2024 - Atual',
                    descricao: 'Gerenciamento do sistema CVGen'
                }
            ],
            educacao: [
                {
                    instituicao: 'Universidade Tech',
                    curso: 'Administração de Sistemas',
                    periodo: '2020 - 2024'
                }
            ],
            habilidades: ['Administração', 'Node.js', 'MongoDB']
        };

        console.log('   Template:', templates[0].name);
        console.log('   Dados:', JSON.stringify(cvData, null, 2));

        const cvResponse = await makeRequest('/cv', 'POST', cvData, {
            'Authorization': `Bearer ${token}`
        });

        console.log('\n📋 Resposta da API:');
        console.log('   Status HTTP:', cvResponse.status);
        console.log('   Resposta:', JSON.stringify(cvResponse.data, null, 2));

        if (cvResponse.status === 201 && cvResponse.data.status === 'sucesso') {
            console.log('\n🎉 CV criado com sucesso!');
            console.log('   ID:', cvResponse.data.data.cvId);
            console.log('   PDF URL:', cvResponse.data.data.pdfUrl);
        } else {
            console.log('\n❌ Erro ao criar CV');
            if (cvResponse.status === 401) {
                console.log('   🔐 Erro de autenticação - Token inválido ou expirado');
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar teste
testAdminCV();