const CurtidaModel = require("../models/CurtidaModel");

class PostController {
  constructor(postRepository, curtidaRepository) {
    this.postRepository = postRepository;
    this.curtidaRepository = curtidaRepository;
  }

  async getAllPosts(req, res) {
    try {
      const postsWithComments = await this.postRepository.getAllPosts();
      if (req.user) {
        for (const post of postsWithComments) {
          post.liked = await this.postRepository.checkIfPostIsLiked(
            post.PostagemID,
            req.user.userId
          );
        }
      }

      res.json(postsWithComments);
    } catch (error) {
      PostController.handleControllerError(
        res,
        error,
        "Erro ao obter postagens."
      );
    }
  }

  async toggleLike(req, res) {
    try {
      const { PostagemID } = req.params;

      if (!req.user) {
        return res.status(401).json({
          message: "Usuário não logado. Faça login para curtir ou descurtir.",
        });
      }

      const userID = req.user.userId;

      const postIsLiked = await this.postRepository.checkIfPostIsLiked(
        PostagemID,
        userID
      );

      if (postIsLiked) {
        await this.postRepository.unlikePost(PostagemID, userID);
        res.json({ message: "Post descurtido com sucesso.", liked: null });
      } else {
        await this.postRepository.likePost(PostagemID, userID);
        res.json({ message: "Post curtido com sucesso.", liked: true });
      }
    } catch (error) {
      console.error("Erro ao curtir/descurtir post:", error.message);
      res.status(500).json({ message: "Erro ao curtir/descurtir post." });
    }
  }

  async createCurtida(req, res) {
    try {
      const { PostagemID } = req.params;
      const { userId } = req.user;

      const existingCurtida = await this.curtidaRepository.checkCurtidaExists(
        userId,
        PostagemID
      );

      if (existingCurtida) {
        return res
          .status(400)
          .json({ message: "Você já curtiu esta postagem." });
      }

      const newCurtida = await this.curtidaRepository.createCurtida(
        new CurtidaModel(userId, PostagemID)
      );

      res.json({
        message: "Curtida adicionada com sucesso.",
        curtida: newCurtida,
      });
    } catch (error) {
      console.error("Erro ao criar curtida:", error.message);
      res.status(500).json({ message: "Erro ao criar curtida." });
    }
  }

  async createPost(req, res) {
    try {
      this.checkAdminPermission(req);

      const { Titulo, Conteudo } = req.body;

      if (!Titulo || !Conteudo) {
        return res
          .status(400)
          .json({ message: "Título e conteúdo são obrigatórios." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Imagem é obrigatória." });
      }

      const imagemBuffer = req.file.buffer;

      const newPost = await this.postRepository.createPost({
        Titulo,
        Conteudo,
        UsuarioID: req.user.userId,
        Imagem: imagemBuffer,
      });

      res.json({
        message: "Post criado com sucesso.",
        post: newPost,
      });
    } catch (error) {
      console.error("Erro ao criar post:", error.message);
      res.status(500).json({ message: "Erro ao criar post." });
    }
  }

  async editPost(req, res) {
    let connection;

    try {
      this.checkAdminPermission(req);

      const { PostagemID } = req.params;
      const { Titulo, Conteudo } = req.body;

      connection = await this.postRepository.connect();

      const postExists = await this.postRepository.checkPostExists(PostagemID);

      if (!postExists) {
        return res.status(404).json({ message: "Postagem não encontrada." });
      }

      if (!Titulo && !Conteudo) {
        return res.status(400).json({
          message:
            "Pelo menos um campo (Título ou Conteúdo) deve ser fornecido para editar o post.",
        });
      }

      const result = await connection.query(`
        UPDATE Postagens
        SET Titulo = '${Titulo}', Conteudo = '${Conteudo}'
        WHERE PostagemID = ${PostagemID}
      `);

      res.json({
        message: "Post editado com sucesso.",
        post: result.recordset,
      });
    } catch (error) {
      console.error("Erro ao editar postagem:", error.message);
      res.status(500).json({ message: "Erro ao editar postagem." });
    } finally {
      if (connection) {
        await this.postRepository.close(connection);
      }
    }
  }

  async deletePost(req, res) {
    let connection;

    try {
      this.checkAdminPermission(req);

      const { PostagemID } = req.params;

      connection = await this.postRepository.connect();

      const postExists = await this.postRepository.checkPostExists(PostagemID);

      if (!postExists) {
        return res.status(404).json({ message: "Postagem não encontrada." });
      }

      const result = await connection.query(`
        DELETE FROM Postagens
        WHERE PostagemID = ${PostagemID}
      `);

      res.json({
        message: `Post excluído com sucesso. pelo User ${req.user.NomeUsuario}`,
      });
    } catch (error) {
      PostController.handleControllerError(res, error, "Erro ao excluir post.");
    } finally {
      if (connection) {
        await this.postRepository.close(connection);
      }
    }
  }

  checkAdminPermission(req) {
    if (!(req.user && req.user.role === "adm")) {
      throw new Error(
        "Acesso negado. Você não tem permissão para realizar esta operação."
      );
    }
  }

  static handleControllerError(res, error, defaultMessage) {
    console.error(error.message);
    res.status(500).send(defaultMessage || "Erro interno do servidor");
  }

  async createComment(req, res) {
    try {
      const { PostagemID } = req.params;
      const { Conteudo } = req.body;

      if (!Conteudo) {
        return res
          .status(400)
          .json({ message: "Conteúdo do comentário é obrigatório." });
      }

      const newComment = await this.postRepository.createComment({
        Conteudo,
        UsuarioID: req.user.userId,
        PostagemID,
      });

      res.json({
        message: "Comentário adicionado com sucesso.",
        comment: newComment,
      });
    } catch (error) {
      console.error("Erro ao criar comentário:", error.message);
      res.status(500).json({ message: "Erro ao criar comentário." });
    }
  }
}

module.exports = PostController;
