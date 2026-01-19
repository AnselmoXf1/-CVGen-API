# 🔗 Integração CVGen API - Aplicação Externa

## 🎯 Como Integrar a CVGen API em Sua Aplicação

Este guia mostra como integrar a **CVGen API** em qualquer aplicação externa (React, Vue, Angular, PHP, etc.).

## 🔑 1. Obter API Key

### Passo 1: Criar Conta na CVGen
```javascript
// Registrar usuário na CVGen API
const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Sua Empresa',
        email: 'empresa@email.com',
        password: 'senha123',
        plan: 'pro' // ou 'enterprise' para templates premium
    })
});
```

### Passo 2: Gerar API Key
```javascript
// Fazer login e gerar API Key
const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'empresa@email.com',
        password: 'senha123'
    })
});

const { token } = loginResponse.data.data;

// Gerar API Key
const apiKeyResponse = await fetch('http://localhost:3000/auth/api-key', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Integração Externa' })
});

const { apiKey } = apiKeyResponse.data.data;
// Salve esta API Key - você vai usar em todas as requisições
```

## 🎨 2. Interface de Usuário Sugerida

### Botões Principais
```html
<!-- Botão para gerar CV -->
<button id="gerarCV" class="btn-primary">
    📄 Gerar Currículo PDF
</button>

<!-- Botão para escolher template -->
<button id="escolherTemplate" class="btn-secondary">
    🎨 Escolher Template
</button>

<!-- Botão para baixar CV -->
<button id="baixarCV" class="btn-success" style="display:none;">
    ⬇️ Baixar PDF
</button>
```

### Modal de Seleção de Template
```html
<div id="templateModal" class="modal">
    <div class="modal-content">
        <h2>Escolha um Template</h2>
        <div id="templatesGrid" class="templates-grid">
            <!-- Templates serão carregados aqui -->
        </div>
        <button onclick="fecharModal()">Cancelar</button>
    </div>
</div>
```

### Formulário de Dados do CV
```html
<form id="cvForm">
    <h3>Dados Pessoais</h3>
    <input type="text" id="nome" placeholder="Nome completo" required>
    <input type="email" id="email" placeholder="Email" required>
    <input type="tel" id="telefone" placeholder="Telefone">
    
    <h3>Resumo Profissional</h3>
    <textarea id="resumo" placeholder="Descreva sua experiência..."></textarea>
    
    <h3>Experiências</h3>
    <div id="experienciasContainer">
        <div class="experiencia-item">
            <input type="text" placeholder="Empresa">
            <input type="text" placeholder="Cargo">
            <input type="text" placeholder="Período (ex: 2020-2024)">
            <textarea placeholder="Descrição das atividades"></textarea>
        </div>
    </div>
    <button type="button" onclick="adicionarExperiencia()">+ Adicionar Experiência</button>
    
    <h3>Educação</h3>
    <div id="educacaoContainer">
        <div class="educacao-item">
            <input type="text" placeholder="Instituição">
            <input type="text" placeholder="Curso">
            <input type="text" placeholder="Período">
        </div>
    </div>
    <button type="button" onclick="adicionarEducacao()">+ Adicionar Educação</button>
    
    <h3>Habilidades</h3>
    <input type="text" id="habilidadesInput" placeholder="Digite uma habilidade e pressione Enter">
    <div id="habilidadesTags"></div>
</form>
```

## 💻 3. Código JavaScript para Integração

