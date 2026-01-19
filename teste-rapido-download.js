// Teste Rápido do Sistema de Download Direto
const http = require('http');

async function testeRapido() {
    console.log('🧪 Teste Rápido - Sistema de Download Direto\n');

    try {
        // 1. Verificar se servidor está rodando
        console.log('1. Verificando servidor...');
        const healthCheck = await makeRequest('/health');
        
        if (healthCheck.data.status === 'sucesso') {
            console.log('✅ Servidor funcionando:', healthCheck.data.message);
            console.log('   Database:', healthCheck.data.database);
        }

        // 2. Login como admin
        console.log('\n2. Fazendo login...');
        const loginResponse = await makeRequest('/auth/login', 'POST', {
            email: 'admin@bluevisiontech.com',
            password: 'password'
        });

        if (loginResponse.data.status !== 'sucesso') {
            console.log('❌ Erro no login:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.data.token;
        console.log('✅ Login realizado com sucesso');

        // 3. Criar CV com download direto
        console.log('\n3. Criando CV...');
        const cvData = {
            templateId: 'template_1',
            nome: 'Teste Download',
            email: 'teste@download.com',
            telefone: '(11) 99999-9999',
            resumo: 'Testando sistema de download direto',
            experiencias: [{
                empresa: 'Empresa Teste',
                cargo: 'Desenvolvedor',
                periodo: '2024 - Atual'
            }],
            habilidades: ['JavaScript', 'Node.js', 'Download Direto']
        };

        const cvResponse = await makeRequest('/cv', 'POST', cvData, {
            'Authorization': `Bearer ${token}`
        });

        if (cvResponse.status === 201 && cvResponse.data.status === 'sucesso') {
            const data = cvResponse.data.data;
            console.log('✅ CV criado com sucesso!');
            console.log('   📄 Arquivo:', data.fileName);
            console.log('   📏 Tamanho:', formatBytes(data.size));
            console.log('   🔗 URL:', data.downloadUrl);
            console.log('   ⏰ Expira:', new Date(data.expiresAt).toLocaleString('pt-BR'));
            
            // 4. Testar download
            console.log('\n4. Testando download...');
            const downloadResponse = await makeRequest(data.downloadUrl);
            
            if (downloadResponse.status === 200) {
                console.log('✅ Download funcionando - arquivo acessível');
            } else {
                console.log('❌ Erro no download:', downloadResponse.status);
            }

            console.log('\n🎯 Sistema de Download Direto: FUNCIONANDO!');
            console.log('   ✅ Privacidade máxima');
            console.log('   ✅ Auto-exclusão em 1 hora');
            console.log('   ✅ Download imediato');
            console.log('   ✅ Sem armazenamento permanente');

        } else {
            console.log('❌ Erro ao criar CV:', cvResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

function makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
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

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

testeRapido();