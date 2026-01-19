# 🌐 Integração com CVGen API - Produção

## 🚀 **API em Produção**
**Base URL**: https://bluevisiontech-cvgen-api.onrender.com

## 🔐 **Autenticação**

### 1. **Login Admin**
```bash
curl -X POST https://bluevisiontech-cvgen-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bluevisiontech.com",
    "password": "password"
  }'
```

**Resposta:**
```json
{
  "status": "sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin_id",
      "name": "Admin",
      "email": "admin@bluevisiontech.com",
      "role": "admin",
      "plan": "enterprise"
    }
  }
}
```

### 2. **Gerar API Key**
```bash
curl -X POST https://bluevisiontech-cvgen-api.onrender.com/auth/api-key \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Integração Produção"}'
```

## 📄 **Criar CV com Download Direto**

### **Usando JWT Token**
```bash
curl -X POST https://bluevisiontech-cvgen-api.onrender.com/cv \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template_1",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999",
    "endereco": "São Paulo, SP",
    "resumo": "Desenvolvedora Full Stack com 5 anos de experiência",
    "experiencias": [
      {
        "empresa": "Tech Solutions",
        "cargo": "Desenvolvedora Senior",
        "periodo": "2022 - Atual",
        "localizacao": "São Paulo, SP",
        "descricao": "Desenvolvimento de aplicações web com React e Node.js"
      },
      {
        "empresa": "StartupXYZ",
        "cargo": "Desenvolvedora Junior",
        "periodo": "2020 - 2022",
        "localizacao": "São Paulo, SP",
        "descricao": "Desenvolvimento frontend com JavaScript e CSS"
      }
    ],
    "educacao": [
      {
        "instituicao": "Universidade de São Paulo",
        "curso": "Ciência da Computação",
        "periodo": "2016 - 2020",
        "descricao": "Bacharelado em Ciência da Computação"
      }
    ],
    "habilidades": [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "SQL",
      "Git",
      "Docker",
      "AWS"
    ]
  }'
```

### **Usando API Key**
```bash
curl -X POST https://bluevisiontech-cvgen-api.onrender.com/cv \
  -H "x-api-key: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template_2",
    "nome": "João Santos",
    "email": "joao@email.com",
    "telefone": "(21) 88888-8888",
    "resumo": "Designer UX/UI especializado em interfaces modernas",
    "experiencias": [
      {
        "empresa": "Design Studio",
        "cargo": "UX Designer",
        "periodo": "2023 - Atual"
      }
    ],
    "educacao": [
      {
        "instituicao": "ESPM",
        "curso": "Design Gráfico",
        "periodo": "2019 - 2023"
      }
    ],
    "habilidades": ["Figma", "Adobe XD", "Sketch", "Prototyping"]
  }'
```

## 📥 **Resposta com Download Direto**

```json
{
  "status": "sucesso",
  "message": "CV gerado com sucesso! Baixe imediatamente.",
  "data": {
    "cvId": "cv_abc123",
    "downloadUrl": "/download/temp/cv-maria-silva-def456.pdf",
    "directDownload": "https://bluevisiontech-cvgen-api.onrender.com/download/temp/cv-maria-silva-def456.pdf",
    "expiresAt": "2024-01-19T22:30:00.000Z",
    "fileName": "cv-maria-silva-def456.pdf",
    "size": 47892,
    "status": "completed",
    "createdAt": "2024-01-19T21:30:00.000Z",
    "warning": "Este arquivo será automaticamente deletado em 1 hora!"
  }
}
```

## 🎨 **Templates Disponíveis**

```bash
# Listar templates
curl https://bluevisiontech-cvgen-api.onrender.com/templates
```

**Resposta:**
```json
{
  "status": "sucesso",
  "data": {
    "templates": [
      {
        "id": "template_1",
        "name": "Clássico Profissional",
        "description": "Template limpo e profissional",
        "category": "profissional",
        "isPremium": false,
        "isActive": true
      },
      {
        "id": "template_2",
        "name": "Moderno Criativo",
        "description": "Design moderno com cores vibrantes",
        "category": "criativo",
        "isPremium": true,
        "isActive": true
      },
      {
        "id": "template_3",
        "name": "Executivo Elegante",
        "description": "Template sofisticado para executivos",
        "category": "executivo",
        "isPremium": true,
        "isActive": true
      }
    ]
  }
}
```

## 🔍 **Verificar Status do Arquivo**

```bash
curl https://bluevisiontech-cvgen-api.onrender.com/download/temp/cv-maria-silva-def456.pdf/status
```

## 📊 **Health Check**

```bash
curl https://bluevisiontech-cvgen-api.onrender.com/health
```

**Resposta:**
```json
{
  "status": "sucesso",
  "message": "CVGen API está funcionando (Memory DB)",
  "timestamp": "2024-01-19T21:30:00.000Z",
  "version": "1.0.0",
  "database": "memory"
}
```

## 🌐 **Integração JavaScript (Frontend)**

```javascript
class CVGenAPI {
    constructor() {
        this.baseURL = 'https://bluevisiontech-cvgen-api.onrender.com';
        this.token = null;
    }

    async login(email, password) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (data.status === 'sucesso') {
            this.token = data.data.token;
        }
        return data;
    }

    async createCV(cvData) {
        const response = await fetch(`${this.baseURL}/cv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(cvData)
        });
        
        return await response.json();
    }

    async downloadCV(downloadUrl) {
        // Criar link de download
        const link = document.createElement('a');
        link.href = `${this.baseURL}${downloadUrl}`;
        link.download = 'cv.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Exemplo de uso
const api = new CVGenAPI();

async function gerarCV() {
    // Login
    await api.login('admin@bluevisiontech.com', 'password');
    
    // Criar CV
    const cvData = {
        templateId: 'template_1',
        nome: 'Teste API',
        email: 'teste@api.com',
        resumo: 'Testando integração com API',
        habilidades: ['JavaScript', 'API Integration']
    };
    
    const result = await api.createCV(cvData);
    
    if (result.status === 'sucesso') {
        // Download automático
        api.downloadCV(result.data.downloadUrl);
        
        console.log('CV gerado:', result.data.fileName);
        console.log('Expira em:', result.data.expiresAt);
    }
}
```

## 🔒 **Características de Segurança**

### **Rate Limiting**
- **Geral**: 100 requests/15min
- **Criação de CV**: 10 CVs/hora
- **Login**: 5 tentativas/15min

### **Validação**
- Todos os campos são validados
- Templates verificados antes da geração
- Limites de plano respeitados

### **Privacidade**
- ✅ Arquivos deletados em 1 hora
- ✅ Limpeza automática a cada 30 minutos
- ✅ Nenhum CV fica permanentemente armazenado
- ✅ Conformidade LGPD/GDPR

## 📞 **Suporte**

- **API Base**: https://bluevisiontech-cvgen-api.onrender.com
- **Documentação**: https://bluevisiontech-cvgen-api.onrender.com/api-docs
- **GitHub**: https://github.com/AnselmoXf1/-CVGen-API
- **Email**: admin@bluevisiontech.com

---

## 🎯 **Pronto para Integração!**

A API está **100% funcional** em produção e pronta para ser integrada em qualquer plataforma!