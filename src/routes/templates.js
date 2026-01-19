const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateToken, authenticateApiKey, requireAdmin } = require('../middlewares/auth');
const { validateTemplateCreation } = require('../middlewares/validation');

// Middleware to handle both JWT and API Key authentication
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    return authenticateApiKey(req, res, next);
  } else if (authHeader) {
    return authenticateToken(req, res, next);
  } else {
    return res.status(401).json({
      status: 'erro',
      message: 'Token JWT ou API Key requerido'
    });
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - htmlContent
 *         - cssStyles
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do template
 *         description:
 *           type: string
 *           description: Descrição do template
 *         htmlContent:
 *           type: string
 *           description: Conteúdo HTML do template
 *         cssStyles:
 *           type: string
 *           description: Estilos CSS do template
 *         isPremium:
 *           type: boolean
 *           description: Se o template é premium
 *         category:
 *           type: string
 *           enum: [professional, creative, modern, classic]
 *           description: Categoria do template
 */

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Listar templates disponíveis
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [professional, creative, modern, classic]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: premium
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar templates premium
 *     responses:
 *       200:
 *         description: Lista de templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     templates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           category:
 *                             type: string
 *                           isPremium:
 *                             type: boolean
 *                           available:
 *                             type: boolean
 */
router.get('/', authenticate, templateController.listTemplates);

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Obter detalhes do template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do template
 *     responses:
 *       200:
 *         description: Detalhes do template
 *       403:
 *         description: Template premium sem acesso
 *       404:
 *         description: Template não encontrado
 */
router.get('/:id', authenticate, templateController.getTemplate);

/**
 * @swagger
 * /templates/{id}/preview:
 *   get:
 *     summary: Visualizar template (HTML)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do template
 *     responses:
 *       200:
 *         description: HTML do template com dados de exemplo
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       404:
 *         description: Template não encontrado
 */
router.get('/:id/preview', authenticate, templateController.previewTemplate);

/**
 * @swagger
 * /templates/categories:
 *   get:
 *     summary: Listar categorias de templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categories', authenticate, templateController.getCategories);

// Admin only routes
/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Criar novo template (Admin)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       201:
 *         description: Template criado com sucesso
 *       403:
 *         description: Acesso negado
 */
router.post('/', authenticateToken, requireAdmin, validateTemplateCreation, templateController.createTemplate);

/**
 * @swagger
 * /templates/{id}:
 *   put:
 *     summary: Atualizar template (Admin)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       200:
 *         description: Template atualizado com sucesso
 *       404:
 *         description: Template não encontrado
 */
router.put('/:id', authenticateToken, requireAdmin, validateTemplateCreation, templateController.updateTemplate);

/**
 * @swagger
 * /templates/{id}:
 *   delete:
 *     summary: Deletar template (Admin)
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do template
 *     responses:
 *       200:
 *         description: Template deletado com sucesso
 *       404:
 *         description: Template não encontrado
 */
router.delete('/:id', authenticateToken, requireAdmin, templateController.deleteTemplate);

module.exports = router;