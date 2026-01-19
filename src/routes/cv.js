const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const { authenticateToken, authenticateApiKey } = require('../middlewares/auth');
const { validateCVCreation } = require('../middlewares/validation');
const { cvGenerationLimiter, planBasedLimiter } = require('../middlewares/rateLimiter');

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
 *     CV:
 *       type: object
 *       required:
 *         - templateId
 *         - nome
 *         - email
 *       properties:
 *         templateId:
 *           type: string
 *           description: ID do template
 *         nome:
 *           type: string
 *           description: Nome completo
 *         email:
 *           type: string
 *           format: email
 *           description: Email
 *         telefone:
 *           type: string
 *           description: Telefone
 *         endereco:
 *           type: string
 *           description: Endereço
 *         linkedin:
 *           type: string
 *           description: URL do LinkedIn
 *         github:
 *           type: string
 *           description: URL do GitHub
 *         website:
 *           type: string
 *           description: Website pessoal
 *         resumo:
 *           type: string
 *           description: Resumo profissional
 *         experiencias:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               empresa:
 *                 type: string
 *               cargo:
 *                 type: string
 *               periodo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               localizacao:
 *                 type: string
 *         educacao:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               instituicao:
 *                 type: string
 *               curso:
 *                 type: string
 *               periodo:
 *                 type: string
 *               descricao:
 *                 type: string
 *         habilidades:
 *           type: array
 *           items:
 *             type: string
 *         idiomas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               idioma:
 *                 type: string
 *               nivel:
 *                 type: string
 *                 enum: [básico, intermediário, avançado, fluente, nativo]
 *         certificacoes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               instituicao:
 *                 type: string
 *               data:
 *                 type: string
 *               url:
 *                 type: string
 *         projetos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               tecnologias:
 *                 type: array
 *                 items:
 *                   type: string
 *               url:
 *                 type: string
 */

/**
 * @swagger
 * /cv:
 *   post:
 *     summary: Criar novo CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CV'
 *           example:
 *             templateId: "60d5ecb74b24a1234567890a"
 *             nome: "João Paulo"
 *             email: "joao@email.com"
 *             telefone: "84xxxxxxx"
 *             resumo: "Desenvolvedor web"
 *             experiencias:
 *               - empresa: "ABC Tech"
 *                 cargo: "Frontend Dev"
 *                 periodo: "2022 - 2024"
 *             educacao:
 *               - instituicao: "Universidade X"
 *                 curso: "Informática"
 *             habilidades: ["HTML", "CSS", "JavaScript"]
 *     responses:
 *       201:
 *         description: CV criado com sucesso
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
 *                     id:
 *                       type: string
 *                     pdfUrl:
 *                       type: string
 *                       example: "https://api.bluevisiontech.com/cv/download/joao-paulo.pdf"
 *                     status:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Limite excedido ou template premium sem acesso
 */
router.post('/', authenticate, cvGenerationLimiter, planBasedLimiter, validateCVCreation, cvController.createCV);

/**
 * @swagger
 * /cv:
 *   get:
 *     summary: Listar CVs do usuário
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *     responses:
 *       200:
 *         description: Lista de CVs
 */
router.get('/', authenticate, cvController.listCVs);

/**
 * @swagger
 * /cv/{id}:
 *   get:
 *     summary: Obter detalhes do CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do CV
 *     responses:
 *       200:
 *         description: Detalhes do CV
 *       404:
 *         description: CV não encontrado
 */
router.get('/:id', authenticate, cvController.getCVDetails);

/**
 * @swagger
 * /cv/{id}:
 *   put:
 *     summary: Atualizar CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do CV
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CV'
 *     responses:
 *       200:
 *         description: CV atualizado com sucesso
 *       404:
 *         description: CV não encontrado
 */
router.put('/:id', authenticate, cvGenerationLimiter, validateCVCreation, cvController.updateCV);

/**
 * @swagger
 * /cv/{id}:
 *   delete:
 *     summary: Deletar CV
 *     tags: [CV]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do CV
 *     responses:
 *       200:
 *         description: CV deletado com sucesso
 *       404:
 *         description: CV não encontrado
 */
router.delete('/:id', authenticate, cvController.deleteCV);

/**
 * @swagger
 * /cv/download/{fileName}:
 *   get:
 *     summary: Download do PDF do CV
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo PDF
 *     responses:
 *       200:
 *         description: Arquivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Arquivo não encontrado
 */
router.get('/download/:fileName', cvController.downloadCV);

module.exports = router;