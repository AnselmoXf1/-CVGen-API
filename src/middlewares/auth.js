const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        status: 'erro', 
        message: 'Token inválido ou usuário inativo' 
      });
    }

    req.user = user;
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

    const user = await User.findOne({
      'apiKeys.key': apiKey,
      'apiKeys.isActive': true,
      isActive: true
    });

    if (!user) {
      return res.status(401).json({ 
        status: 'erro', 
        message: 'API Key inválida' 
      });
    }

    req.user = user;
    req.apiKey = apiKey;
    next();
  } catch (error) {
    return res.status(500).json({ 
      status: 'erro', 
      message: 'Erro interno do servidor' 
    });
  }
};

// Combined authentication middleware (JWT or API Key)
const authenticateUser = async (req, res, next) => {
  try {
    // Try JWT first
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
          return next();
        }
      } catch (jwtError) {
        // JWT failed, try API Key
      }
    }

    // Try API Key
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      const user = await User.findOne({
        'apiKeys.key': apiKey,
        'apiKeys.isActive': true,
        isActive: true
      });

      if (user) {
        req.user = user;
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

// Plan access middleware
const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    const userPlanLevel = planHierarchy[req.user.plan];
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

// JWT or API Key Authentication middleware
const authenticateJwtOrApiKey = async (req, res, next) => {
  try {
    // Try JWT first
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = { id: user._id, ...user.toObject() };
          return next();
        }
      } catch (jwtError) {
        // JWT failed, try API Key
      }
    }

    // Try API Key
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      const user = await User.findOne({
        'apiKeys.key': apiKey,
        'apiKeys.isActive': true,
        isActive: true
      });

      if (user) {
        req.apiKeyUser = user;
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
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      status: 'erro', 
      message: 'Acesso negado. Apenas administradores.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authenticateApiKey,
  requireAdmin,
  requirePlan,
  authenticateJwtOrApiKey
};