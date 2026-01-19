const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário
 *         plan:
 *           type: string
 *           enum: [free, pro, enterprise]
 *           description: Plano do usuário
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 */
router.post('/register', authLimiter, validateUserRegistration, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authLimiter, validateUserLogin, authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Refresh token inválido
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /auth/api-key:
 *   post:
 *     summary: Gerar nova API Key
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da API Key
 *     responses:
 *       200:
 *         description: API Key gerada com sucesso
 *       401:
 *         description: Token inválido
 */
router.post('/api-key', authenticateToken, authController.generateApiKey);

/**
 * @swagger
 * /auth/api-keys:
 *   get:
 *     summary: Listar API Keys do usuário
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de API Keys
 *       401:
 *         description: Token inválido
 */
router.get('/api-keys', authenticateToken, authController.listApiKeys);

/**
 * @swagger
 * /auth/api-key/{keyId}:
 *   delete:
 *     summary: Revogar API Key
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da API Key
 *     responses:
 *       200:
 *         description: API Key revogada com sucesso
 *       404:
 *         description: API Key não encontrada
 */
router.delete('/api-key/:keyId', authenticateToken, authController.revokeApiKey);

module.exports = router;