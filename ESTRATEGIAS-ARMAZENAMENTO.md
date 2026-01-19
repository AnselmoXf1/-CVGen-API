# 💾 Estratégias de Armazenamento - CVs Gerados

## 🎯 Cenários de Uso

### 1. 📱 **Download Direto** (Recomendado para Usuários Finais)
**Conceito:** CV é gerado, usuário baixa imediatamente, arquivo é deletado do servidor

#### Vantagens:
- ✅ **Privacidade máxima** - CV não fica no servidor
- ✅ **Economia de espaço** - Sem acúmulo de arquivos
- ✅ **LGPD/GDPR compliant** - Dados não são armazenados
- ✅ **Sem custos de storage** - Apenas processamento

#### Implementação:
```javascript
// Gerar CV temporário
async function gerarCVTemporario(cvData, templateId) {
    // 1. Gerar PDF
    const pdfBuffer = await pdfService.generatePDF(cvData, template);
    
    // 2. Criar arquivo temporário
    const tempFileName = `cv_temp_${Date.now()}_${Math.random().toString(36)}.pdf`;
    const tempPath = path.join('./temp', tempFileName);
    
    // 3. Salvar temporariamente
    await fs.writeFile(tempPath, pdfBuffer);
    
    // 4. Agendar exclusão em 1 hora
    setTimeout(() => {
        fs.unlink(tempPath).catch(console.error);
    }, 3600000); // 1 hora
    
    // 5. Retornar URL de download
    return {
        downloadUrl: `/download/temp/${tempFileName}`,
        expiresAt: new Date(Date.now() + 3600000)
    };
}
```

### 2. 🗄️ **Armazenamento Temporário** (24-48h)
**Conceito:** CV fica disponível por período limitado para re-download

#### Configuração:
```javascript
// Configurar limpeza automática
const RETENTION_HOURS = 24;

// Cron job para limpeza
const cron = require('node-cron');

// Executar limpeza a cada hora
cron.schedule('0 * * * *', async () => {
    const cutoffTime = new Date(Date.now() - (RETENTION_HOURS * 60 * 60 * 1000));
    
    // Buscar CVs antigos
    const oldCVs = await CV.find({
        createdAt: { $lt: cutoffTime },
        status: 'completed'
    });
    
    // Deletar arquivos e registros
    for (const cv of oldCVs) {
        if (cv.pdfPath && fs.existsSync(cv.pdfPath)) {
            await fs.unlink(cv.pdfPath);
        }
        await CV.findByIdAndDelete(cv._id);
    }
    
    console.log(`🧹 Limpeza: ${oldCVs.length} CVs removidos`);
});
```

### 3. ☁️ **Armazenamento em Nuvem** (Permanente/Longo Prazo)
**Conceito:** CVs são salvos em serviços de nuvem para acesso posterior

---

## 🌩️ Opções de Armazenamento em Nuvem

### 1. **AWS S3** (Mais Popular)
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

async function uploadToS3(pdfBuffer, fileName, userId) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `cvs/${userId}/${fileName}`,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ServerSideEncryption: 'AES256',
        Metadata: {
            'user-id': userId,
            'generated-at': new Date().toISOString()
        }
    };
    
    const result = await s3.upload(params).promise();
    
    // Gerar URL assinada (válida por 1 hora)
    const downloadUrl = s3.getSignedUrl('getObject', {
        Bucket: params.Bucket,
        Key: params.Key,
        Expires: 3600 // 1 hora
    });
    
    return {
        s3Url: result.Location,
        downloadUrl: downloadUrl,
        key: params.Key
    };
}
```

**💰 Custo AWS S3:**
- Armazenamento: $0.023/GB/mês
- Transferência: $0.09/GB
- Requests: $0.0004/1000 requests

### 2. **Google Cloud Storage**
```javascript
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILE
});

