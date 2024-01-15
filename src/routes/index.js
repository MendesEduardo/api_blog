const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const postsRoutes = require('./posts');
const authRoutes = require('./auth');

// Rota inicial
router.use('/', postsRoutes);

// Rota de autenticação
router.use('/auth', authRoutes);

module.exports = router;
