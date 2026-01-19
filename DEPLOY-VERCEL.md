# 🚀 Deploy Frontend no Vercel

## 📁 **Estrutura para Deploy**

O frontend está configurado para deploy no Vercel com a seguinte estrutura:

```
projeto/
├── public/              # Diretório de saída (outputDirectory)
│   ├── index.html      # Página principal
│   ├── css/
│   │   └── style.css   # Estilos modernos
│   └── js/
│       ├── config.js   # Configuração de ambiente
│       └── app.js      # Aplicação principal
├── vercel.json         # Configuração do Vercel
└── README.md
```

## ⚙️ **Configuração do Vercel**

### 1. **vercel.json**
```json
{
  "version": 2,
  "name": "cvgen-frontend",
  "outputDirectory": "public"
}
```

### 2. **Variáveis de Ambiente**
No painel do Vercel, configure:
- `NODE_ENV=production`
- `API_URL=https://bluevisiontech-cvgen-api.onrender.com`

## 🔧 **Como Fazer Deploy**

### **Opção 1: Via GitHub (Recomendado)**
1. Conecte o repositório ao Vercel
2. Configure `outputDirectory` como `public`
3. Deploy automático a cada push

### **Opção 2: Via CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### **Opção 3: Drag & Drop**
1. Acesse vercel.com
2. Arraste a pasta `public` para o painel
3. Configure o domínio

## 🌐 **URLs Após Deploy**

- **Frontend**: https://cvgen-frontend.vercel.app
- **API Backend**: https://bluevisiontech-cvgen-api.onrender.com
- **Documentação**: https://bluevisiontech-cvgen-api.onrender.com/api-docs

## 🔄 **Configuração Automática de Ambiente**

O arquivo `js/config.js` detecta automaticamente o ambiente:

```javascript
// Produção (Vercel)
production: {
    apiUrl: 'https://bluevisiontech-cvgen-api.onrender.com',
    environment: 'production'
},

// Desenvolvimento Local
development: {
    apiUrl: 'http://localhost:3001',
    environment: 'development'
}
```

## ✅ **Checklist de Deploy**

- [ ] Arquivos copiados para `public/`
- [ ] `vercel.json` configurado
- [ ] API URL apontando para produção
- [ ] Ícones Font Awesome carregando
- [ ] CSS moderno aplicado
- [ ] JavaScript funcionando
- [ ] Responsividade testada

## 🧪 **Teste Local**

Antes do deploy, teste localmente:

```bash
# Servir arquivos estáticos
cd public
python -m http.server 8080

# Ou usar live-server
npx live-server public
```

## 🔗 **Links Importantes**

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação Vercel**: https://vercel.com/docs
- **GitHub Repo**: https://github.com/AnselmoXf1/-CVGen-API

---

## 🎯 **Resultado Esperado**

Após o deploy, você terá:
- ✅ Frontend moderno e responsivo
- ✅ Integração com API em produção
- ✅ Sistema de download direto funcionando
- ✅ Interface com ícones e animações
- ✅ Detecção automática de ambiente
- ✅ HTTPS automático via Vercel

**🚀 Frontend pronto para produção no Vercel!**