async function uploadToGCS(pdfBuffer, fileName, userId) {
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
    const file = bucket.file(`cvs/${userId}/${fileName}`);
    
    await file.save(pdfBuffer, {
        metadata: {
            contentType: 'application/pdf',
            metadata: {
                userId: userId,
                generatedAt: new Date().toISOString()
            }
        }
    });
    
    // Gerar URL assinada
    const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 3600000 // 1 hora
    });
    
    return {
        gcsUrl: `gs://${process.env.GCS_BUCKET_NAME}/cvs/${userId}/${fileName}`,
        downloadUrl: downloadUrl
    };
}
```

### 3. **Cloudinary** (Otimizado para Documentos)
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(pdfBuffer, fileName, userId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                public_id: `cvs/${userId}/${fileName}`,
                folder: 'cvgen-cvs',
                tags: ['cv', 'pdf', userId]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({
                    cloudinaryUrl: result.secure_url,
                    publicId: result.public_id
                });
            }
        ).end(pdfBuffer);
    });
}
```

---

## 📊 Estratégias por Tipo de Aplicação

### 🎯 **Para mozdjob.com** (Plataforma de Empregos)

#### Estratégia Híbrida Recomendada:
```javascript
class CVStorageStrategy {
    constructor() {
        this.strategies = {
            'guest': 'temporary',      // Usuários não logados
            'free': 'temporary',       // Plano gratuito
            'premium': 'cloud_7days',  // Plano premium - 7 dias
            'enterprise': 'cloud_30days' // Empresarial - 30 dias
        };
    }
    
    async storeCV(cvData, userType, userId) {
        const strategy = this.strategies[userType];
        
        switch (strategy) {
            case 'temporary':
                return await this.storeTemporary(cvData);
            
            case 'cloud_7days':
                return await this.storeCloud(cvData, userId, 7);
            
            case 'cloud_30days':
                return await this.storeCloud(cvData, userId, 30);
        }
    }
    
    async storeTemporary(cvData) {
        // Armazenar por 2 horas apenas
        const tempPath = await this.generateTempFile(cvData);
        
        // Agendar exclusão
        setTimeout(() => {
            fs.unlink(tempPath).catch(console.error);
        }, 2 * 60 * 60 * 1000); // 2 horas
        
        return {
            type: 'temporary',
            downloadUrl: `/temp/${path.basename(tempPath)}`,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
        };
    }
    
    async storeCloud(cvData, userId, retentionDays) {
        // Upload para S3/GCS
        const cloudResult = await this.uploadToCloud(cvData, userId);
        
        // Agendar exclusão
        const deleteAt = new Date(Date.now() + (retentionDays * 24 * 60 * 60 * 1000));
        await this.scheduleCloudDeletion(cloudResult.key, deleteAt);
        
        return {
            type: 'cloud',
            downloadUrl: cloudResult.downloadUrl,
            expiresAt: deleteAt,
            cloudKey: cloudResult.key
        };
    }
}
```

### 🏢 **Para Empresas** (B2B)

#### Armazenamento Corporativo:
```javascript
class EnterpriseStorage {
    async storeCV(cvData, companyId, candidateId) {
        // Estrutura organizada por empresa
        const folderStructure = `companies/${companyId}/candidates/${candidateId}`;
        
        // Upload com metadados corporativos
        const result = await this.uploadWithMetadata(cvData, {
            companyId,
            candidateId,
            department: cvData.department,
            position: cvData.position,
            recruiter: cvData.recruiterId
        });
        
        // Integrar com sistema de RH
        await this.notifyHRSystem(companyId, result);
        
        return result;
    }
}
```

---

## 🔒 Considerações de Privacidade e Segurança

### 1. **LGPD/GDPR Compliance**
```javascript
class PrivacyCompliantStorage {
    async storeCV(cvData, userConsent) {
        // Verificar consentimento
        if (!userConsent.dataProcessing) {
            return await this.generateTemporaryOnly(cvData);
        }
        
        // Criptografar dados sensíveis
        const encryptedData = await this.encryptPII(cvData);
        
        // Armazenar com controle de retenção
        return await this.storeWithRetention(encryptedData, userConsent.retentionPeriod);
    }
    
    async encryptPII(cvData) {
        const crypto = require('crypto');
        const algorithm = 'aes-256-gcm';
        const key = process.env.ENCRYPTION_KEY;
        
        // Criptografar campos sensíveis
        const sensitiveFields = ['nome', 'email', 'telefone', 'endereco'];
        const encrypted = { ...cvData };
        
        for (const field of sensitiveFields) {
            if (cvData[field]) {
                const cipher = crypto.createCipher(algorithm, key);
                encrypted[field] = cipher.update(cvData[field], 'utf8', 'hex') + cipher.final('hex');
            }
        }
        
        return encrypted;
    }
}
```