### Classe CVGenAPI
```javascript
class CVGenAPI {
    constructor(apiKey, baseUrl = 'http://localhost:3000') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.selectedTemplate = null;
        this.habilidades = [];
    }

    // Fazer requisição para API
    async request(endpoint, options = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                ...options.headers
            }
        });
        return await response.json();
    }

    // Carregar templates disponíveis
    async carregarTemplates() {
        const response = await this.request('/templates');
        if (response.status === 'sucesso') {
            this.renderizarTemplates(response.data.templates);
        }
        return response.data.templates;
    }

    // Renderizar templates na interface
    renderizarTemplates(templates) {
        const grid = document.getElementById('templatesGrid');
        grid.innerHTML = templates.map(template => `
            <div class="template-card ${template.isPremium ? 'premium' : 'free'}" 
                 onclick="cvgenAPI.selecionarTemplate('${template.id}')">
                <div class="template-preview">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h4>${template.name}</h4>
                <p>${template.description}</p>
                <span class="badge ${template.isPremium ? 'premium' : 'free'}">
                    ${template.isPremium ? '💎 Premium' : '🆓 Gratuito'}
                </span>
            </div>
        `).join('');
    }

    // Selecionar template
    selecionarTemplate(templateId) {
        this.selectedTemplate = templateId;
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.target.closest('.template-card').classList.add('selected');
        
        // Mostrar botão de gerar CV
        document.getElementById('gerarCV').style.display = 'block';
        this.fecharModal();
    }

    // Coletar dados do formulário
    coletarDadosCV() {
        return {
            templateId: this.selectedTemplate,
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            resumo: document.getElementById('resumo').value,
            experiencias: this.coletarExperiencias(),
            educacao: this.coletarEducacao(),
            habilidades: this.habilidades
        };
    }

    // Coletar experiências
    coletarExperiencias() {
        const experiencias = [];
        document.querySelectorAll('.experiencia-item').forEach(item => {
            const inputs = item.querySelectorAll('input, textarea');
            if (inputs[0].value && inputs[1].value) {
                experiencias.push({
                    empresa: inputs[0].value,
                    cargo: inputs[1].value,
                    periodo: inputs[2].value,
                    descricao: inputs[3].value
                });
            }
        });
        return experiencias;
    }

    // Coletar educação
    coletarEducacao() {
        const educacao = [];
        document.querySelectorAll('.educacao-item').forEach(item => {
            const inputs = item.querySelectorAll('input');
            if (inputs[0].value && inputs[1].value) {
                educacao.push({
                    instituicao: inputs[0].value,
                    curso: inputs[1].value,
                    periodo: inputs[2].value
                });
            }
        });
        return educacao;
    }

    // Gerar CV
    async gerarCV() {
        if (!this.selectedTemplate) {
            alert('Selecione um template primeiro!');
            return;
        }

        const cvData = this.coletarDadosCV();
        
        // Validar dados obrigatórios
        if (!cvData.nome || !cvData.email) {
            alert('Nome e email são obrigatórios!');
            return;
        }

        try {
            // Mostrar loading
            this.mostrarLoading(true);
            
            const response = await this.request('/cv', {
                method: 'POST',
                body: JSON.stringify(cvData)
            });

            if (response.status === 'sucesso') {
                // CV gerado com sucesso
                this.mostrarSucesso(response.data);
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            alert(`Erro ao gerar CV: ${error.message}`);
        } finally {
            this.mostrarLoading(false);
        }
    }

    // Mostrar loading
    mostrarLoading(show) {
        const btn = document.getElementById('gerarCV');
        if (show) {
            btn.innerHTML = '⏳ Gerando PDF...';
            btn.disabled = true;
        } else {
            btn.innerHTML = '📄 Gerar Currículo PDF';
            btn.disabled = false;
        }
    }

    // Mostrar sucesso
    mostrarSucesso(data) {
        // Mostrar botão de download
        const downloadBtn = document.getElementById('baixarCV');
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => window.open(data.pdfUrl, '_blank');
        
        // Mostrar mensagem de sucesso
        alert('✅ CV gerado com sucesso! Clique em "Baixar PDF" para fazer o download.');
    }

    // Adicionar habilidade
    adicionarHabilidade(habilidade) {
        if (habilidade && !this.habilidades.includes(habilidade)) {
            this.habilidades.push(habilidade);
            this.renderizarHabilidades();
        }
    }

    // Remover habilidade
    removerHabilidade(habilidade) {
        this.habilidades = this.habilidades.filter(h => h !== habilidade);
        this.renderizarHabilidades();
    }

    // Renderizar habilidades
    renderizarHabilidades() {
        const container = document.getElementById('habilidadesTags');
        container.innerHTML = this.habilidades.map(habilidade => `
            <span class="skill-tag">
                ${habilidade}
                <span class="remove-skill" onclick="cvgenAPI.removerHabilidade('${habilidade}')">&times;</span>
            </span>
        `).join('');
    }

    // Abrir modal de templates
    abrirModalTemplates() {
        document.getElementById('templateModal').style.display = 'block';
        this.carregarTemplates();
    }

    // Fechar modal
    fecharModal() {
        document.getElementById('templateModal').style.display = 'none';
    }
}

// Inicializar API (substitua pela sua API Key)
const cvgenAPI = new CVGenAPI('SUA_API_KEY_AQUI');
```

