# ⚡ Deploy Rápido - CVGen API

## 🎯 Opção Mais Rápida: Railway

### 1. Preparação (2 minutos)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login
```

### 2. Deploy Automático (1 minuto)
```bash
# Executar script de deploy
chmod +x deploy.sh
./deploy.sh railway
```

### 3. Configurar Variáveis (1 minuto)
No painel do Railway, adicionar:
```
NODE_ENV=production
JWT_SECRET=sua-chave-jwt-super-secreta
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cvgen
API_BASE_URL=https://seu-app.railway.app
```

### 4. Pronto! 🎉
- **API**: https://seu-app.railway.app
- **Docs**: https://seu-app.railway.app/api-docs
- **Health**: https://seu-app.railway.app/health

---

## 🆓 Opção Gratuita: Render

### 1. GitHub
```bash
# Fazer push do código
git add .
git commit -m "Deploy CVGen API"
git push origin main
```

### 2. Render Dashboard
1. Acesse https://render.com
2. Conecte repositório GitHub
3. Selecione "Web Service"
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server-memory.js`

### 3. Variáveis de Ambiente
Adicionar no painel:
```
NODE_ENV=production
JWT_SECRET=sua-chave-jwt
MONGODB_URI=sua-conexao-mongodb
API_BASE_URL=https://seu-app.onrender.com
```

---

## 🐳 Opção Docker Local

### 1. Build e Run
```bash
# Executar script
./deploy.sh docker
```

### 2. Verificar
```bash
# Verificar se está rodando
docker ps

# Ver logs
docker logs cvgen-api

# Testar API
curl http://localhost:3000/health
```

---

## 📋 Checklist Pré-Deploy

- [ ] ✅ Código testado localmente
- [ ] ✅ Arquivo `.env` configurado
- [ ] ✅ MongoDB Atlas configurado
- [ ] ✅ Chaves JWT geradas
- [ ] ✅ CORS configurado para domínios de produção

## 🔧 Comandos Úteis

### Gerar JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Testar API Local
```bash
# Iniciar servidor
npm start

# Testar health
curl http://localhost:3000/health

# Testar templates
curl http://localhost:3000/templates
```

### Verificar Deploy
```bash
# Railway
railway logs

# Docker
docker logs cvgen-api

# Render (via dashboard)
```

---

## 🚨 Solução de Problemas

### Erro de Puppeteer
```bash
# No Dockerfile, já está configurado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Erro de CORS
```bash
# No .env, adicionar domínios
CORS_ORIGINS=https://seudominio.com,https://app.seudominio.com
```

### Erro de MongoDB
```bash
# Verificar string de conexão
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
```

---

## 💰 Custos Estimados

| Plataforma | Gratuito | Pago | Recomendação |
|------------|----------|------|--------------|
| **Railway** | ❌ | $5/mês | 🥇 Melhor custo-benefício |
| **Render** | ✅ 750h/mês | $7/mês | 🥈 Boa para começar |
| **Vercel** | ✅ Limitado | $20/mês | 🥉 Para serverless |
| **DigitalOcean** | ❌ | $5/mês | 💪 Controle total |

---

## 🎯 Recomendação Final

### Para Começar: **Railway**
- Deploy em 5 minutos
- Banco MongoDB integrado
- Escalabilidade automática
- Suporte excelente

### Comando Único:
```bash
./deploy.sh railway
```

**🚀 Em 5 minutos sua API estará online e funcionando!**