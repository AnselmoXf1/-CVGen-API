const rateLimit = require('express-rate-limit');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    status: 'erro',
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for CV generation
const cvGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 CVs per minute
  message: {
    status: 'erro',
    message: 'Limite de geração de CV excedido. Aguarde 1 minuto.'
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});

// Auth endpoints limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    status: 'erro',
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }
});

// Plan-based rate limiter
const planBasedLimiter = (req, res, next) => {
  const planLimits = {
    free: { windowMs: 60 * 1000, max: 2 }, // 2 per minute
    pro: { windowMs: 60 * 1000, max: 10 }, // 10 per minute
    enterprise: { windowMs: 60 * 1000, max: 50 } // 50 per minute
  };

  const userPlan = req.user?.plan || 'free';
  const limits = planLimits[userPlan];

  const limiter = rateLimit({
    windowMs: limits.windowMs,
    max: limits.max,
    message: {
      status: 'erro',
      message: `Limite do plano ${userPlan} excedido. Upgrade seu plano para mais requisições.`
    },
    keyGenerator: (req) => req.user?.id || req.ip
  });

  return limiter(req, res, next);
};

module.exports = {
  generalLimiter,
  cvGenerationLimiter,
  authLimiter,
  planBasedLimiter
};