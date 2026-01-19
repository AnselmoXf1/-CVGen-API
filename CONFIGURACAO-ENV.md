# 🔧 Configuração de Ambiente (.env)

## 📋 Configurações por Ambiente

### 🏠 Desenvolvimento Local (.env)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database - Memory DB para desenvolvimento
MONGODB_URI=memory://localhost

# JWT Secrets (desenvolvimento)
JWT_SECRET=cvgen-dev-secret-2024
JWT_REFRESH_SECRET=cvgen-dev-refresh-secret-2024
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# API Configuration
API_BASE_URL=http://localhost:3000
PDF_STORAGE_PATH=./storage/pdfs

# Rate Limiting (mais permissivo em dev)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Admin Credentials
ADMIN_EMAIL=admin@bluevisiontech.com
ADMIN_PASSWORD=password

# CORS Origins (desenvolvimento)
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:8080

# Debug
DEBUG=true
LOG_LEVEL=debug
```

### 🚀 Produção (.env.production)
```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database - MongoDB Atlas (Produção)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/cvgen-prod?retryWrites=true&w=majority

# JWT Secrets (ALTERE ESTAS CHAVES EM PRODUÇÃO!)
JWT_SECRET=sua-chave-super-secreta-jwt-producao-2024-muito-longa-e-complexa
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta-producao-2024-muito-longa
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# API Configuration
API_BASE_URL=https://api.suaempresa.com
PDF_STORAGE_PATH=/var/www/storage/pdfs

# Rate Limiting (mais restritivo em produção)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Credentials
ADMIN_EMAIL=admin@suaempresa.com
ADMIN_PASSWORD=senha-super-segura-admin-2024

# CORS Origins (apenas domínios autorizados)
CORS_ORIGINS=https://suaempresa.com,https://app.suaempresa.com,https://mozdjob.com

# SSL/HTTPS
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/suaempresa.crt
SSL_KEY_PATH=/etc/ssl/private/suaempresa.key

# Debug
DEBUG=false
LOG_LEVEL=error

# Email (para notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@suaempresa.com
SMTP_PASS=senha-do-email

# Storage (AWS S3 para produção)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_BUCKET_NAME=cvgen-pdfs
AWS_REGION=us-east-1
```

### 🔗 Integração Externa (.env.integration)
```bash
# Server Configuration
PORT=3000
NODE_ENV=integration

# Database
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/cvgen-integration

# JWT Secrets
JWT_SECRET=cvgen-integration-secret-2024
JWT_REFRESH_SECRET=cvgen-integration-refresh-secret-2024
JWT_EXPIRE=2h
JWT_REFRESH_EXPIRE=30d

# API Configuration
API_BASE_URL=https://cvgen-api.suaempresa.com
PDF_STORAGE_PATH=./storage/pdfs

# Rate Limiting (configurado para integrações)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=500

# CORS Origins (incluir domínios dos clientes)
CORS_ORIGINS=https://mozdjob.com,https://cliente1.com,https://cliente2.com,https://app.cliente3.com

# API Keys Configuration
API_KEY_EXPIRY=never
MAX_API_KEYS_PER_USER=5

# Webhook Configuration (para notificar clientes)
WEBHOOK_SECRET=webhook-secret-2024
WEBHOOK_TIMEOUT=30000

# Monitoring
SENTRY_DSN=https://sua-sentry-dsn@sentry.io/projeto
ANALYTICS_ENABLED=true
```

## 🔐 Variáveis de Ambiente Essenciais

### Obrigatórias
```bash
PORT=3000                    # Porta do servidor
NODE_ENV=development         # Ambiente (development/production/test)
JWT_SECRET=sua-chave-jwt     # Chave para assinar tokens JWT
API_BASE_URL=http://localhost:3000  # URL base da API
```

### Banco de Dados
```bash
# MongoDB Atlas (Produção)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database

# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/cvgen

# Memory Database (Desenvolvimento)
MONGODB_URI=memory://localhost
```

### Segurança
```bash
JWT_SECRET=chave-muito-longa-e-complexa-para-jwt
JWT_REFRESH_SECRET=chave-para-refresh-token
JWT_EXPIRE=1h               # Expiração do token principal
JWT_REFRESH_EXPIRE=7d       # Expiração do refresh token
```

### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000    # Janela de tempo (15 min)
RATE_LIMIT_MAX_REQUESTS=100    # Máximo de requests por janela
```

