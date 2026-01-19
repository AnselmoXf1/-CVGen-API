# 🚀 CVGen API - Quick Start

## ✅ Status: FUNCIONANDO!

Sua CVGen API está rodando com sucesso em: **http://localhost:3000**

## 🔗 Links Importantes

- **API Base**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🔑 Credenciais Iniciais

**Admin Login:**
- Email: `admin@bluevisiontech.com`
- Senha: `admin123456`

## 🧪 Testes Rápidos

### 1. Verificar se está funcionando
```cmd
node test-api.js
```

### 2. Fazer login como admin
```cmd
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@bluevisiontech.com\",\"password\":\"admin123456\"}"
```

### 3. Listar templates disponíveis
```cmd
curl -X GET http://localhost:3000/templates ^
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### 4. Gerar API Key
```cmd
curl -X POST http://localhost:3000/auth/api-key ^
  -H "Authorization: Bearer SEU_TOKEN_JWT" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Minha API Key\"}"
```

## 📱 Usando a API

### Criar um CV (exemplo completo)
```cmd
curl -X POST http://localhost:3000/cv ^
  -H "x-api-key: SUA_API_KEY" ^
  -H "Content-Type: application/json" ^
  -d "{\"templateId\":\"TEMPLATE_ID\",\"nome\":\"João Silva\",\"email\":\"joao@email.com\",\"telefone\":\"11999999999\",\"resumo\":\"Desenvolvedor Full Stack\",\"experiencias\":[{\"empresa\":\"Tech Corp\",\"cargo\":\"Desenvolvedor\",\"periodo\":\"2020-2024\"}],\"habilidades\":[\"JavaScript\",\"Node.js\",\"React\"]}"
```

## 🎯 Próximos Passos

1. **Acesse a documentação**: http://localhost:3000/api-docs
2. **Teste os endpoints** usando Postman ou Insomnia
3. **Gere sua primeira API Key** para integração
4. **Crie templates personalizados** via admin
5. **Integre com mozdjob.com** ou outras plataformas

## 🔧 Comandos Úteis

```cmd
# Iniciar servidor
node server.js

# Testar API
node test-api.js

# Parar servidor
Ctrl+C

# Ver logs do servidor
# Os logs aparecem automaticamente no terminal
```

## 📊 Funcionalidades Disponíveis

- ✅ **Autenticação JWT** (dashboard)
- ✅ **API Keys** (integração externa)
- ✅ **Geração de CV** (HTML/PDF)
- ✅ **Templates múltiplos** (free/premium)
- ✅ **Sistema de planos** (Free/Pro/Enterprise)
- ✅ **Rate limiting** por plano
- ✅ **Logs de uso**
- ✅ **Documentação Swagger**
- ✅ **Admin dashboard** (via API)

## 🎉 Sucesso!

Sua CVGen API está pronta para uso e integração!

Para suporte: contato@bluevisiontech.com