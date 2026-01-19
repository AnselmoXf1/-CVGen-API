const express = require('express');
const router = express.Router();
const path = require('path');
const temporaryStorage = require('../services/temporaryStorageService');

// Download de arquivo temporário
router.get('/temp/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;
        
        // Validar nome do arquivo
        if (!fileName || !fileName.match(/^[a-zA-Z0-9-_]+\.(pdf|html)$/)) {
            return res.status(400).json({
                status: 'erro',
                message: 'Nome de arquivo inválido'
            });
        }

        console.log(`📥 Solicitação de download: ${fileName}`);

        // Obter arquivo temporário
        const fileInfo = await temporaryStorage.getTemporaryFile(fileName);
        
        // Configurar headers para download
        const fileExtension = path.extname(fileName).toLowerCase();
        const contentType = fileExtension === '.pdf' ? 'application/pdf' : 'text/html';
        const baseName = path.basename(fileName, fileExtension);
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}${fileExtension}"`);
        res.setHeader('Content-Length', fileInfo.size);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Enviar arquivo
        res.sendFile(path.resolve(fileInfo.filePath), (err) => {
            if (err) {
                console.error('Erro ao enviar arquivo:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        status: 'erro',
                        message: 'Erro ao baixar arquivo'
                    });
                }
            } else {
                console.log(`✅ Download concluído: ${fileName}`);
                
                // Deletar arquivo após download bem-sucedido
                temporaryStorage.deleteAfterDownload(fileInfo.filePath);
            }
        });

    } catch (error) {
        console.error('Erro no download temporário:', error);
        
        if (error.message.includes('expired')) {
            return res.status(410).json({
                status: 'erro',
                message: 'Arquivo expirado. Gere um novo CV.',
                code: 'FILE_EXPIRED'
            });
        }
        
        if (error.message.includes('not_found')) {
            return res.status(404).json({
                status: 'erro',
                message: 'Arquivo não encontrado. Verifique se o link está correto.',
                code: 'FILE_NOT_FOUND'
            });
        }

        res.status(500).json({
            status: 'erro',
            message: 'Erro interno do servidor'
        });
    }
});

// Verificar status de arquivo temporário
router.get('/temp/:fileName/status', async (req, res) => {
    try {
        const { fileName } = req.params;
        
        const validation = await temporaryStorage.validateTemporaryFile(fileName);
        
        if (validation.valid) {
            res.json({
                status: 'sucesso',
                data: {
                    fileName,
                    available: true,
                    size: validation.size,
                    createdAt: validation.createdAt,
                    downloadUrl: `/download/temp/${fileName}`
                }
            });
        } else {
            res.status(404).json({
                status: 'erro',
                message: validation.reason === 'expired' ? 'Arquivo expirado' : 'Arquivo não encontrado',
                data: {
                    fileName,
                    available: false,
                    reason: validation.reason
                }
            });
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({
            status: 'erro',
            message: 'Erro interno do servidor'
        });
    }
});

// Estatísticas do armazenamento temporário (apenas para admin)
router.get('/temp/admin/stats', async (req, res) => {
    try {
        // Verificar se é admin (simplificado)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'erro',
                message: 'Token de autorização requerido'
            });
        }

        const stats = await temporaryStorage.getStats();
        
        res.json({
            status: 'sucesso',
            data: {
                ...stats,
                message: 'Estatísticas do armazenamento temporário'
            }
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            status: 'erro',
            message: 'Erro interno do servidor'
        });
    }
});

// Limpeza manual (apenas para admin)
router.post('/temp/admin/cleanup', async (req, res) => {
    try {
        // Verificar se é admin (simplificado)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'erro',
                message: 'Token de autorização requerido'
            });
        }

        const result = await temporaryStorage.clearAllTemporaryFiles();
        
        res.json({
            status: 'sucesso',
            message: 'Limpeza manual executada com sucesso',
            data: result
        });
    } catch (error) {
        console.error('Erro na limpeza manual:', error);
        res.status(500).json({
            status: 'erro',
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;