### CORS
```bash
# Desenvolvimento (permite tudo)
CORS_ORIGINS=*

# Produção (apenas domínios específicos)
CORS_ORIGINS=https://app.com,https://cliente.com
```

### Storage
```bash
# Local
PDF_STORAGE_PATH=./storage/pdfs

# AWS S3
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
AWS_BUCKET_NAME=cvgen-pdfs
AWS_REGION=us-east-1

# Google Cloud Storage
STORAGE_TYPE=gcs
GCS_PROJECT_ID=seu-projeto
GCS_BUCKET_NAME=cvgen-pdfs
GCS_KEY_FILE=./gcs-key.json
```

## 🌍 Configuração por Domínio

### Para mozdjob.com
```bash
# .env.mozdjob
NODE_ENV=production
API_BASE_URL=https://cvgen-api.mozdjob.com
CORS_ORIGINS=https://mozdjob.com,https://app.mozdjob.com
ADMIN_EMAIL=admin@mozdjob.com

# Branding
COMPANY_NAME=MozDJob
COMPANY_LOGO=https://mozdjob.com/logo.png
BRAND_COLOR=#1a73e8
```

### Para Cliente Específico
```bash
# .env.cliente1
NODE_ENV=production
API_BASE_URL=https://cvgen.cliente1.com
CORS_ORIGINS=https://cliente1.com,https://app.cliente1.com
ADMIN_EMAIL=admin@cliente1.com

# Customização
COMPANY_NAME=Cliente 1
TEMPLATES_ENABLED=professional,modern
MAX_CVS_PER_MONTH=1000
```

## 📝 Como Usar

### 1. Desenvolvimento Local
```bash
# Copiar exemplo
cp .env.example .env

# Editar configurações
nano .env

# Iniciar servidor
npm run dev
```

### 2. Produção
```bash
# Criar arquivo de produção
cp .env.example .env.production

# Configurar variáveis de produção
nano .env.production

# Iniciar com arquivo específico
NODE_ENV=production node server.js
```

### 3. Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

# Copiar arquivos
COPY . .

# Instalar dependências
RUN npm install

# Variáveis de ambiente via Docker
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  cvgen-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - API_BASE_URL=https://api.suaempresa.com
    env_file:
      - .env.production
```

## 🔒 Segurança das Variáveis

### ❌ Nunca Commitar
```bash
# Adicionar ao .gitignore
.env
.env.local
.env.production
.env.*.local
*.key
*.pem
```

### ✅ Usar Gerenciadores de Secrets
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id cvgen/jwt-secret

# Azure Key Vault
az keyvault secret show --vault-name cvgen-vault --name jwt-secret

# HashiCorp Vault
vault kv get secret/cvgen/jwt-secret
```

### 🔐 Gerar Chaves Seguras
```bash
# JWT Secret (256 bits)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# API Key
node -e "console.log('cvgen_' + require('crypto').randomBytes(32).toString('hex'))"

# Password Hash
node -e "console.log(require('bcryptjs').hashSync('senha123', 10))"
```

## 📋 Checklist de Configuração

### Desenvolvimento
- [ ] PORT definida
- [ ] NODE_ENV=development
- [ ] JWT_SECRET configurado
- [ ] CORS_ORIGINS permissivo
- [ ] Rate limiting relaxado
- [ ] Debug habilitado

### Produção
- [ ] Chaves JWT únicas e seguras
- [ ] CORS_ORIGINS restritivo
- [ ] HTTPS habilitado
- [ ] Rate limiting configurado
- [ ] Logs de erro configurados
- [ ] Backup do banco configurado
- [ ] Monitoramento ativo

### Integração
- [ ] API_BASE_URL público
- [ ] CORS para domínios clientes
- [ ] Rate limiting adequado
- [ ] Webhooks configurados
- [ ] Documentação atualizada

---

**🔧 Configure o ambiente adequadamente para cada situação!**