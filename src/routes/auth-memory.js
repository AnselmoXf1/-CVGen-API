const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const MemoryUser = require('../models/MemoryUser');
const { authenticateToken } = require('../middlewares/auth-memory');
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rateLimiter');

// Register new user
router.post('/register', authLimiter, validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, plan = 'free' } = req.body;

    // Check if user already exists
    const existingUser = await MemoryUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'erro',
        message: 'Email já cadastrado'
      });
    }

    // Create user
    const user = await MemoryUser.create({
      name,
      email,
      password,
      plan,
      role: 'client',
      isActive: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    res.status(201).json({
      status: 'sucesso',
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Login user
router.post('/login', authLimiter, validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await MemoryUser.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'erro',
        message: 'Credenciais inválidas'
      });
    }

    // Check password
    const isPasswordValid = await MemoryUser.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'erro',
        message: 'Credenciais inválidas'
      });
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    res.json({
      status: 'sucesso',
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// Generate API Key
router.post('/api-key', authenticateToken, async (req, res) => {
  try {
    const { name = 'Default API Key' } = req.body;
    const user = await MemoryUser.findById(req.user.id);

    const apiKey = `cvgen_${uuidv4().replace(/-/g, '')}`;
    
    user.apiKeys.push({
      _id: uuidv4(),
      key: apiKey,
      name,
      isActive: true,
      createdAt: new Date()
    });

    await MemoryUser.updateUser(user._id, user);

    res.json({
      status: 'sucesso',
      message: 'API Key gerada com sucesso',
      data: {
        apiKey,
        name
      }
    });
  } catch (error) {
    console.error('API Key generation error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

// List API Keys
router.get('/api-keys', authenticateToken, async (req, res) => {
  try {
    const user = await MemoryUser.findById(req.user.id);
    
    const apiKeys = user.apiKeys.map(key => ({
      id: key._id,
      name: key.name,
      isActive: key.isActive,
      createdAt: key.createdAt,
      key: key.isActive ? `${key.key.substring(0, 12)}...` : 'Inativa'
    }));

    res.json({
      status: 'sucesso',
      data: { apiKeys }
    });
  } catch (error) {
    console.error('List API Keys error:', error);
    res.status(500).json({
      status: 'erro',
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;