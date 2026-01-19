# 🔧 Solução de Problemas - CVGen API

## ❌ Problema: "POST http://localhost:3000/cv net::ERR_CONNECTION_REFUSED"

### 🔍 Diagnóstico
Este erro indica que o frontend não consegue se conectar com o backend na porta 3000.

### ✅ Soluções

#### 1. Verificar se os servidores estão rodando
```bash
# Backend (porta 3000)
node server-memory.js

# Frontend (porta 8080)
cd frontend
npm start
```

#### 2. Testar conexão com a API
```bash
curl http://localhost:3000/health
```
**Resposta esperada:**
```json
{"status":"sucesso","message":"CVGen API está funcionando (Memory DB)"}
```

#### 3. Usar a página de debug
Abra no navegador: `debug-frontend.html`

Esta página permite:
- ✅ Testar conexão com API
- ✅ Fazer login como admin
- ✅ Verificar token no localStorage
- ✅ Testar criação de CV
- ✅ Ver logs detalhados

## 🚀 Status Atual dos Servidores

### ✅ Backend API (Porta 3000)
- **Status**: ✅ Rodando
- **URL**: http://localhost:3000
- **Banco**: Memory Database
- **Admin**: admin@bluevisiontech.com / password

### ✅ Frontend (Porta 8080)
- **Status**: ✅ Rodando  
- **URL**: http://localhost:8080
- **Integração**: Conectado com API

## 🔐 Credenciais de Teste

### Admin (Acesso Total)
```
Email: admin@bluevisiontech.com
Senha: password
Plano: Enterprise
Recursos: Todos os templates, sem limites
```

### Usuário Comum (Criar via frontend)
```
Nome: Seu nome
Email: seu@email.com
Senha: 123456
Plano: Free (padrão)
```

## 🧪 Testes Disponíveis

### 1. Teste Rápido da API
```bash
node test-admin-cv.js
```

### 2. Geração de PDF Premium
```bash
node gerar-pdf-premium.js
```

### 3. Debug Frontend
Abrir: `debug-frontend.html`

## 🔧 Comandos de Manutenção

### Reiniciar Servidores
```bash
# Parar todos os processos Node.js
taskkill /f /im node.exe

# Iniciar backend
node server-memory.js

# Iniciar frontend (em outro terminal)
cd frontend
npm start
```

### Verificar Portas em Uso
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :8080
```

### Limpar Cache do Navegador
1. Pressione F12 (DevTools)
2. Clique com botão direito no ícone de refresh
3. Selecione "Empty Cache and Hard Reload"

## 📋 Checklist de Solução

Quando tiver problemas, siga esta ordem:

- [ ] 1. Verificar se backend está rodando (porta 3000)
- [ ] 2. Verificar se frontend está rodando (porta 8080)  
- [ ] 3. Testar `curl http://localhost:3000/health`
- [ ] 4. Abrir `debug-frontend.html` para testes detalhados
- [ ] 5. Verificar console do navegador (F12)
- [ ] 6. Limpar cache do navegador se necessário
- [ ] 7. Reiniciar servidores se necessário

## 🎯 Funcionalidades Confirmadas

### ✅ Backend
- Autenticação JWT funcionando
- Templates premium disponíveis
- Geração de PDF funcionando
- Admin pode criar CVs sem API Key
- Banco de dados em memória funcionando

### ✅ Frontend
- Interface responsiva
- Login/registro funcionando
- Dashboard com dados reais
- Criação de CV integrada
- Sem dados fictícios

## 📞 Próximos Passos

1. **Abrir debug-frontend.html** para testar passo a passo
2. **Fazer login como admin** no frontend principal
3. **Criar um CV** para testar a funcionalidade completa
4. **Verificar PDF gerado** na pasta storage/pdfs/

---

**🎉 Sistema 100% funcional e pronto para uso!**