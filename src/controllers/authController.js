const jwt = require("jsonwebtoken");
const UsuarioModel = require("../models/UsuarioModel");
const UsuarioRepository = require("../repositories/UsuarioRepository");
require("dotenv").config();

class AuthController {
  static async cadastrar(req, res) {
    const { NomeUsuario, Senha, Email, Role } = req.body;

    try {
      // Verificar se o NOME já está em uso
      const existingUser = await UsuarioRepository.getByUsername(NomeUsuario);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Nome de usuário já está em uso." });
      }

      // Verificar se o E-MAIL já está em uso
      const existingEmail = await UsuarioRepository.getByEmail(Email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso." });
      }

      // Continuar com o cadastro se nome de usuário e email estiverem disponíveis
      const newUser = new UsuarioModel(null, NomeUsuario, Senha, Email, Role);
      const saveResult = await UsuarioRepository.save(newUser);

      if (saveResult) {
        res.json({ message: "Usuário cadastrado com sucesso." });
      } else {
        res.status(500).json({ message: "Falha ao cadastrar usuário." });
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error.message);
      res.status(500).send("Erro interno do servidor");
    }
  }

  static async login(req, res) {
    const { NomeUsuario, Senha } = req.body;

    try {
      const user = await UsuarioRepository.getByUsername(NomeUsuario);

      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado." });
      }

      // Verificar a senha de forma simples (não recomendada para produção)
      const storedPassword = user.Senha;

      if (Senha !== storedPassword) {
        return res.status(401).json({ message: "Senha incorreta." });
      }

      // Se as credenciais estiverem corretas, gerar um token JWT
      const token = jwt.sign(
        {
          userId: user.UsuarioID,
          role: user.Role,
          NomeUsuario: user.NomeUsuario,
          Email: user.Email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login bem-sucedido.",
        token,
        user: {
          userId: user.UsuarioID,
          NomeUsuario: user.NomeUsuario,
          Email: user.Email,
        },
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error.message);
      res.status(500).send("Erro interno do servidor");
    }
  }

  static async refreshToken(req, res) {
    // Obter o token existente
    const refreshToken = req.headers.authorization.split(" ")[1];

    try {
      // Verificar e decodificar o token existente
      const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Gerar um novo token com base nas informações do token existente
      const newToken = jwt.sign(
        { userId: decodedToken.userId, role: decodedToken.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token: newToken });
    } catch (error) {
      console.error("Erro ao renovar token:", error.message);
      res.status(401).json({ message: "Token inválido ou expirado." });
    }
  }
}
module.exports = AuthController;
