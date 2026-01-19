const ApiLog = require('../models/ApiLog');

const logApiRequest = async (req, res, next) => {
  const startTime = Date.now();

  // Store original res.json to capture response
  const originalJson = res.json;
  let responseBody = null;

  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Log after response is sent
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      
      const logData = {
        userId: req.user?.id,
        apiKey: req.apiKey,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestBody: req.method !== 'GET' ? req.body : undefined,
        responseBody: res.statusCode >= 400 ? responseBody : undefined
      };

      // Only log errors or important endpoints
      if (res.statusCode >= 400 || req.originalUrl.includes('/cv')) {
        await ApiLog.create(logData);
      }
    } catch (error) {
      console.error('Error logging API request:', error);
    }
  });

  next();
};

module.exports = { logApiRequest };