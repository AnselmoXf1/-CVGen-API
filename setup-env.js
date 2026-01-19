#!/usr/bin/env node

// Script para configurar arquivo .env automaticamente
const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
}

async function setupEnvironment() {
    console.log('🔧 Configurador de Ambiente CVGen API\n');

    // Perguntas básicas
    const environment = await question('Ambiente (development/production/integration): ');
    const port = await question('Porta do servidor (3000): ') || '3000';
    const companyName = await question('Nome da sua empresa: ');
    const adminEmail = await question('Email do administrador: ');
    
    // Configuração do banco
    console.log('\n📊 Configuração do Banco de Dados:');
    console.log('1. Memory Database (desenvolvimento)');
    console.log('2. MongoDB Local');
    console.log('3. MongoDB Atlas (produção)');
    
    const dbChoice = await question('Escolha o tipo de banco (1-3): ');
    let mongoUri;
    
    switch(dbChoice) {
        case '1':
            mongoUri = 'memory://localhost';
            break;
        case '2':
            mongoUri = 'mongodb://localhost:27017/cvgen-api';
            break;
        case '3':
            const mongoUser = await question('Usuário MongoDB Atlas: ');
            const mongoPass = await question('Senha MongoDB Atlas: ');
            const mongoCluster = await question('Cluster MongoDB Atlas: ');
            mongoUri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}.mongodb.net/cvgen-api?retryWrites=true&w=majority`;
            break;
        default:
            mongoUri = 'memory://localhost';
    }

    // URL da API
    let apiBaseUrl;
    if (environment === 'development') {
        apiBaseUrl = `http://localhost:${port}`;
    } else {
        apiBaseUrl = await question('URL pública da API (ex: https://api.suaempresa.com): ');
    }

    // CORS Origins
    let corsOrigins;
    if (environment === 'development') {
        corsOrigins = `http://localhost:3000,http://localhost:8080,http://127.0.0.1:8080`;
    } else {
        corsOrigins = await question('Domínios autorizados (separados por vírgula): ');
    }

    // Gerar chaves JWT
    const jwtSecret = generateSecretKey();
    const jwtRefreshSecret = generateSecretKey();

    // Senha do admin
    const adminPassword = await question('Senha do administrador: ');

    // Criar conteúdo do .env
    const envContent = `# CVGen API - Configuração de Ambiente
# Gerado automaticamente em ${new Date().toISOString()}

# ===== CONFIGURAÇÃO DO SERVIDOR =====
PORT=${port}
NODE_ENV=${environment}

# ===== BANCO DE DADOS =====
MONGODB_URI=${mongoUri}

# ===== SEGURANÇA JWT =====
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRE=${environment === 'development' ? '24h' : '2h'}
JWT_REFRESH_EXPIRE=7d

# ===== CONFIGURAÇÃO DA API =====
API_BASE_URL=${apiBaseUrl}
PDF_STORAGE_PATH=./storage/pdfs

# ===== CORS - DOMÍNIOS AUTORIZADOS =====
CORS_ORIGINS=${corsOrigins}

# ===== RATE LIMITING =====
RATE_LIMIT_WINDOW_MS=${environment === 'development' ? '60000' : '900000'}
RATE_LIMIT_MAX_REQUESTS=${environment === 'development' ? '1000' : '100'}

# ===== CREDENCIAIS DO ADMIN =====
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}

# ===== BRANDING =====
COMPANY_NAME=${companyName}
BRAND_COLOR=#2563eb

# ===== DEBUG =====
DEBUG=${environment === 'development' ? 'true' : 'false'}
LOG_LEVEL=${environment === 'development' ? 'debug' : 'info'}

# ===== CONFIGURAÇÕES OPCIONAIS =====
# Descomente e configure conforme necessário:

# API Keys
# API_KEY_EXPIRY=never
# MAX_API_KEYS_PER_USER=10

# Webhooks
# WEBHOOK_SECRET=webhook-secret-2024
# WEBHOOK_TIMEOUT=30000

# AWS S3 Storage
# STORAGE_TYPE=s3
# AWS_ACCESS_KEY_ID=sua-access-