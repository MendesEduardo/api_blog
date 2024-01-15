const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const PostController = require('../controllers/PostController');
const PostRepository = require('../repositories/PostRepository');

const postController = new PostController(new PostRepository());

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/', postController.getAllPosts.bind(postController));
router.get('/:username', verifyToken, postController.getAllPosts.bind(postController),postController.toggleLike.bind(postController));
router.post('/create', verifyToken, upload.single('Imagem'), postController.createPost.bind(postController));
router.put('/edit/:PostagemID', verifyToken, postController.editPost.bind(postController));
router.delete('/delete/:PostagemID', verifyToken, postController.deletePost.bind(postController));

router.post('/:PostagemID/comentarios', verifyToken, postController.createComment.bind(postController));

module.exports = router;
