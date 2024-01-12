const express = require('express');
const router = express.Router();
const postsRoutes = require('./posts');
const authRoutes = require('./auth'); // Adicionando a rota de autenticação

// Rota inicial
router.use('/', postsRoutes);

// Rota de autenticação
router.use('/auth', authRoutes);

module.exports = router;
