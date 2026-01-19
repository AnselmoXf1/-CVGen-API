# CVGen API - BlueVision Tech

API SaaS para geração automática de currículos (CVs) em PDF com múltiplos templates, autenticação por API Key, sistema de planos e **download direto com privacidade máxima**.

**🔒 NOVO: Sistema de Download Direto**
- CVs são gerados → usuário baixa imediatamente → arquivos deletados automaticamente
- **Privacidade máxima**: Nenhum CV fica armazenado no servidor
- **LGPD/GDPR compliant**: Dados não persistem
- **Zero custos de storage**: Apenas processamento

## 🌐 **DEMO EM PRODUÇÃO**
**🚀 API em Produção**: https://bluevisiontech-cvgen-api.onrender.com
**📚 Documentação Live**: https://bluevisiontech-cvgen-api.onrender.com/api-docs

**Credenciais de Teste:**
- Email: admin@bluevisiontech.com
- Senha: password

## 🚀 Funcionalidades

- ✅ **Geração de CV em PDF** com Puppeteer
- ✅ **Sistema de Download Direto** (privacidade máxima)
- ✅ **Auto-exclusão de arquivos** em 1 hora
- ✅ **Templates múltiplos** (free e premium)
- ✅ **API Keys por cliente** (SaaS)
- ✅ **Sistema de planos e limites**
- ✅ **Autenticação JWT** (admin e clientes)
- ✅ **Frontend completo** com modal de download
- ✅ **Rate limiting** por plano
- ✅ **Documentação Swagger**
- ✅ **Integração com plataformas externas**
- ✅ **Banco de dados em memória** (para demonstração)

## 🛠️ Stack Tecnológica

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas / Memória (demonstração)
- **Authentication**: JWT, API Keys
- **PDF Generation**: Puppeteer
- **Storage**: Sistema de Download Direto (temporário)
- **Frontend**: HTML5, CSS3, JavaScript (SPA)
- **Documentation**: Swagger
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi

## 🎯 Sistema de Download Direto

### 🔒 **Privacidade Máxima**
```
CV Gerado → Download Imediato → Arquivo Deletado
```

**Características:**
- ✅ **Arquivos temporários**: Deletados em 1 hora
- ✅ **Auto-limpeza**: Cron job a cada 30 minutos  
- ✅ **Download imediato**: Interface com countdown
- ✅ **LGPD/GDPR**: Conformidade total
- ✅ **Zero storage**: Sem custos de armazenamento

### 📱 **Interface do Usuário**
- Modal de download com countdown (3 segundos)
- Auto-download do PDF gerado
- Avisos sobre privacidade e expiração
- Botão para copiar link temporário
- Feedback visual de progresso

## 📋 Pré-requisitos

- Node.js 16+
- MongoDB 4.4+
- npm ou yarn

## 🔧 Instalação e Execução

### 🌐 **Teste na Produção (Recomendado)**
**API em Produção**: https://bluevisiontech-cvgen-api.onrender.com

```bash
# Teste direto na produção
curl https://bluevisiontech-cvgen-api.onrender.com/health

# Documentação interativa
# Acesse: https://bluevisiontech-cvgen-api.onrender.com/api-docs
```

### 🚀 **Desenvolvimento Local**

1. **Clone o repositório**
```bash
git clone https://github.com/AnselmoXf1/-CVGen-API.git
cd -CVGen-API
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute com banco em memória (demonstração)**
```bash
# Backend (porta 3001)
node server-memory.js

# Frontend (porta 8080) - nova aba do terminal
cd frontend
python -m http.server 8080
```

4. **Acesse a aplicação**
- **Frontend Local**: http://localhost:8080
- **API Local**: http://localhost:3001
- **Documentação Local**: http://localhost:3001/api-docs

### 🧪 **Teste o Sistema**
```bash
# Teste automatizado do download direto
node test-download-direto.js

# Teste rápido
node teste-rapido-download.js
```

### 🗄️ **Configuração com MongoDB (Produção)**

1. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

2. **Edite o arquivo `.env`**
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cvgen-api
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
API_BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin@bluevisiontech.com
ADMIN_PASSWORD=admin123456
USE_TEMPORARY_STORAGE=true
```

3. **Execute com MongoDB**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 Documentação da API

### 🌐 **Produção (Render)**
- **API Base**: https://bluevisiontech-cvgen-api.onrender.com
- **Swagger UI**: https://bluevisiontech-cvgen-api.onrender.com/api-docs
- **Health Check**: https://bluevisiontech-cvgen-api.onrender.com/health

### 🏠 **Desenvolvimento Local**
- **Frontend**: http://localhost:8080
- **API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

### 📋 **Arquivos de Documentação**
- `README.md` - Este arquivo
- `GUIA-COMPLETO.md` - Guia detalhado de uso
- `INTEGRACAO-API-EXTERNA.md` - Como integrar com sistemas externos
- `CONFIGURACAO-ENV.md` - Configuração de variáveis de ambiente
- `DEPLOY-OPCOES.md` - Opções de deploy (Railway, Render, etc.)
- `ESTRATEGIAS-ARMAZENAMENTO.md` - Estratégias de armazenamento
- `DOWNLOAD-DIRETO-IMPLEMENTADO.md` - Detalhes do sistema de download direto

### 🧪 **Arquivos de Teste**
- `test-download-direto.js` - Teste completo do sistema
- `teste-rapido-download.js` - Teste rápido
- `test-complete.js` - Teste de todas as funcionalidades
- `exemplo-integracao-completa.html` - Exemplo de integração frontend

