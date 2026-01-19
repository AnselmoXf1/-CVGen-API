const jwt = require('jsonwebtoken');
const MemoryUser = require('../models/MemoryUser');

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        status: 'erro', 
        message: 'Token de acesso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await MemoryUser.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        status: 'erro', 
        message: 'Token inválido ou usuário inativo' 
      });
    }

    req.user = { id: user._id, ...user };
    next();
  } catch (error) {
    return res.status(403).json({ 
      status: 'erro', 
      message: 'Token inválido' 
    });
  }
};

// API Key Authentication middleware
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ 
        status: 'erro', 
        message: 'API Key requerida' 
      });
    }

    // Find user with this API key in memory DB
    const memoryDB = require('../config/memoryDB');
    let userWithApiKey = null;
    
    for (let [id, user] of memoryDB.users) {
      if (user.apiKeys && user.apiKeys.some(key => key.key === apiKey && key.isActive)) {
        userWithApiKey = user;
        break;
      }
    }

    if (!userWithApiKey || !userWithApiKey.isActive) {
      return res.status(401).json({ 
        status: 'erro', 
        message: 'API Key inválida' 
      });
    }

    req.apiKeyUser = userWithApiKey;
    req.apiKey = apiKey;
    next();
  } catch (error) {
    return res.status(500).json({ 
      status: 'erro', 
      message: 'Erro interno do servidor' 
    });
  }
};

// JWT or API Key Authentication middleware (Admin pode usar JWT, outros precisam de API Key)
const authenticateJwtOrApiKey = async (req, res, next) => {
  try {
    // Try JWT first
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await MemoryUser.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = { id: user._id, ...user };
          return next();
        }
      } catch (jwtError) {
        // JWT failed, try API Key
      }
    }

    // Try API Key
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      const memoryDB = require('../config/memoryDB');
      let userWithApiKey = null;
      
      for (let [id, user] of memoryDB.users) {
        if (user.apiKeys && user.apiKeys.some(key => key.key === apiKey && key.isActive)) {
          userWithApiKey = user;
          break;
        }
      }

      if (userWithApiKey && userWithApiKey.isActive) {
        req.apiKeyUser = userWithApiKey;
        req.apiKey = apiKey;
        return next();
      }
    }

    // Neither JWT nor API Key worked
    return res.status(401).json({ 
      status: 'erro', 
      message: 'Token JWT ou API Key requerido' 
    });

  } catch (error) {
    return res.status(500).json({ 
      status: 'erro', 
      message: 'Erro interno do servidor' 
    });
  }
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  const user = req.user || req.apiKeyUser;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      status: 'erro', 
      message: 'Acesso negado. Apenas administradores.' 
    });
  }
  next();
};

// Plan access middleware
const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const user = req.user || req.apiKeyUser;
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userPlanLevel = planHierarchy[user.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({ 
        status: 'erro', 
        message: `Plano ${requiredPlan} ou superior requerido` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateApiKey,
  authenticateJwtOrApiKey,
  requireAdmin,
  requirePlan
};