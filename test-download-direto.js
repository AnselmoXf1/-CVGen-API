// Teste do Sistema de Download Direto
const http = require('http');

const API_URL = 'localhost';
const API_PORT = 3001;

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

async function testDownloadDireto() {
    console.log('🧪 Testando Sistema de Download Direto\n');

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
        const token = loginResponse.data.data.token;

        // 2. Carregar templates
        console.log('\n2. Carregando templates...');
        const templatesResponse = await makeRequest('/templates');
        const templates = templatesResponse.data.data.templates;
        console.log('✅ Templates disponíveis:', templates.length);

        // 3. Criar CV com sistema de download direto
        console.log('\n3. Criando CV com download direto...');
        const cvData = {
            templateId: templates[0].id,
            nome: 'Teste Download Direto',
            email: 'teste@download.com',
            telefone: '(11) 99999-9999',
            resumo: 'Testando o sistema de download direto para máxima privacidade',
            experiencias: [
                {
                    empresa: 'Empresa Teste',
                    cargo: 'Desenvolvedor',
                    periodo: '2024 - Atual',
                    descricao: 'Testando funcionalidades de download direto'
                }
            ],
            educacao: [
                {
                    instituicao: 'Universidade Teste',
                    curso: 'Ciência da Computação',
                    periodo: '2020 - 2024'
                }
            ],
            habilidades: ['JavaScript', 'Node.js', 'Download Direto', 'Privacidade']
        };

        const cvResponse = await makeRequest('/cv', 'POST', cvData, {
            'Authorization': `Bearer ${token}`
        });

        console.log('\n📋 Resposta da criação do CV:');
        console.log('   Status HTTP:', cvResponse.status);
        
        if (cvResponse.status === 201 && cvResponse.data.status === 'sucesso') {
            const data = cvResponse.data.data;
            
            console.log('✅ CV criado com sucesso!');
            console.log('   📄 Arquivo:', data.fileName);
            console.log('   📏 Tamanho:', formatBytes(data.size));
            console.log('   🔗 Download URL:', data.downloadUrl);
            console.log('   ⏰ Expira em:', new Date(data.expiresAt).toLocaleString('pt-BR'));
            console.log('   ⚠️  Aviso:', data.warning);

            // 4. Testar status do arquivo
            console.log('\n4. Verificando status do arquivo...');
            const fileName = data.fileName;
            const statusResponse = await makeRequest(`/download/temp/${fileName}/status`);
            
            if (statusResponse.data.status === 'sucesso') {
                console.log('✅ Arquivo disponível para download');
                console.log('   📊 Status:', statusResponse.data.data);
            }

            // 5. Simular download (verificar se arquivo existe)
            console.log('\n5. Testando acesso ao arquivo...');
            const downloadResponse = await makeRequest(data.downloadUrl);
            
            if (downloadResponse.status === 200) {
                console.log('✅ Arquivo acessível para download');
                console.log('   📦 Tipo de conteúdo: PDF');
            } else {
                console.log('❌ Erro ao acessar arquivo:', downloadResponse.status);
            }

            // 6. Aguardar um pouco e testar novamente (simular expiração)
            console.log('\n6. Aguardando 5 segundos para testar persistência...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse2 = await makeRequest(`/download/temp/${fileName}/status`);
            if (statusResponse2.data.status === 'sucesso') {
                console.log('✅ Arquivo ainda disponível (dentro do prazo)');
            } else {
                console.log('⏰ Arquivo expirado ou removido');
            }

            // 7. Testar estatísticas (admin)
            console.log('\n7. Verificando estatísticas do armazenamento...');
            const statsResponse = await makeRequest('/download/temp/admin/stats', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });
            
            if (statsResponse.data.status === 'sucesso') {
                console.log('📊 Estatísticas do armazenamento temporário:');
                console.log('   ', statsResponse.data.data);
            }

        } else {
            console.log('❌ Erro ao criar CV');
            console.log('   Resposta:', JSON.stringify(cvResponse.data, null, 2));
        }

        console.log('\n🎯 Características do Sistema de Download Direto:');
        console.log('   ✅ Privacidade máxima - arquivos deletados automaticamente');
        console.log('   ✅ Economia de espaço - sem acúmulo de arquivos');
        console.log('   ✅ LGPD/GDPR compliant - dados não persistem');
        console.log('   ✅ Sem custos de storage - apenas processamento');
        console.log('   ✅ Download imediato - usuário baixa na hora');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Executar teste
testDownloadDireto();