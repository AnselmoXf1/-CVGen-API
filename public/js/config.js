// Configuração da API CVGen
const API_CONFIG = {
    // Produção (Render)
    production: {
        apiUrl: 'https://bluevisiontech-cvgen-api.onrender.com',
        environment: 'production'
    },
    
    // Desenvolvimento Local
    development: {
        apiUrl: 'http://localhost:3001',
        environment: 'development'
    }
};

// Detectar ambiente automaticamente
function getEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    
    return 'production';
}

// Configuração ativa
const CURRENT_ENV = getEnvironment();
const CONFIG = API_CONFIG[CURRENT_ENV];

console.log(`🔧 Ambiente detectado: ${CONFIG.environment}`);
console.log(`🌐 API URL: ${CONFIG.apiUrl}`);