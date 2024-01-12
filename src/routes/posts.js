const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const PostController = require('../controllers/PostController');
const PostRepository = require('../repositories/PostRepository');

const postController = new PostController(new PostRepository());

router.get('/', postController.getAllPosts.bind(postController));
router.post('/create', verifyToken, postController.createPost.bind(postController));
router.put('/edit/:PostagemID', verifyToken, postController.editPost.bind(postController));
router.delete('/delete/:PostagemID', verifyToken, postController.deletePost.bind(postController));

router.post('/:PostagemID/comentarios', verifyToken, postController.createComment.bind(postController));


/* function checkAdminPermission(req, res, next) {
  // Verificar se o usuário é um administrador
  if (req.user && req.user.Role === "adm") {
    next(); // Permitir acesso se for um administrador
  } else {
    res.status(403).json({ message: "Acesso negado. Permissão insuficiente." });
  } */

module.exports = router;
