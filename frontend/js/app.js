// CVGen Frontend Application
class CVGenApp {
    constructor() {
        this.apiUrl = 'http://localhost:3001';
        this.currentUser = null;
        this.currentStep = 1;
        this.selectedTemplate = null;
        this.cvData = {};
        this.skills = [];
        
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadTemplates();
        this.loadStats();
    }

    // Authentication
    checkAuth() {
        const token = localStorage.getItem('cvgen_token');
        const user = localStorage.getItem('cvgen_user');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.showAuthenticatedState();
        }
    }

    showAuthenticatedState() {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('dashboardLink').style.display = 'block';
        document.getElementById('userName').textContent = this.currentUser.name;
        
        this.loadUserData();
    }

    showUnauthenticatedState() {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('registerBtn').style.display = 'block';
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('dashboardLink').style.display = 'none';
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.status === 'sucesso') {
                localStorage.setItem('cvgen_token', data.data.token);
                localStorage.setItem('cvgen_user', JSON.stringify(data.data.user));
                this.currentUser = data.data.user;
                this.showAuthenticatedState();
                this.closeModal('loginModal');
                this.showToast('Login realizado com sucesso!', 'success');
                this.showSection('dashboard');
            } else {
                this.showToast(data.message, 'error');
            }
        } catch (error) {
            this.showToast('Erro ao fazer login', 'error');
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (data.status === 'sucesso') {
                localStorage.setItem('cvgen_token', data.data.token);
                localStorage.setItem('cvgen_user', JSON.stringify(data.data.user));
                this.currentUser = data.data.user;
                this.showAuthenticatedState();
                this.closeModal('registerModal');
                this.showToast('Cadastro realizado com sucesso!', 'success');
                this.showSection('dashboard');
            } else {
                this.showToast(data.message, 'error');
            }
        } catch (error) {
            this.showToast('Erro ao fazer cadastro', 'error');
        }
    }

    logout() {
        localStorage.removeItem('cvgen_token');
        localStorage.removeItem('cvgen_user');
        this.currentUser = null;
        this.showUnauthenticatedState();
        this.showSection('home');
        this.showToast('Logout realizado com sucesso!', 'info');
    }

    // API Requests
    async apiRequest(endpoint, options = {}) {
        const token = localStorage.getItem('cvgen_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            ...options,
            headers
        });

        return await response.json();
    }

    // Templates
    async loadTemplates() {
        try {
            const response = await fetch(`${this.apiUrl}/templates`);
            const data = await response.json();
            
            if (data.status === 'sucesso') {
                this.renderTemplates(data.data.templates);
            } else {
                this.showTemplatesError('Erro ao carregar templates da API');
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            this.showTemplatesError('API não disponível. Verifique se o servidor está rodando.');
        }
    }

    showTemplatesError(message) {
        const templatesGrid = document.getElementById('templatesGrid');
        const templateSelection = document.getElementById('templateSelection');
        
        const errorHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar templates</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="app.loadTemplates()">
                    <i class="fas fa-refresh"></i> Tentar novamente
                </button>
            </div>
        `;

        if (templatesGrid) {
            templatesGrid.innerHTML = errorHTML;
        }

        if (templateSelection) {
            templateSelection.innerHTML = errorHTML;
        }
    }

    renderTemplates(templates) {
        const templatesGrid = document.getElementById('templatesGrid');
        const templateSelection = document.getElementById('templateSelection');
        
        const templateHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                    <p>${template.description}</p>
                    <span class="template-badge ${template.isPremium ? 'premium' : 'free'}">
                        ${template.isPremium ? 'Premium' : 'Gratuito'}
                    </span>
                </div>
            </div>
        `).join('');

        if (templatesGrid) {
            templatesGrid.innerHTML = templateHTML;
        }

        if (templateSelection) {
            const selectionHTML = templates.map(template => `
                <div class="template-option" data-template-id="${template.id}">
                    <div class="template-preview-small">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h4>${template.name}</h4>
                    <span class="template-badge ${template.isPremium ? 'premium' : 'free'}">
                        ${template.isPremium ? 'Premium' : 'Gratuito'}
                    </span>
                </div>
            `).join('');
            templateSelection.innerHTML = selectionHTML;
        }
    }

    // Stats
    async loadStats() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const data = await response.json();
            
            if (data.status === 'sucesso') {
                // Carregar estatísticas reais da API
                this.loadRealStats();
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            // Limpar estatísticas se API não estiver disponível
            document.getElementById('totalCvs').textContent = '0';
            document.getElementById('totalUsers').textContent = '0';
            document.getElementById('totalTemplates').textContent = '0';
        }
    }

    async loadRealStats() {
        try {
            // Carregar estatísticas reais se usuário estiver logado
            if (this.currentUser) {
                const cvsResponse = await this.apiRequest('/cv');
                if (cvsResponse.status === 'sucesso') {
                    document.getElementById('totalCvs').textContent = cvsResponse.data.cvs.length;
                }
            } else {
                // Se não estiver logado, mostrar 0
                document.getElementById('totalCvs').textContent = '0';
            }

            // Carregar número de templates disponíveis
            const templatesResponse = await fetch(`${this.apiUrl}/templates`);
            const templatesData = await templatesResponse.json();
            if (templatesData.status === 'sucesso') {
                document.getElementById('totalTemplates').textContent = templatesData.data.templates.length;
            }

            // Usuários - só mostrar se for admin
            if (this.currentUser && this.currentUser.role === 'admin') {
                // Admin pode ver estatísticas de usuários
                document.getElementById('totalUsers').textContent = '1'; // Placeholder
            } else {
                document.getElementById('totalUsers').textContent = '0';
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas reais:', error);
            document.getElementById('totalCvs').textContent = '0';
            document.getElementById('totalUsers').textContent = '0';
            document.getElementById('totalTemplates').textContent = '0';
        }
    }

    // User Data
    async loadUserData() {
        if (!this.currentUser) return;

        try {
            // Carregar CVs do usuário
            const cvsResponse = await this.apiRequest('/cv');
            if (cvsResponse.status === 'sucesso') {
                this.renderUserCVs(cvsResponse.data.cvs);
                document.getElementById('userCvCount').textContent = cvsResponse.data.cvs.length;
            } else {
                this.renderUserCVs([]);
                document.getElementById('userCvCount').textContent = '0';
                if (cvsResponse.message) {
                    this.showToast(`Erro ao carregar CVs: ${cvsResponse.message}`, 'error');
                }
            }

            // Carregar API Keys
            const apiKeysResponse = await this.apiRequest('/auth/api-keys');
            if (apiKeysResponse.status === 'sucesso') {
                this.renderApiKeys(apiKeysResponse.data.apiKeys);
            } else {
                this.renderApiKeys([]);
                if (apiKeysResponse.message) {
                    this.showToast(`Erro ao carregar API Keys: ${apiKeysResponse.message}`, 'error');
                }
            }

            // Atualizar informações do plano
            document.getElementById('userPlan').textContent = this.currentUser.plan.toUpperCase();
            
            // Mostrar limites do plano
            this.updatePlanLimits();

        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            this.showToast('Erro de conexão com a API. Verifique se o servidor está rodando.', 'error');
            
            // Limpar dados em caso de erro
            this.renderUserCVs([]);
            this.renderApiKeys([]);
            document.getElementById('userCvCount').textContent = '0';
        }
    }

    updatePlanLimits() {
        const planLimits = {
            free: { cvLimit: 20, premiumTemplates: false },
            pro: { cvLimit: 500, premiumTemplates: true },
            enterprise: { cvLimit: 'Ilimitado', premiumTemplates: true }
        };

        const userPlan = this.currentUser.plan;
        const limits = planLimits[userPlan];

        if (limits) {
            const planInfoElement = document.getElementById('planInfo');
            if (planInfoElement) {
                planInfoElement.innerHTML = `
                    <div class="plan-limits">
                        <p><strong>Plano:</strong> ${userPlan.toUpperCase()}</p>
                        <p><strong>Limite de CVs:</strong> ${limits.cvLimit} por mês</p>
                        <p><strong>Templates Premium:</strong> ${limits.premiumTemplates ? 'Sim' : 'Não'}</p>
                    </div>
                `;
            }
        }
    }

    renderUserCVs(cvs) {
        const userCvs = document.getElementById('userCvs');
        
        if (!cvs || cvs.length === 0) {
            userCvs.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>Nenhum CV criado ainda</h3>
                    <p>Crie seu primeiro CV profissional agora mesmo!</p>
                    <button class="btn btn-primary" onclick="app.showModal('cvModal')">
                        <i class="fas fa-plus"></i> Criar meu primeiro CV
                    </button>
                </div>
            `;
            return;
        }

        const cvsHTML = cvs.map(cv => `
            <div class="cv-item">
                <div class="cv-info">
                    <h4>${cv.nome}</h4>
                    <p><i class="fas fa-envelope"></i> ${cv.email}</p>
                    <p><i class="fas fa-calendar"></i> Criado em ${new Date(cv.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p>Status: <span class="status status-${cv.status}">${this.getStatusText(cv.status)}</span></p>
                    ${cv.template ? `<p><i class="fas fa-palette"></i> Template: ${cv.template.name}</p>` : ''}
                </div>
                <div class="cv-actions">
                    ${cv.status === 'completed' && cv.pdfUrl ? `
                        <button class="btn btn-primary btn-sm" onclick="app.downloadCV('${cv.id}')" title="Baixar PDF">
                            <i class="fas fa-download"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" onclick="app.viewCV('${cv.id}')" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteCV('${cv.id}')" title="Deletar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        userCvs.innerHTML = cvsHTML;
    }

    getStatusText(status) {
        const statusMap = {
            'processing': 'Processando',
            'completed': 'Concluído',
            'failed': 'Erro'
        };
        return statusMap[status] || status;
    }

    renderApiKeys(apiKeys) {
        const apiKeysList = document.getElementById('apiKeysList');
        
        if (!apiKeys || apiKeys.length === 0) {
            apiKeysList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-key"></i>
                    <h4>Nenhuma API Key gerada ainda</h4>
                    <p>Gere uma API Key para integrar com sistemas externos</p>
                    <button class="btn btn-primary" onclick="app.generateApiKey()">
                        <i class="fas fa-plus"></i> Gerar API Key
                    </button>
                </div>
            `;
            return;
        }

        const keysHTML = apiKeys.map(key => `
            <div class="api-key-item">
                <div class="api-key-header">
                    <h4>${key.name}</h4>
                    <span class="api-key-status ${key.isActive ? 'active' : 'inactive'}">
                        ${key.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                </div>
                <div class="api-key-value">
                    <code>${key.key}</code>
                    <button class="btn btn-outline btn-sm copy-btn" onclick="app.copyToClipboard('${key.key}')" title="Copiar">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <p class="api-key-date">
                    <i class="fas fa-calendar"></i> 
                    Criada em ${new Date(key.createdAt).toLocaleDateString('pt-BR')}
                </p>
            </div>
        `).join('');

        apiKeysList.innerHTML = keysHTML;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('API Key copiada para a área de transferência!', 'success');
        }).catch(() => {
            this.showToast('Erro ao copiar API Key', 'error');
        });
    }

    // CV Creation
    async createCV() {
        if (!this.selectedTemplate) {
            this.showToast('Selecione um template primeiro', 'error');
            return;
        }

        const cvData = {
            templateId: this.selectedTemplate,
            nome: document.getElementById('cvNome').value,
            email: document.getElementById('cvEmail').value,
            telefone: document.getElementById('cvTelefone').value,
            endereco: document.getElementById('cvEndereco').value,
            linkedin: document.getElementById('cvLinkedin').value,
            github: document.getElementById('cvGithub').value,
            resumo: document.getElementById('cvResumo').value,
            experiencias: this.getExperiencias(),
            educacao: this.getEducacao(),
            habilidades: this.skills
        };

        this.showLoading(true);

        try {
            const response = await this.apiRequest('/cv', {
                method: 'POST',
                body: JSON.stringify(cvData)
            });

            if (response.status === 'sucesso') {
                this.showToast('CV criado com sucesso!', 'success');
                this.closeModal('cvModal');
                this.resetCVForm();
                this.loadUserData();
                
                // Sistema de Download Direto
                this.handleDirectDownload(response.data);
            } else {
                this.showToast(response.message, 'error');
            }
        } catch (error) {
            this.showToast('Erro ao criar CV', 'error');
            console.error('Erro na criação do CV:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // Gerenciar download direto
    handleDirectDownload(cvData) {
        // Mostrar modal de download com informações importantes
        this.showDownloadModal(cvData);
        
        // Auto-download após 2 segundos
        setTimeout(() => {
            this.initiateDownload(cvData.directDownload, cvData.fileName);
        }, 2000);
    }

    // Mostrar modal de download
    showDownloadModal(cvData) {
        const modalHTML = `
            <div id="downloadModal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>✅ CV Gerado com Sucesso!</h2>
                    </div>
                    <div class="modal-body">
                        <div class="download-info">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3>${cvData.fileName}</h3>
                            <p class="file-size">Tamanho: ${this.formatBytes(cvData.size)}</p>
                            
                            <div class="warning-box">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>Importante:</strong> Este arquivo será automaticamente deletado em 1 hora por questões de privacidade.
                            </div>
                            
                            <div class="countdown">
                                <p>Download iniciando em <span id="countdown">3</span> segundos...</p>
                                <div class="progress-bar">
                                    <div class="progress-fill"></div>
                                </div>
                            </div>
                            
                            <div class="download-actions">
                                <button class="btn btn-primary" onclick="app.initiateDownload('${cvData.directDownload}', '${cvData.fileName}')">
                                    <i class="fas fa-download"></i> Baixar Agora
                                </button>
                                <button class="btn btn-secondary" onclick="app.copyDownloadLink('${cvData.directDownload}')">
                                    <i class="fas fa-copy"></i> Copiar Link
                                </button>
                            </div>
                            
                            <div class="expiry-info">
                                <small>
                                    <i class="fas fa-clock"></i>
                                    Expira em: ${new Date(cvData.expiresAt).toLocaleString('pt-BR')}
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="app.closeDownloadModal()">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente se houver
        const existingModal = document.getElementById('downloadModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Adicionar novo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Iniciar countdown
        this.startCountdown();
    }

    // Iniciar countdown visual
    startCountdown() {
        let count = 3;
        const countdownElement = document.getElementById('countdown');
        const progressFill = document.querySelector('.progress-fill');
        
        const interval = setInterval(() => {
            count--;
            if (countdownElement) {
                countdownElement.textContent = count;
            }
            
            if (progressFill) {
                progressFill.style.width = `${((3 - count) / 3) * 100}%`;
            }
            
            if (count <= 0) {
                clearInterval(interval);
                const countdownContainer = document.querySelector('.countdown');
                if (countdownContainer) {
                    countdownContainer.innerHTML = '<p class="download-starting">📥 Iniciando download...</p>';
                }
            }
        }, 1000);
    }

    // Iniciar download
    initiateDownload(downloadUrl, fileName) {
        try {
            // Criar elemento de download invisível
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || 'cv.pdf';
            link.style.display = 'none';
            
            // Adicionar ao DOM, clicar e remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Mostrar feedback de sucesso
            this.showToast('Download iniciado! Verifique sua pasta de downloads.', 'success');
            
            // Atualizar modal para mostrar sucesso
            setTimeout(() => {
                const countdownContainer = document.querySelector('.countdown');
                if (countdownContainer) {
                    countdownContainer.innerHTML = `
                        <div class="download-success">
                            <i class="fas fa-check"></i>
                            <p>Download iniciado com sucesso!</p>
                        </div>
                    `;
                }
            }, 500);
            
        } catch (error) {
            console.error('Erro no download:', error);
            this.showToast('Erro ao iniciar download. Tente novamente.', 'error');
        }
    }

    // Copiar link de download
    copyDownloadLink(downloadUrl) {
        navigator.clipboard.writeText(downloadUrl).then(() => {
            this.showToast('Link copiado! Cole em uma nova aba para baixar.', 'success');
        }).catch(() => {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = downloadUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Link copiado!', 'success');
        });
    }

    // Fechar modal de download
    closeDownloadModal() {
        const modal = document.getElementById('downloadModal');
        if (modal) {
            modal.remove();
        }
    }

    // Formatar bytes para exibição
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getExperiencias() {
        const experiencias = [];
        const items = document.querySelectorAll('.experiencia-item');
        
        items.forEach(item => {
            const empresa = item.querySelector('.exp-empresa').value;
            const cargo = item.querySelector('.exp-cargo').value;
            const periodo = item.querySelector('.exp-periodo').value;
            const descricao = item.querySelector('.exp-descricao').value;
            
            if (empresa && cargo) {
                experiencias.push({ empresa, cargo, periodo, descricao });
            }
        });
        
        return experiencias;
    }

    getEducacao() {
        const educacao = [];
        const items = document.querySelectorAll('.educacao-item');
        
        items.forEach(item => {
            const instituicao = item.querySelector('.edu-instituicao').value;
            const curso = item.querySelector('.edu-curso').value;
            const periodo = item.querySelector('.edu-periodo').value;
            
            if (instituicao && curso) {
                educacao.push({ instituicao, curso, periodo });
            }
        });
        
        return educacao;
    }

    // CV Management
    async downloadCV(cvId) {
        try {
            const response = await this.apiRequest(`/cv/${cvId}`);
            if (response.status === 'sucesso' && response.data.cv.pdfUrl) {
                window.open(response.data.cv.pdfUrl, '_blank');
            } else {
                this.showToast('PDF não disponível para download', 'error');
            }
        } catch (error) {
            console.error('Erro ao baixar CV:', error);
            this.showToast('Erro ao baixar CV', 'error');
        }
    }

    async viewCV(cvId) {
        try {
            const response = await this.apiRequest(`/cv/${cvId}`);
            if (response.status === 'sucesso') {
                this.showCVDetails(response.data.cv);
            } else {
                this.showToast('Erro ao carregar detalhes do CV', 'error');
            }
        } catch (error) {
            console.error('Erro ao visualizar CV:', error);
            this.showToast('Erro ao visualizar CV', 'error');
        }
    }

    showCVDetails(cv) {
        const modal = document.getElementById('cvDetailsModal');
        if (!modal) {
            // Criar modal de detalhes se não existir
            this.createCVDetailsModal();
        }
        
        document.getElementById('cvDetailsContent').innerHTML = `
            <h3>${cv.nome}</h3>
            <div class="cv-details-grid">
                <div class="detail-item">
                    <strong>Email:</strong> ${cv.email}
                </div>
                <div class="detail-item">
                    <strong>Telefone:</strong> ${cv.telefone || 'Não informado'}
                </div>
                <div class="detail-item">
                    <strong>Endereço:</strong> ${cv.endereco || 'Não informado'}
                </div>
                <div class="detail-item">
                    <strong>Status:</strong> <span class="status status-${cv.status}">${this.getStatusText(cv.status)}</span>
                </div>
                <div class="detail-item">
                    <strong>Template:</strong> ${cv.template ? cv.template.name : 'Não informado'}
                </div>
                <div class="detail-item">
                    <strong>Criado em:</strong> ${new Date(cv.createdAt).toLocaleString('pt-BR')}
                </div>
            </div>
            ${cv.resumo ? `
                <div class="detail-section">
                    <h4>Resumo Profissional</h4>
                    <p>${cv.resumo}</p>
                </div>
            ` : ''}
            ${cv.experiencias && cv.experiencias.length > 0 ? `
                <div class="detail-section">
                    <h4>Experiências (${cv.experiencias.length})</h4>
                    ${cv.experiencias.map(exp => `
                        <div class="experience-item">
                            <strong>${exp.cargo}</strong> - ${exp.empresa}
                            <br><small>${exp.periodo}</small>
                            ${exp.descricao ? `<p>${exp.descricao}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${cv.educacao && cv.educacao.length > 0 ? `
                <div class="detail-section">
                    <h4>Educação (${cv.educacao.length})</h4>
                    ${cv.educacao.map(edu => `
                        <div class="education-item">
                            <strong>${edu.curso}</strong> - ${edu.instituicao}
                            <br><small>${edu.periodo}</small>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${cv.habilidades && cv.habilidades.length > 0 ? `
                <div class="detail-section">
                    <h4>Habilidades (${cv.habilidades.length})</h4>
                    <div class="skills-list">
                        ${cv.habilidades.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        this.showModal('cvDetailsModal');
    }

    createCVDetailsModal() {
        const modalHTML = `
            <div id="cvDetailsModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Detalhes do CV</h2>
                        <button class="modal-close" data-modal="cvDetailsModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="cvDetailsContent"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async deleteCV(cvId) {
        if (!confirm('Tem certeza que deseja deletar este CV?')) return;

        try {
            const response = await this.apiRequest(`/cv/${cvId}`, {
                method: 'DELETE'
            });

            if (response.status === 'sucesso') {
                this.showToast('CV deletado com sucesso!', 'success');
                this.loadUserData();
            } else {
                this.showToast(response.message, 'error');
            }
        } catch (error) {
            this.showToast('Erro ao deletar CV', 'error');
        }
    }

    // API Keys
    async generateApiKey() {
        const name = prompt('Nome da API Key:') || 'Nova API Key';

        try {
            const response = await this.apiRequest('/auth/api-key', {
                method: 'POST',
                body: JSON.stringify({ name })
            });

            if (response.status === 'sucesso') {
                this.showToast('API Key gerada com sucesso!', 'success');
                this.loadUserData();
            } else {
                this.showToast(response.message, 'error');
            }
        } catch (error) {
            this.showToast('Erro ao gerar API Key', 'error');
        }
    }

    // UI Helpers
    showSection(sectionId) {
        // Esconder todas as seções
        const sections = ['home', 'templates', 'pricing', 'dashboard'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Mostrar seção selecionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Atualizar navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check' : type === 'error' ? 'times' : 'info';
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // CV Form Steps
    nextStep() {
        if (this.currentStep < 4) {
            if (this.validateStep(this.currentStep)) {
                this.currentStep++;
                this.updateSteps();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateSteps();
        }
    }

    updateSteps() {
        // Atualizar indicadores de step
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Mostrar/esconder form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Atualizar botões de navegação
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');

        prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        
        if (this.currentStep === 4) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
        }

        // Atualizar resumo no step 4
        if (this.currentStep === 4) {
            this.updateCVSummary();
        }
    }

    validateStep(step) {
        switch (step) {
            case 1:
                if (!this.selectedTemplate) {
                    this.showToast('Selecione um template', 'error');
                    return false;
                }
                break;
            case 2:
                const nome = document.getElementById('cvNome').value;
                const email = document.getElementById('cvEmail').value;
                if (!nome || !email) {
                    this.showToast('Preencha os campos obrigatórios', 'error');
                    return false;
                }
                break;
        }
        return true;
    }

    updateCVSummary() {
        const summary = document.getElementById('cvSummary');
        const nome = document.getElementById('cvNome').value;
        const email = document.getElementById('cvEmail').value;
        const experiencias = this.getExperiencias();
        const educacao = this.getEducacao();

        summary.innerHTML = `
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Experiências:</strong> ${experiencias.length}</p>
            <p><strong>Educação:</strong> ${educacao.length}</p>
            <p><strong>Habilidades:</strong> ${this.skills.length}</p>
        `;
    }

    resetCVForm() {
        this.currentStep = 1;
        this.selectedTemplate = null;
        this.skills = [];
        document.getElementById('cvModal').querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        this.updateSteps();
    }

    // Skills Management
    addSkill(skill) {
        if (skill && !this.skills.includes(skill)) {
            this.skills.push(skill);
            this.renderSkills();
        }
    }

    removeSkill(skill) {
        this.skills = this.skills.filter(s => s !== skill);
        this.renderSkills();
    }

    renderSkills() {
        const container = document.getElementById('skillsTags');
        container.innerHTML = this.skills.map(skill => `
            <span class="skill-tag">
                ${skill}
                <span class="skill-remove" onclick="app.removeSkill('${skill}')">&times;</span>
            </span>
        `).join('');
    }

    // Event Bindings
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal('loginModal');
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showModal('registerModal');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.login(email, password);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            this.register(name, email, password);
        });

        // CV Creation
        document.getElementById('createCvBtn').addEventListener('click', () => {
            if (this.currentUser) {
                this.showModal('cvModal');
            } else {
                this.showModal('loginModal');
            }
        });

        document.getElementById('newCvBtn').addEventListener('click', () => {
            this.showModal('cvModal');
        });

        document.getElementById('viewTemplatesBtn').addEventListener('click', () => {
            this.showSection('templates');
        });

        // CV Form Navigation
        document.getElementById('nextStepBtn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStepBtn').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('generateCvBtn').addEventListener('click', () => {
            this.createCV();
        });

        // Template Selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-option')) {
                document.querySelectorAll('.template-option').forEach(option => {
                    option.classList.remove('selected');
                });
                e.target.closest('.template-option').classList.add('selected');
                this.selectedTemplate = e.target.closest('.template-option').dataset.templateId;
            }
        });

        // Skills Input
        document.getElementById('habilidadesInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const skill = e.target.value.trim();
                if (skill) {
                    this.addSkill(skill);
                    e.target.value = '';
                }
            }
        });

        // Add Experience/Education
        document.getElementById('addExperienciaBtn').addEventListener('click', () => {
            const container = document.getElementById('experienciasContainer');
            const newItem = document.createElement('div');
            newItem.className = 'experiencia-item';
            newItem.innerHTML = `
                <div class="form-grid">
                    <div class="form-group">
                        <label>Empresa</label>
                        <input type="text" class="exp-empresa">
                    </div>
                    <div class="form-group">
                        <label>Cargo</label>
                        <input type="text" class="exp-cargo">
                    </div>
                    <div class="form-group">
                        <label>Período</label>
                        <input type="text" class="exp-periodo" placeholder="2020 - 2024">
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea class="exp-descricao" rows="3"></textarea>
                </div>
                <button type="button" class="btn btn-outline btn-sm remove-item">Remover</button>
            `;
            container.appendChild(newItem);
        });

        document.getElementById('addEducacaoBtn').addEventListener('click', () => {
            const container = document.getElementById('educacaoContainer');
            const newItem = document.createElement('div');
            newItem.className = 'educacao-item';
            newItem.innerHTML = `
                <div class="form-grid">
                    <div class="form-group">
                        <label>Instituição</label>
                        <input type="text" class="edu-instituicao">
                    </div>
                    <div class="form-group">
                        <label>Curso</label>
                        <input type="text" class="edu-curso">
                    </div>
                    <div class="form-group">
                        <label>Período</label>
                        <input type="text" class="edu-periodo" placeholder="2016 - 2020">
                    </div>
                </div>
                <button type="button" class="btn btn-outline btn-sm remove-item">Remover</button>
            `;
            container.appendChild(newItem);
        });

        // Remove items
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                e.target.closest('.experiencia-item, .educacao-item').remove();
            }
        });

        // API Keys
        document.getElementById('generateApiKeyBtn').addEventListener('click', () => {
            this.generateApiKey();
        });

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                this.closeModal(modalId);
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
}

// Initialize app
const app = new CVGenApp();