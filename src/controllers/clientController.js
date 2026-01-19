const User = require('../models/User');
const CV = require('../models/CV');
const ApiLog = require('../models/ApiLog');
const { v4: uuidv4 } = require('uuid');

class ClientController {
  // Create new client (Admin only)
  async createClient(req, res) {
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

      // Create client
      const client = new User({
        name,
        email,
        password,
        plan,
        role: 'client'
      });

      await client.save();

      res.status(201).json({
        status: 'sucesso',
        message: 'Cliente criado com sucesso',
        data: {
          client: {
            id: client._id,
            name: client.name,
            email: client.email,
            plan: client.plan,
            isActive: client.isActive,
            createdAt: client.createdAt
          }
        }
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // List all clients (Admin only)
  async listClients(req, res) {
    try {
      const { page = 1, limit = 10, plan, status } = req.query;

      let filter = { role: 'client' };
      
      if (plan) filter.plan = plan;
      if (status === 'active') filter.isActive = true;
      if (status === 'inactive') filter.isActive = false;

      const clients = await User.find(filter)
        .select('-password -apiKeys')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(filter);

      // Get usage stats for each client
      const clientsWithStats = await Promise.all(
        clients.map(async (client) => {
          const cvCount = await CV.countDocuments({ userId: client._id });
          const lastActivity = await ApiLog.findOne({ userId: client._id })
            .sort({ createdAt: -1 })
            .select('createdAt');

          return {
            id: client._id,
            name: client.name,
            email: client.email,
            plan: client.plan,
            isActive: client.isActive,
            monthlyUsage: client.monthlyUsage,
            stats: {
              totalCVs: cvCount,
              lastActivity: lastActivity?.createdAt
            },
            createdAt: client.createdAt
          };
        })
      );

      res.json({
        status: 'sucesso',
        data: {
          clients: clientsWithStats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('List clients error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Get client details (Admin only)
  async getClient(req, res) {
    try {
      const { id } = req.params;

      const client = await User.findOne({ _id: id, role: 'client' })
        .select('-password');

      if (!client) {
        return res.status(404).json({
          status: 'erro',
          message: 'Cliente não encontrado'
        });
      }

      // Get client statistics
      const stats = {
        totalCVs: await CV.countDocuments({ userId: id }),
        completedCVs: await CV.countDocuments({ userId: id, status: 'completed' }),
        failedCVs: await CV.countDocuments({ userId: id, status: 'failed' }),
        apiCalls: await ApiLog.countDocuments({ userId: id }),
        lastActivity: await ApiLog.findOne({ userId: id })
          .sort({ createdAt: -1 })
          .select('createdAt endpoint')
      };

      res.json({
        status: 'sucesso',
        data: {
          client: {
            id: client._id,
            name: client.name,
            email: client.email,
            plan: client.plan,
            isActive: client.isActive,
            monthlyUsage: client.monthlyUsage,
            apiKeys: client.apiKeys.map(key => ({
              id: key._id,
              name: key.name,
              isActive: key.isActive,
              createdAt: key.createdAt
            })),
            createdAt: client.createdAt
          },
          stats
        }
      });
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Update client (Admin only)
  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { name, email, plan, isActive } = req.body;

      const client = await User.findOne({ _id: id, role: 'client' });
      if (!client) {
        return res.status(404).json({
          status: 'erro',
          message: 'Cliente não encontrado'
        });
      }

      // Update fields
      if (name) client.name = name;
      if (email) client.email = email;
      if (plan) client.plan = plan;
      if (typeof isActive === 'boolean') client.isActive = isActive;

      await client.save();

      res.json({
        status: 'sucesso',
        message: 'Cliente atualizado com sucesso',
        data: {
          client: {
            id: client._id,
            name: client.name,
            email: client.email,
            plan: client.plan,
            isActive: client.isActive
          }
        }
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Block/Unblock client (Admin only)
  async toggleClientStatus(req, res) {
    try {
      const { id } = req.params;

      const client = await User.findOne({ _id: id, role: 'client' });
      if (!client) {
        return res.status(404).json({
          status: 'erro',
          message: 'Cliente não encontrado'
        });
      }

      client.isActive = !client.isActive;
      await client.save();

      res.json({
        status: 'sucesso',
        message: `Cliente ${client.isActive ? 'desbloqueado' : 'bloqueado'} com sucesso`,
        data: {
          client: {
            id: client._id,
            name: client.name,
            email: client.email,
            isActive: client.isActive
          }
        }
      });
    } catch (error) {
      console.error('Toggle client status error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Generate API Key for client (Admin only)
  async generateClientApiKey(req, res) {
    try {
      const { id } = req.params;
      const { name = 'Admin Generated Key' } = req.body;

      const client = await User.findOne({ _id: id, role: 'client' });
      if (!client) {
        return res.status(404).json({
          status: 'erro',
          message: 'Cliente não encontrado'
        });
      }

      const apiKey = `cvgen_${uuidv4().replace(/-/g, '')}`;
      
      client.apiKeys.push({
        key: apiKey,
        name,
        isActive: true
      });

      await client.save();

      res.json({
        status: 'sucesso',
        message: 'API Key gerada com sucesso',
        data: {
          apiKey,
          name,
          clientId: client._id
        }
      });
    } catch (error) {
      console.error('Generate client API key error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Get client usage statistics (Admin only)
  async getClientUsage(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const client = await User.findOne({ _id: id, role: 'client' });
      if (!client) {
        return res.status(404).json({
          status: 'erro',
          message: 'Cliente não encontrado'
        });
      }

      let dateFilter = { userId: id };
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Get usage statistics
      const [cvStats, apiStats] = await Promise.all([
        CV.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        ApiLog.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: {
                endpoint: '$endpoint',
                status: { $cond: [{ $lt: ['$statusCode', 400] }, 'success', 'error'] }
              },
              count: { $sum: 1 },
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ])
      ]);

      res.json({
        status: 'sucesso',
        data: {
          client: {
            id: client._id,
            name: client.name,
            email: client.email,
            plan: client.plan
          },
          usage: {
            cvs: cvStats,
            api: apiStats,
            monthlyUsage: client.monthlyUsage
          }
        }
      });
    } catch (error) {
      console.error('Get client usage error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }

  // Delete client (Admin only)
  async deleteClient(req, res) {
    try {
      const { id } = req.params;

      const client = await User.findOne({ _id: id, role: 'client' });
      if (!client) {
        return res.status(404).json({
          status: 'erro',
          message: 'Cliente não encontrado'
        });
      }

      // Soft delete - just deactivate
      client.isActive = false;
      client.email = `deleted_${Date.now()}_${client.email}`;
      await client.save();

      res.json({
        status: 'sucesso',
        message: 'Cliente deletado com sucesso'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new ClientController();