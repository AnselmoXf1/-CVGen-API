const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validateUserRegistration } = require('../middlewares/validation');

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Criar novo cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               plan:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *                 default: free
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Email já cadastrado
 *       403:
 *         description: Acesso negado
 */
router.post('/', validateUserRegistration, clientController.createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Listar todos os clientes (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *           enum: [free, pro, enterprise]
 *         description: Filtrar por plano
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de clientes com estatísticas
 */
router.get('/', clientController.listClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obter detalhes do cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Detalhes do cliente com estatísticas
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/:id', clientController.getClient);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Atualizar cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               plan:
 *                 type: string
 *                 enum: [free, pro, enterprise]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.put('/:id', clientController.updateClient);

/**
 * @swagger
 * /clients/{id}/toggle-status:
 *   put:
 *     summary: Bloquear/Desbloquear cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Status do cliente alterado
 *       404:
 *         description: Cliente não encontrado
 */
router.put('/:id/toggle-status', clientController.toggleClientStatus);

/**
 * @swagger
 * /clients/{id}/api-key:
 *   post:
 *     summary: Gerar API Key para cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 default: "Admin Generated Key"
 *     responses:
 *       200:
 *         description: API Key gerada com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.post('/:id/api-key', clientController.generateClientApiKey);

/**
 * @swagger
 * /clients/{id}/usage:
 *   get:
 *     summary: Obter estatísticas de uso do cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim
 *     responses:
 *       200:
 *         description: Estatísticas de uso do cliente
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/:id/usage', clientController.getClientUsage);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Deletar cliente (Admin)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente deletado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.delete('/:id', clientController.deleteClient);

module.exports = router;