## 🔐 Autenticação

### JWT Token (Dashboard/Admin)
```bash
# Login
POST /auth/login
{
  "email": "admin@bluevisiontech.com",
  "password": "admin123456"
}

# Usar token
Authorization: Bearer YOUR_JWT_TOKEN
```

### API Key (Integração Externa)
```bash
# Gerar API Key
POST /auth/api-key
Authorization: Bearer YOUR_JWT_TOKEN

# Usar API Key
x-api-key: YOUR_API_KEY
```

## 📊 Planos e Limites

| Plano | Limite Mensal | Templates Premium | Suporte |
|-------|---------------|-------------------|---------|
| **Free** | 20 CVs | ❌ | Básico |
| **Pro** | 500 CVs | ✅ | Prioritário |
| **Enterprise** | Ilimitado | ✅ | 24/7 |

## 🎯 Endpoints Principais

### 🔐 Autenticação
- `POST /auth/register` - Criar conta
- `POST /auth/login` - Login
- `POST /auth/api-key` - Gerar API Key

### 📄 CVs (Download Direto)
- `POST /cv` - Criar CV (retorna URL de download temporário)
- `GET /cv` - Listar CVs do usuário
- `GET /cv/:id` - Detalhes do CV
- `DELETE /cv/:id` - Deletar CV

### 📥 Download Temporário
- `GET /download/temp/:fileName` - Download de arquivo temporário
- `GET /download/temp/:fileName/status` - Status do arquivo
- `GET /download/temp/admin/stats` - Estatísticas (admin)

### 🎨 Templates
- `GET /templates` - Listar templates
- `GET /templates/:id` - Detalhes do template

### 👥 Clientes (Admin)
- `POST /clients` - Criar cliente
- `GET /clients` - Listar clientes
- `PUT /clients/:id/toggle-status` - Bloquear/Desbloquear

## 💡 Exemplo de Uso

### 🌐 **Produção (Render) - Recomendado**

#### 🔧 **Via API Key**
```bash
# 1. Login para obter token
curl -X POST https://bluevisiontech-cvgen-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bluevisiontech.com","password":"password"}'

# 2. Criar CV (retorna URL de download temporário)
curl -X POST https://bluevisiontech-cvgen-api.onrender.com/cv \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template_1",
    "nome": "João Paulo",
    "email": "joao@email.com",
    "telefone": "84xxxxxxx",
    "resumo": "Desenvolvedor web",
    "experiencias": [
      {
        "empresa": "ABC Tech",
        "cargo": "Frontend Dev",
        "periodo": "2022 - 2024"
      }
    ],
    "educacao": [
      {
        "instituicao": "Universidade X",
        "curso": "Informática"
      }
    ],
    "habilidades": ["HTML", "CSS", "JavaScript"]
  }'
```

### 🏠 **Desenvolvimento Local**

#### 🖥️ **Via Frontend (Recomendado)**
1. Acesse: http://localhost:8080
2. Login: admin@bluevisiontech.com / password
3. Clique em "Criar CV"
4. Preencha os dados e selecione template
5. **Modal de download aparece automaticamente**
6. **Download inicia em 3 segundos**
7. **Arquivo é deletado após download**

### 📥 **Resposta com Download Direto**
```json
{
  "status": "sucesso",
  "message": "CV gerado com sucesso! Baixe imediatamente.",
  "data": {
    "cvId": "cv_123",
    "downloadUrl": "/download/temp/cv-joao-paulo-abc123.pdf",
    "directDownload": "https://bluevisiontech-cvgen-api.onrender.com/download/temp/cv-joao-paulo-abc123.pdf",
    "expiresAt": "2024-01-19T21:30:00.000Z",
    "fileName": "cv-joao-paulo-abc123.pdf",
    "size": 45258,
    "warning": "Este arquivo será automaticamente deletado em 1 hora!"
  }
}
```

### 📱 **Download Imediato**
```bash
# Baixar usando a URL retornada (válida por 1 hora)
curl -O https://bluevisiontech-cvgen-api.onrender.com/download/temp/cv-joao-paulo-abc123.pdf
```

## 🔒 Segurança

- **Rate Limiting**: Limites por plano
- **CORS**: Configurado para domínios específicos
- **Helmet**: Headers de segurança
- **JWT**: Tokens com expiração
- **API Keys**: Chaves únicas por cliente
- **Validação**: Joi para validação de dados

## 📈 Monitoramento

- **Logs de API**: Todas as requisições são logadas
- **Métricas de uso**: Por cliente e endpoint
- **Health Check**: Endpoint de status
- **Error Tracking**: Logs detalhados de erros

## 🚀 Deploy

### Docker
```bash
# Build
docker build -t cvgen-api .

# Run
docker run -p 3000:3000 --env-file .env cvgen-api
```

### PM2
```bash
npm install -g pm2
pm2 start server.js --name cvgen-api
```

## 🤝 Integração com mozdjob.com

```javascript
// Exemplo de integração
const response = await fetch('https://bluevisiontech-cvgen-api.onrender.com/cv', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_MOZDJOB_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(cvData)
});

const result = await response.json();
console.log('PDF URL:', result.data.pdfUrl);
```

## 📞 Suporte

- **Email**: contato@bluevisiontech.com
- **Website**: https://bluevisiontech.vercel.app
- **Documentação**: http://localhost:3000/api-docs

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**CVGen API** - Desenvolvido com ❤️ pela **BlueVision Tech**