### Funções Auxiliares
```javascript
// Adicionar experiência
function adicionarExperiencia() {
    const container = document.getElementById('experienciasContainer');
    const newItem = document.createElement('div');
    newItem.className = 'experiencia-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Empresa">
        <input type="text" placeholder="Cargo">
        <input type="text" placeholder="Período (ex: 2020-2024)">
        <textarea placeholder="Descrição das atividades"></textarea>
        <button type="button" onclick="this.parentElement.remove()">Remover</button>
    `;
    container.appendChild(newItem);
}

// Adicionar educação
function adicionarEducacao() {
    const container = document.getElementById('educacaoContainer');
    const newItem = document.createElement('div');
    newItem.className = 'educacao-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Instituição">
        <input type="text" placeholder="Curso">
        <input type="text" placeholder="Período">
        <button type="button" onclick="this.parentElement.remove()">Remover</button>
    `;
    container.appendChild(newItem);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Botão escolher template
    document.getElementById('escolherTemplate').onclick = () => {
        cvgenAPI.abrirModalTemplates();
    };

    // Botão gerar CV
    document.getElementById('gerarCV').onclick = () => {
        cvgenAPI.gerarCV();
    };

    // Input de habilidades
    document.getElementById('habilidadesInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const habilidade = this.value.trim();
            if (habilidade) {
                cvgenAPI.adicionarHabilidade(habilidade);
                this.value = '';
            }
        }
    });
});
```

## 🎨 4. CSS Sugerido

```css
/* Botões */
.btn-primary {
    background: #2563eb;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
}

.btn-secondary {
    background: #6b7280;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.btn-success {
    background: #10b981;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

/* Templates Grid */
.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.template-card {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.template-card:hover {
    border-color: #2563eb;
    transform: translateY(-2px);
}

.template-card.selected {
    border-color: #2563eb;
    background: #eff6ff;
}

.template-card.premium {
    border-color: #f59e0b;
}

.badge.premium {
    background: #f59e0b;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.badge.free {
    background: #10b981;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

/* Formulário */
#cvForm {
    max-width: 600px;
    margin: 0 auto;
}

#cvForm input, #cvForm textarea {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #d1d5db;
    border-radius: 4px;
}

/* Habilidades */
.skill-tag {
    background: #2563eb;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    margin: 2px;
    display: inline-block;
}

.remove-skill {
    margin-left: 5px;
    cursor: pointer;
    font-weight: bold;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
}

.modal-content {
    background: white;
    margin: 5% auto;
    padding: 20px;
    width: 80%;
    max-width: 800px;
    border-radius: 8px;
}
```

## 🚀 5. Exemplo de Uso Completo

### HTML Completo
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de CV - Sua Empresa</title>
    <link rel="stylesheet" href="cvgen-styles.css">
</head>
<body>
    <div class="container">
        <h1>🎯 Gerador de Currículo Profissional</h1>
        
        <!-- Botões principais -->
        <div class="actions">
            <button id="escolherTemplate" class="btn-secondary">
                🎨 Escolher Template
            </button>
            <button id="gerarCV" class="btn-primary" style="display:none;">
                📄 Gerar Currículo PDF
            </button>
            <button id="baixarCV" class="btn-success" style="display:none;">
                ⬇️ Baixar PDF
            </button>
        </div>

        <!-- Formulário -->
        <form id="cvForm">
            <!-- Conteúdo do formulário aqui -->
        </form>

        <!-- Modal de templates -->
        <div id="templateModal" class="modal">
            <!-- Conteúdo do modal aqui -->
        </div>
    </div>

    <script src="cvgen-api.js"></script>
</body>
</html>
```

## 📋 6. Checklist de Implementação

- [ ] 1. Obter API Key da CVGen
- [ ] 2. Criar interface com botões sugeridos
- [ ] 3. Implementar classe CVGenAPI
- [ ] 4. Adicionar formulário de dados do CV
- [ ] 5. Implementar seleção de templates
- [ ] 6. Testar geração de CV
- [ ] 7. Implementar download do PDF
- [ ] 8. Adicionar tratamento de erros
- [ ] 9. Estilizar interface
- [ ] 10. Testar em produção

## 🎯 Resultado Final

Com esta integração, sua aplicação externa terá:

✅ **Seleção de Templates**: Interface para escolher entre templates gratuitos e premium
✅ **Formulário Completo**: Coleta todos os dados necessários para o CV
✅ **Geração de PDF**: Cria PDF profissional em segundos
✅ **Download Direto**: Usuário pode baixar o PDF imediatamente
✅ **Tratamento de Erros**: Feedback claro para o usuário
✅ **Interface Responsiva**: Funciona em desktop e mobile

---

**🚀 Sua aplicação agora tem um gerador de CV profissional integrado!**