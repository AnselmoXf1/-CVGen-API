// Exemplo de integração do MozDJob com CVGen API
class MozDJobCVGenIntegration {
    constructor() {
        this.apiKey = 'cvgen_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // API Key do MozDJob
        this.apiUrl = 'http://localhost:3000'; // URL da API CVGen
        this.templates = [];
        
        this.init();
    }

    async init() {
        await this.loadTemplates();
        this.bindEvents();
    }

    // Carregar templates disponíveis
    async loadTemplates() {
        try {
            const response = await fetch(`${this.apiUrl}/templates`);
            const data = await response.json();
            
            if (data.status === 'sucesso') {
                this.templates = data.data.templates;
                this.renderTemplateSelector();
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
        }
    }

    // Renderizar seletor de templates
    renderTemplateSelector() {
        const selector = document.getElementById('templateSelector');
        if (!selector) return;

        const templatesHTML = this.templates.map(template => `
            <div class="template-option" data-template-id="${template.id}">
                <div class="template-preview">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                    <span class="template-badge ${template.isPremium ? 'premium' : 'free'}">
                        ${template.isPremium ? '💎 Premium' : '🆓 Gratuito'}
                    </span>
                </div>
            </div>
        `).join('');

        selector.innerHTML = templatesHTML;
    }

    // Gerar CV para um candidato
    async gerarCVCandidato(candidatoId) {
        try {
            // 1. Buscar dados do candidato no banco do MozDJob
            const candidato = await this.getCandidatoData(candidatoId);
            
            // 2. Mostrar modal de seleção de template
            this.showTemplateModal(candidato);
            
        } catch (error) {
            this.showError('Erro ao carregar dados do candidato: ' + error.message);
        }
    }

    // Simular busca de dados do candidato (substituir pela implementação real)
    async getCandidatoData(candidatoId) {
        // Simulação - substituir pela consulta real ao banco do MozDJob
        return {
            id: candidatoId,
            nome: 'João Silva Santos',
            email: 'joao.silva@email.com',
            telefone: '(11) 99999-8888',
            endereco: 'São Paulo, SP - Brasil',
            linkedin: 'https://linkedin.com/in/joao-silva',
            github: 'https://github.com/joao-silva',
            resumo: 'Desenvolvedor Full Stack com 5 anos de experiência em tecnologias modernas. Especialista em React, Node.js e Python.',
            experiencias: [
                {
                    empresa: 'TechCorp Brasil',
                    cargo: 'Desenvolvedor Senior',
                    periodo: '2021 - Atual',
                    descricao: 'Desenvolvimento de aplicações web escaláveis usando React e Node.js. Liderança técnica de equipe de 5 desenvolvedores.'
                },
                {
                    empresa: 'StartupXYZ',
                    cargo: 'Desenvolvedor Full Stack',
                    periodo: '2019 - 2021',
                    descricao: 'Desenvolvimento de MVP e crescimento do produto de 0 a 10k usuários ativos.'
                }
            ],
            educacao: [
                {
                    instituicao: 'Universidade de São Paulo',
                    curso: 'Bacharelado em Ciência da Computação',
                    periodo: '2015 - 2019'
                }
            ],
            habilidades: [
                'JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 
                'PostgreSQL', 'Docker', 'AWS', 'Git', 'Scrum'
            ],
            certificacoes: [
                {
                    nome: 'AWS Solutions Architect',
                    instituicao: 'Amazon Web Services',
                    data: '2023'
                }
            ]
        };
    }

    // Mostrar modal de seleção de template
    showTemplateModal(candidato) {
        const modal = document.getElementById('cvTemplateModal');
        const candidatoName = document.getElementById('candidatoName');
        
        candidatoName.textContent = candidato.nome;
        modal.style.display = 'block';
        
        // Armazenar dados do candidato para uso posterior
        this.currentCandidato = candidato;
    }

    // Criar CV com template selecionado
    async createCVWithTemplate(templateId) {
        if (!this.currentCandidato) {
            this.showError('Dados do candidato não encontrados');
            return;
        }

        this.showLoading(true);

        try {
            // Preparar dados para a API CVGen
            const cvData = {
                templateId: templateId,
                nome: this.currentCandidato.nome,
                email: this.currentCandidato.email,
                telefone: this.currentCandidato.telefone,
                endereco: this.currentCandidato.endereco,
                linkedin: this.currentCandidato.linkedin,
                github: this.currentCandidato.github,
                resumo: this.currentCandidato.resumo,
                experiencias: this.currentCandidato.experiencias,
                educacao: this.currentCandidato.educacao,
                habilidades: this.currentCandidato.habilidades,
                certificacoes: this.currentCandidato.certificacoes
            };

            // Chamar API CVGen
            const response = await fetch(`${this.apiUrl}/cv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(cvData)
            });

            const result = await response.json();

            if (result.status === 'sucesso') {
                this.showSuccess(result.data);
                this.hideTemplateModal();
                
                // Salvar referência do CV no banco do MozDJob (opcional)
                await this.saveCVReference(this.currentCandidato.id, result.data);
                
            } else {
                this.showError('Erro ao gerar CV: ' + result.message);
            }

        } catch (error) {
            this.showError('Erro de conexão: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // Salvar referência do CV no banco do MozDJob
    async saveCVReference(candidatoId, cvData) {
        try {
            // Implementar salvamento no banco do MozDJob
            const cvReference = {
                candidatoId: candidatoId,
                cvgenId: cvData.cvId,
                pdfUrl: cvData.pdfUrl,
                downloadUrl: cvData.downloadUrl,
                createdAt: new Date(),
                status: 'completed'
            };

            // Salvar no banco local do MozDJob
            console.log('CV salvo no MozDJob:', cvReference);
            
        } catch (error) {
            console.error('Erro ao salvar referência do CV:', error);
        }
    }

    // Mostrar sucesso com links de download
    showSuccess(cvData) {
        const successDiv = document.getElementById('cvSuccess');
        successDiv.innerHTML = `
            <div class="success-message">
                <h3>✅ CV Gerado com Sucesso!</h3>
                <p>O currículo de <strong>${this.currentCandidato.nome}</strong> foi gerado.</p>
                
                <div class="cv-actions">
                    <a href="${cvData.pdfUrl}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Visualizar PDF
                    </a>
                    
                    <button onclick="mozdjob.downloadCV('${cvData.cvId}')" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Baixar PDF
                    </button>
                    
                    <button onclick="mozdjob.shareCV('${cvData.pdfUrl}')" class="btn btn-outline">
                        <i class="fas fa-share"></i> Compartilhar
                    </button>
                </div>
                
                <div class="cv-info">
                    <small>ID do CV: ${cvData.cvId}</small><br>
                    <small>Gerado em: ${new Date(cvData.createdAt).toLocaleString('pt-BR')}</small>
                </div>
            </div>
        `;
        successDiv.style.display = 'block';
    }

    // Download programático do CV
    async downloadCV(cvId) {
        try {
            const response = await fetch(`${this.apiUrl}/cv/${cvId}/download`, {
                headers: {
                    'x-api-key': this.apiKey
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cv-${this.currentCandidato.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Erro ao baixar CV');
            }
        } catch (error) {
            this.showError('Erro ao baixar CV: ' + error.message);
        }
    }

    // Compartilhar CV
    shareCV(pdfUrl) {
        if (navigator.share) {
            navigator.share({
                title: `CV - ${this.currentCandidato.nome}`,
                text: 'Confira meu currículo profissional',
                url: pdfUrl
            });
        } else {
            // Fallback: copiar URL
            navigator.clipboard.writeText(pdfUrl).then(() => {
                alert('Link do CV copiado para a área de transferência!');
            });
        }
    }

    // Utilitários de UI
    showLoading(show) {
        const loading = document.getElementById('cvLoading');
        loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('cvError');
        errorDiv.innerHTML = `<div class="error-message">❌ ${message}</div>`;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    hideTemplateModal() {
        const modal = document.getElementById('cvTemplateModal');
        modal.style.display = 'none';
    }

    // Bind eventos
    bindEvents() {
        // Seleção de template
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-option')) {
                const templateId = e.target.closest('.template-option').dataset.templateId;
                this.createCVWithTemplate(templateId);
            }
        });

        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.hideTemplateModal();
            }
        });
    }
}

// Inicializar integração
const mozdjob = new MozDJobCVGenIntegration();

// Função global para ser chamada pelos botões da interface
window.gerarCV = function(candidatoId) {
    mozdjob.gerarCVCandidato(candidatoId);
};

// Exemplo de uso:
// <button onclick="gerarCV(123)">📄 Gerar CV</button>