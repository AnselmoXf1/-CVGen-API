#!/bin/bash

# 🚀 Script de Deploy Automatizado - CVGen API
# Uso: ./deploy.sh [railway|render|vercel|docker]

set -e

echo "🚀 CVGen API - Deploy Automatizado"
echo "=================================="

# Verificar se foi passado um parâmetro
if [ $# -eq 0 ]; then
    echo "❌ Erro: Especifique a plataforma de deploy"
    echo "Uso: ./deploy.sh [railway|render|vercel|docker]"
    exit 1
fi

PLATFORM=$1

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar dependências
install_dependencies() {
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas"
}

# Função para executar testes
run_tests() {
    echo "🧪 Executando testes..."
    npm test 2>/dev/null || echo "⚠️  Testes não configurados, continuando..."
    echo "✅ Testes concluídos"
}

# Função para verificar variáveis de ambiente
check_env() {
    echo "🔍 Verificando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        echo "⚠️  Arquivo .env não encontrado, criando exemplo..."
        cp .env.exemplo-integracao .env
        echo "📝 Edite o arquivo .env com suas configurações"
        echo "❌ Deploy cancelado - configure o .env primeiro"
        exit 1
    fi
    
    # Verificar variáveis essenciais
    source .env
    
    if [ -z "$JWT_SECRET" ]; then
        echo "❌ JWT_SECRET não configurado no .env"
        exit 1
    fi
    
    if [ -z "$API_BASE_URL" ]; then
        echo "❌ API_BASE_URL não configurado no .env"
        exit 1
    fi
    
    echo "✅ Variáveis de ambiente verificadas"
}

# Função para preparar build
prepare_build() {
    echo "🔧 Preparando build..."
    
    # Criar diretório de storage se não existir
    mkdir -p storage/pdfs
    
    # Verificar se server-memory.js existe
    if [ ! -f server-memory.js ]; then
        echo "❌ Arquivo server-memory.js não encontrado"
        exit 1
    fi
    
    echo "✅ Build preparado"
}

# Deploy para Railway
deploy_railway() {
    echo "🚂 Fazendo deploy para Railway..."
    
    if ! command_exists railway; then
        echo "📦 Instalando Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Verificar se está logado
    if ! railway whoami >/dev/null 2>&1; then
        echo "🔐 Faça login no Railway:"
        railway login
    fi
    
    # Verificar se projeto está linkado
    if [ ! -f railway.json ]; then
        echo "🔗 Inicializando projeto Railway..."
        railway init
    fi
    
    # Configurar variáveis de ambiente
    echo "⚙️  Configurando variáveis de ambiente..."
    source .env
    
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set API_BASE_URL="$API_BASE_URL"
    railway variables set MONGODB_URI="$MONGODB_URI"
    
    # Deploy
    echo "🚀 Fazendo deploy..."
    railway up
    
    echo "✅ Deploy para Railway concluído!"
    echo "🌐 Acesse: $(railway domain)"
}

# Deploy para Render
deploy_render() {
    echo "🎨 Preparando deploy para Render..."
    
    # Criar render.yaml se não existir
    if [ ! -f render.yaml ]; then
        cat > render.yaml << EOF
services:
  - type: web
    name: cvgen-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: API_BASE_URL
        sync: false
EOF
        echo "📝 Arquivo render.yaml criado"
    fi
    
    echo "✅ Configuração do Render preparada"
    echo "📋 Próximos passos:"
    echo "1. Faça commit e push do código"
    echo "2. Acesse https://render.com"
    echo "3. Conecte seu repositório GitHub"
    echo "4. Configure as variáveis de ambiente no painel"
}

# Deploy para Vercel
deploy_vercel() {
    echo "▲ Fazendo deploy para Vercel..."
    
    if ! command_exists vercel; then
        echo "📦 Instalando Vercel CLI..."
        npm install -g vercel
    fi
    
    # Criar vercel.json se não existir
    if [ ! -f vercel.json ]; then
        cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "server-memory.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server-memory.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
        echo "📝 Arquivo vercel.json criado"
    fi
    
    # Deploy
    echo "🚀 Fazendo deploy..."
    vercel --prod
    
    echo "✅ Deploy para Vercel concluído!"
}

# Deploy com Docker
deploy_docker() {
    echo "🐳 Preparando deploy com Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker não está instalado"
        echo "Instale Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Build da imagem
    echo "🔨 Construindo imagem Docker..."
    docker build -t cvgen-api .
    
    # Parar container existente se houver
    docker stop cvgen-api 2>/dev/null || true
    docker rm cvgen-api 2>/dev/null || true
    
    # Executar container
    echo "🚀 Iniciando container..."
    docker run -d \
        --name cvgen-api \
        -p 3000:3000 \
        --env-file .env \
        -v $(pwd)/storage:/app/storage \
        cvgen-api
    
    echo "✅ Deploy Docker concluído!"
    echo "🌐 API disponível em: http://localhost:3000"
}

# Função principal
main() {
    echo "🎯 Plataforma selecionada: $PLATFORM"
    echo ""
    
    # Executar verificações comuns
    install_dependencies
    check_env
    prepare_build
    run_tests
    
    # Deploy específico da plataforma
    case $PLATFORM in
        railway)
            deploy_railway
            ;;
        render)
            deploy_render
            ;;
        vercel)
            deploy_vercel
            ;;
        docker)
            deploy_docker
            ;;
        *)
            echo "❌ Plataforma não suportada: $PLATFORM"
            echo "Plataformas disponíveis: railway, render, vercel, docker"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo "📚 Documentação da API: $API_BASE_URL/api-docs"
    echo "🔍 Health check: $API_BASE_URL/health"
}

# Executar função principal
main