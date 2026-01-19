const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, plan = 'free' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'erro',
          message: 'Email já cadastrado'
        });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        plan
      });

      await user.save();

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
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'erro',
          message: 'Credenciais inválidas'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
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
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          status: 'erro',
          message: 'Refresh token requerido'
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'erro',
          message: 'Refresh token inválido'
        });
      }

      const newToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
      );

      res.json({
        status: 'sucesso',
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      res.status(403).json({
        status: 'erro',
        message: 'Refresh token inválido'
      });
    }
  }

  // Generate API Key
  async generateApiKey(req, res) {
    try {
      const { name = 'Default API Key' } = req.body;
      const user = await User.findById(req.user.id);

      const apiKey = `cvgen_${uuidv4().replace(/-/g, '')}`;
      
      user.apiKeys.push({
        key: apiKey,
        name,
        isActive: true
      });

      await user.save();

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
  }

  // List API Keys
  async listApiKeys(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
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
  }

  // Revoke API Key
  async revokeApiKey(req, res) {
    try {
      const { keyId } = req.params;
      const user = await User.findById(req.user.id);

      const apiKey = user.apiKeys.id(keyId);
      if (!apiKey) {
        return res.status(404).json({
          status: 'erro',
          message: 'API Key não encontrada'
        });
      }

      apiKey.isActive = false;
      await user.save();

      res.json({
        status: 'sucesso',
        message: 'API Key revogada com sucesso'
      });
    } catch (error) {
      console.error('Revoke API Key error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Helper methods
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
  }
}

module.exports = new AuthController();