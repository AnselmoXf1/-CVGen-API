# CVGen API - Setup para Windows

## 🚀 Guia de Instalação Rápida

### 1. Pré-requisitos
- ✅ Node.js 16+ instalado
- ✅ MongoDB instalado e rodando (ou use MongoDB Atlas)
- ✅ Git (opcional)

### 2. Instalação

```cmd
# 1. Navegue até a pasta do projeto
cd "C:\Users\Anselmo D.Bistiro\Desktop\api saas CV"

# 2. As dependências já foram instaladas
# Se precisar reinstalar: npm install

# 3. Configure o MongoDB (se necessário)
# Opção A: MongoDB Local
# - Instale MongoDB Community Server
# - Inicie o serviço: net start MongoDB

# Opção B: MongoDB Atlas (Recomendado)
# - Crie uma conta gratuita em https://cloud.mongodb.com
# - Crie um cluster gratuito
# - Obtenha a string de conexão
# - Edite o arquivo .env e substitua MONGODB_URI
```

### 3. Iniciar o Servidor

**Opção 1: Comando direto**
```cmd
node server.js
```

**Opção 2: Script batch**
```cmd
start.bat
```

### 4. Verificar se está funcionando

Abra outro terminal e execute:
```cmd
node test-api.js
```

Ou acesse no navegador:
- **API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

### 5. Login Inicial

**Credenciais do Admin:**
- Email: `admin@bluevisiontech.com`
- Senha: `admin123456`

### 6. Comandos Úteis

```cmd
# Parar o servidor: Ctrl+C

# Ver logs em tempo real: o servidor já mostra os logs

# Testar endpoints:
# Use Postman, Insomnia ou curl
```

### 7. Configuração do MongoDB

Se você não tem MongoDB instalado:

**Opção A: MongoDB Atlas (Gratuito)**
1. Vá para https://cloud.mongodb.com
2. Crie uma conta gratuita
3. Crie um cluster gratuito
4. Obtenha a string de conexão
5. Edite `.env` e substitua:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cvgen-api
   ```

**Opção B: MongoDB Local**
1. Baixe MongoDB Community Server
2. Instale e inicie o serviço
3. A configuração padrão já funciona: `mongodb://localhost:27017/cvgen-api`

### 8. Testando a API

**Criar um CV via API:**
```cmd
# Primeiro, obtenha uma API Key fazendo login no admin
# Depois use:

curl -X POST http://localhost:3000/cv ^
  -H "x-api-key: SUA_API_KEY" ^
  -H "Content-Type: application/json" ^
  -d "{\"templateId\":\"TEMPLATE_ID\",\"nome\":\"João Silva\",\"email\":\"joao@email.com\"}"
```

### 9. Problemas Comuns

**Erro de conexão MongoDB:**
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env`

**Porta 3000 ocupada:**
- Mude a porta no `.env`: `PORT=3001`

**Puppeteer não funciona:**
- O sistema funciona sem PDF temporariamente
- Para PDF completo, instale Chrome/Chromium

### 10. Próximos Passos

1. ✅ API funcionando
2. 📱 Teste os endpoints na documentação
3. 🔑 Gere API Keys para integração
4. 🎨 Customize templates
5. 📊 Monitore uso via logs

## 🎉 Pronto!

Sua CVGen API está rodando em: **http://localhost:3000**

Documentação completa: **http://localhost:3000/api-docs**