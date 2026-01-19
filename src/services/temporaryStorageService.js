const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TemporaryStorageService {
    constructor() {
        this.tempDir = path.join(process.cwd(), 'temp');
        this.cleanupInterval = 30 * 60 * 1000; // 30 minutos
        this.maxFileAge = 60 * 60 * 1000; // 1 hora
        
        this.initTempDirectory();
        this.startCleanupScheduler();
    }

    async initTempDirectory() {
        try {
            await fs.access(this.tempDir);
        } catch {
            await fs.mkdir(this.tempDir, { recursive: true });
            console.log('📁 Diretório temporário criado:', this.tempDir);
        }
    }

    // Gerar arquivo temporário
    async createTemporaryFile(pdfBuffer, originalName = 'cv') {
        const tempId = uuidv4();
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
        const fileName = `${sanitizedName}-${tempId}.pdf`;
        const filePath = path.join(this.tempDir, fileName);
        
        // Salvar arquivo temporário
        await fs.writeFile(filePath, pdfBuffer);
        
        const fileInfo = {
            tempId,
            fileName,
            filePath,
            originalName,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.maxFileAge),
            downloadUrl: `/download/temp/${fileName}`,
            size: pdfBuffer.length
        };

        console.log(`📄 Arquivo temporário criado: ${fileName} (${this.formatBytes(pdfBuffer.length)})`);
        
        // Agendar exclusão automática
        this.scheduleFileDeletion(filePath, this.maxFileAge);
        
        return fileInfo;
    }

    // Agendar exclusão de arquivo específico
    scheduleFileDeletion(filePath, delay) {
        setTimeout(async () => {
            try {
                await fs.unlink(filePath);
                console.log(`🗑️  Arquivo temporário deletado: ${path.basename(filePath)}`);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Erro ao deletar arquivo temporário:', error);
                }
            }
        }, delay);
    }

    // Verificar se arquivo existe e é válido
    async validateTemporaryFile(fileName) {
        const filePath = path.join(this.tempDir, fileName);
        
        try {
            const stats = await fs.stat(filePath);
            const fileAge = Date.now() - stats.birthtime.getTime();
            
            if (fileAge > this.maxFileAge) {
                // Arquivo expirado, deletar
                await fs.unlink(filePath);
                return { valid: false, reason: 'expired' };
            }
            
            return { 
                valid: true, 
                filePath, 
                size: stats.size,
                createdAt: stats.birthtime 
            };
        } catch (error) {
            return { valid: false, reason: 'not_found' };
        }
    }

    // Obter arquivo temporário para download
    async getTemporaryFile(fileName) {
        const validation = await this.validateTemporaryFile(fileName);
        
        if (!validation.valid) {
            throw new Error(`Arquivo não disponível: ${validation.reason}`);
        }
        
        return {
            filePath: validation.filePath,
            size: validation.size,
            createdAt: validation.createdAt
        };
    }

    // Deletar arquivo imediatamente após download
    async deleteAfterDownload(filePath) {
        try {
            await fs.unlink(filePath);
            console.log(`📥 Arquivo deletado após download: ${path.basename(filePath)}`);
        } catch (error) {
            console.error('Erro ao deletar arquivo após download:', error);
        }
    }

    // Limpeza automática de arquivos antigos
    async cleanupExpiredFiles() {
        try {
            const files = await fs.readdir(this.tempDir);
            let deletedCount = 0;
            
            for (const file of files) {
                const filePath = path.join(this.tempDir, file);
                
                try {
                    const stats = await fs.stat(filePath);
                    const fileAge = Date.now() - stats.birthtime.getTime();
                    
                    if (fileAge > this.maxFileAge) {
                        await fs.unlink(filePath);
                        deletedCount++;
                    }
                } catch (error) {
                    // Arquivo já foi deletado ou erro de acesso
                    continue;
                }
            }
            
            if (deletedCount > 0) {
                console.log(`🧹 Limpeza automática: ${deletedCount} arquivos expirados removidos`);
            }
        } catch (error) {
            console.error('Erro na limpeza automática:', error);
        }
    }

    // Iniciar agendador de limpeza
    startCleanupScheduler() {
        setInterval(() => {
            this.cleanupExpiredFiles();
        }, this.cleanupInterval);
        
        console.log(`⏰ Limpeza automática agendada a cada ${this.cleanupInterval / 60000} minutos`);
    }

    // Obter estatísticas do diretório temporário
    async getStats() {
        try {
            const files = await fs.readdir(this.tempDir);
            let totalSize = 0;
            let validFiles = 0;
            let expiredFiles = 0;
            
            for (const file of files) {
                const filePath = path.join(this.tempDir, file);
                
                try {
                    const stats = await fs.stat(filePath);
                    const fileAge = Date.now() - stats.birthtime.getTime();
                    
                    totalSize += stats.size;
                    
                    if (fileAge > this.maxFileAge) {
                        expiredFiles++;
                    } else {
                        validFiles++;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            return {
                totalFiles: files.length,
                validFiles,
                expiredFiles,
                totalSize: this.formatBytes(totalSize),
                tempDir: this.tempDir
            };
        } catch (error) {
            return {
                error: error.message,
                tempDir: this.tempDir
            };
        }
    }

    // Formatar bytes para leitura humana
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Limpar todos os arquivos temporários (para manutenção)
    async clearAllTemporaryFiles() {
        try {
            const files = await fs.readdir(this.tempDir);
            let deletedCount = 0;
            
            for (const file of files) {
                const filePath = path.join(this.tempDir, file);
                
                try {
                    await fs.unlink(filePath);
                    deletedCount++;
                } catch (error) {
                    continue;
                }
            }
            
            console.log(`🧹 Limpeza manual: ${deletedCount} arquivos removidos`);
            return { deletedCount };
        } catch (error) {
            console.error('Erro na limpeza manual:', error);
            throw error;
        }
    }
}

module.exports = new TemporaryStorageService();