### 2. **Controle de Acesso**
```javascript
// Middleware de autorização para download
async function authorizeDownload(req, res, next) {
    const { cvId } = req.params;
    const userId = req.user.id;
    
    // Verificar se usuário pode acessar este CV
    const cv = await CV.findById(cvId);
    
    if (!cv) {
        return res.status(404).json({ error: 'CV não encontrado' });
    }
    
    // Verificar propriedade ou permissão
    if (cv.userId !== userId && !req.user.permissions.includes('access_all_cvs')) {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Verificar se ainda está válido
    if (cv.expiresAt && cv.expiresAt < new Date()) {
        return res.status(410).json({ error: 'CV expirado' });
    }
    
    next();
}
```

---

## 💡 Implementação Recomendada

### Configuração Flexível:
```javascript
// config/storage.js
const storageConfig = {
    // Estratégia por tipo de usuário
    strategies: {
        guest: {
            type: 'temporary',
            retention: '2h',
            location: 'local'
        },
        free: {
            type: 'temporary',
            retention: '24h',
            location: 'local'
        },
        pro: {
            type: 'cloud',
            retention: '7d',
            location: 's3'
        },
        enterprise: {
            type: 'cloud',
            retention: '30d',
            location: 's3',
            encryption: true
        }
    },
    
    // Configurações de limpeza
    cleanup: {
        enabled: true,
        schedule: '0 2 * * *', // Todo dia às 2h
        batchSize: 100
    },
    
    // Limites
    limits: {
        maxFileSize: '10MB',
        maxFilesPerUser: {
            free: 5,
            pro: 50,
            enterprise: 'unlimited'
        }
    }
};
```

### Service de Storage Unificado:
```javascript
class StorageService {
    constructor() {
        this.providers = {
            local: new LocalStorage(),
            s3: new S3Storage(),
            gcs: new GCSStorage(),
            cloudinary: new CloudinaryStorage()
        };
    }
    
    async store(cvData, userType, options = {}) {
        const strategy = storageConfig.strategies[userType];
        const provider = this.providers[strategy.location];
        
        return await provider.store(cvData, {
            ...strategy,
            ...options
        });
    }
    
    async retrieve(cvId, userId) {
        const cv = await CV.findById(cvId);
        
        if (!this.canAccess(cv, userId)) {
            throw new Error('Acesso negado');
        }
        
        const provider = this.providers[cv.storageLocation];
        return await provider.retrieve(cv.storageKey);
    }
}
```

---

## 📋 Recomendações Finais

### 🎯 **Para Começar (MVP):**
1. **Download Direto** - Usuários baixam imediatamente
2. **Armazenamento temporário** - 24h para re-download
3. **Limpeza automática** - Cron job diário

### 🚀 **Para Escalar:**
1. **AWS S3** - Armazenamento em nuvem
2. **Estratégia por plano** - Diferentes retenções
3. **Criptografia** - Dados sensíveis protegidos
4. **Compliance LGPD** - Controle de consentimento

### 💰 **Estimativa de Custos:**
- **Local temporário**: ~$0 (apenas servidor)
- **AWS S3**: ~$0.50/mês para 1000 CVs
- **Cloudinary**: ~$2/mês para 1000 CVs
- **Google Cloud**: ~$0.40/mês para 1000 CVs

### 🔧 **Implementação Sugerida:**
```javascript
// .env
STORAGE_STRATEGY=hybrid
TEMP_RETENTION_HOURS=24
CLOUD_RETENTION_DAYS=7
STORAGE_PROVIDER=s3
ENCRYPTION_ENABLED=true
```

**🎯 Comece simples e evolua conforme a demanda!**