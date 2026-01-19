# 🐳 Dockerfile para CVGen API
FROM node:18-alpine

# Instalar dependências do sistema para Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretório de storage com permissões corretas
RUN mkdir -p storage/pdfs && \
    chmod 755 storage && \
    chmod 755 storage/pdfs

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cvgenapi -u 1001 -G nodejs

# Dar permissões ao usuário
RUN chown -R cvgenapi:nodejs /app

# Mudar para usuário não-root
USER cvgenapi

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicialização
CMD ["node", "server-memory.js"]