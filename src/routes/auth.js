const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController.js");

router.post("/cadastrar", AuthController.cadastrar);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);

module.exports = router;
