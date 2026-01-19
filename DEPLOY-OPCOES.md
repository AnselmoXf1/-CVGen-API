# 🚀 Guia de Deploy - CVGen API

## 🌟 Melhores Opções de Hospedagem

### 1. 🥇 **Railway** (Recomendado - Mais Fácil)
**Por que escolher:** Deploy automático, suporte nativo ao Node.js, MongoDB integrado

#### Configuração Railway
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar projeto
railway init

# 4. Deploy
railway up
```

#### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

#### Variáveis de Ambiente no Railway
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=${{MongoDB.DATABASE_URL}}
JWT_SECRET=sua-chave-jwt-aqui
API_BASE_URL=https://seu-app.railway.app
```

**💰 Custo:** $5-20/mês
**⚡ Deploy:** Automático via Git
**📊 Escalabilidade:** Excelente

---

### 2. 🥈 **Render** (Gratuito + Pago)
**Por que escolher:** Plano gratuito disponível, fácil configuração

#### Configuração Render
1. Conectar repositório GitHub
2. Configurar build command: `npm install`
3. Start command: `npm start`
4. Adicionar variáveis de ambiente

#### render.yaml
```yaml
services:
  - type: web
    name: cvgen-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: cvgen-db
          property: connectionString
```

**💰 Custo:** Gratuito (limitado) / $7+/mês
**⚡ Deploy:** Automático via Git
**📊 Escalabilidade:** Boa

---

### 3. 🥉 **Vercel** (Serverless)
**Por que escolher:** Deploy instantâneo, CDN global

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Deploy Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**💰 Custo:** Gratuito (limitado) / $20+/mês
**⚡ Deploy:** Instantâneo
**📊 Escalabilidade:** Automática

---

### 4. 💪 **DigitalOcean App Platform**
**Por que escolher:** Controle total, preço justo

#### .do/app.yaml
```yaml
name: cvgen-api
services:
- name: api
  source_dir: /
  github:
    repo: seu-usuario/cvgen-api
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${db.DATABASE_URL}
databases:
- name: cvgen-db
  engine: MONGODB
```

**💰 Custo:** $5-12/mês
**⚡ Deploy:** Automático via Git
**📊 Escalabilidade:** Manual/Automática

---

### 5. ☁️ **AWS (Avançado)**
**Por que escolher:** Máxima escalabilidade e controle

#### Opções AWS:
- **Elastic Beanstalk** (mais fácil)
- **ECS + Fargate** (containers)
- **Lambda + API Gateway** (serverless)

#### Deploy com Elastic Beanstalk
```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar
eb init

# Criar ambiente
eb create production

# Deploy
eb deploy
```

**💰 Custo:** $10-50+/mês
**⚡ Deploy:** Configurável
**📊 Escalabilidade:** Máxima

---

## 🗄️ Opções de Banco de Dados

### 1. **MongoDB Atlas** (Recomendado)
```bash
# URL de conexão
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cvgen
```
**💰 Custo:** Gratuito (512MB) / $9+/mês
**🌍 Global:** Sim
**🔒 Segurança:** Excelente

### 2. **Railway MongoDB**
```bash
# Integração automática
MONGODB_URI=${{MongoDB.DATABASE_URL}}
```
**💰 Custo:** Incluído no plano
**🔧 Configuração:** Zero

### 3. **DigitalOcean Managed MongoDB**
```bash
MONGODB_URI=mongodb://user:pass@db-mongodb-nyc1-12345.mongo.ondigitalocean.com:27017/cvgen
```
**💰 Custo:** $15+/mês
**⚡ Performance:** Alta

---

## 📦 Deploy com Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

# Instalar dependências do Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Criar diretório de storage
RUN mkdir -p storage/pdfs

# Expor porta
EXPOSE 3000

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Comando de inicialização
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  cvgen-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/cvgen
      - JWT_SECRET=${JWT_SECRET}
      - API_BASE_URL=https://api.suaempresa.com
    volumes:
      - ./storage:/app/storage
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=senha123
      - MONGO_INITDB_DATABASE=cvgen
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - cvgen-api
    restart: unless-stopped

volumes:
  mongo_data:
```

---

## 🌐 Configuração de Domínio

### 1. **Configurar DNS**
```bash
# Adicionar registros DNS
A     api.suaempresa.com    -> IP_DO_SERVIDOR
CNAME cvgen.suaempresa.com -> api.suaempresa.com
```

### 2. **SSL/HTTPS com Let's Encrypt**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d api.suaempresa.com

# Renovação automática
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name api.suaempresa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.suaempresa.com;

    ssl_certificate /etc/letsencrypt/live/api.suaempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.suaempresa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Comparação de Custos

| Plataforma | Custo Inicial | Escalabilidade | Facilidade | Recomendação |
|------------|---------------|----------------|------------|--------------|
| **Railway** | $5/mês | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🥇 Iniciantes |
| **Render** | Gratuito | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🥈 Projetos pequenos |
| **Vercel** | Gratuito | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🥉 Serverless |
| **DigitalOcean** | $5/mês | ⭐⭐⭐⭐ | ⭐⭐⭐ | 💪 Controle total |
| **AWS** | $10+/mês | ⭐⭐⭐⭐⭐ | ⭐⭐ | 🏢 Empresarial |

---

## 🚀 Deploy Passo a Passo (Railway)

### 1. Preparar o Código
```bash
# Criar package.json com script de start
{
  "scripts": {
    "start": "node server-memory.js",
    "dev": "nodemon server-memory.js"
  }
}
```

### 2. Configurar Railway
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Conectar projeto
railway link

# Adicionar variáveis
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=sua-chave-aqui
railway variables set API_BASE_URL=https://seu-app.railway.app
```

### 3. Deploy
```bash
# Deploy automático
git push origin main

# Ou deploy manual
railway up
```

### 4. Configurar Domínio Customizado
```bash
# No painel Railway
Settings > Domains > Add Custom Domain
api.suaempresa.com
```

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Testar aplicação localmente
- [ ] Configurar variáveis de ambiente
- [ ] Configurar banco de dados
- [ ] Testar geração de PDF
- [ ] Configurar CORS para domínios de produção
- [ ] Gerar chaves JWT seguras

### Após o Deploy
- [ ] Testar endpoints da API
- [ ] Verificar logs de erro
- [ ] Testar geração de PDF em produção
- [ ] Configurar monitoramento
- [ ] Configurar backup do banco
- [ ] Documentar URLs e credenciais

### Monitoramento
- [ ] Configurar alertas de erro
- [ ] Monitorar uso de recursos
- [ ] Configurar logs estruturados
- [ ] Implementar health checks
- [ ] Configurar métricas de performance

---

## 🎯 Recomendação Final

### Para Começar Rápido: **Railway**
- Deploy em 5 minutos
- Banco MongoDB integrado
- Escalabilidade automática
- Suporte excelente

### Para Produção Séria: **DigitalOcean + MongoDB Atlas**
- Controle total sobre infraestrutura
- Banco gerenciado e confiável
- Preço previsível
- Escalabilidade manual

### Para Máxima Escala: **AWS + MongoDB Atlas**
- Infraestrutura global
- Escalabilidade ilimitada
- Todos os serviços AWS disponíveis
- Requer conhecimento técnico avançado

**🚀 Comece com Railway e migre conforme crescer!**