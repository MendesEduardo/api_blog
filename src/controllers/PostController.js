const CurtidaModel = require("../models/CurtidaModel");

class PostController {
  constructor(
    postRepository,
    curtidaRepository,
    postService,
    comentarioRepository,
    tagRepository
  ) {
    this.postRepository = postRepository;
    this.curtidaRepository = curtidaRepository;
    this.postService = postService;
    this.comentarioRepository = comentarioRepository;
    this.tagRepository = tagRepository;
  }

  async getAllPosts(req, res) {
    try {
      const postsWithComments = await this.postRepository.getAllPosts();
      if (req.user) {
        for (const post of postsWithComments) {
          post.liked = await this.curtidaRepository.checkIfPostIsLiked(
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

      const postIsLiked = await this.curtidaRepository.checkIfPostIsLiked(
        PostagemID,
        userID
      );

      if (postIsLiked) {
        await this.curtidaRepository.unlikePost(PostagemID, userID);
        res.json({ message: "Post descurtido com sucesso.", liked: null });
      } else {
        await this.curtidaRepository.likePost(PostagemID, userID);
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

      const { Titulo, Conteudo, Tags } = req.body;

      if (!Titulo || !Conteudo) {
        return res
          .status(400)
          .json({ message: "Título e conteúdo são obrigatórios." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Imagem é obrigatória." });
      }

      const imagemBuffer = req.file.buffer;

      if (!Tags || !Array.isArray(Tags)) {
        return res
          .status(400)
          .json({ message: "Tags é obrigatório e deve ser um array." });
      }

      const predefinedTags = ["Tag1", "Tag2", "Tag3", "Tag4"];
      const validTags = Tags.filter((tag) => predefinedTags.includes(tag));

      if (validTags.length !== Tags.length) {
        return res.status(400).json({
          message: "Alguma(s) tag(s) selecionada(s) não é(são) válida(s).",
        });
      }

      const newPost = await this.postService.createPost({
        Titulo,
        Conteudo,
        UsuarioID: req.user.userId,
        Imagem: imagemBuffer,
        validTags,
      });

      await this.tagRepository.associateTagsToPost(
        newPost.PostagemID,
        validTags
      );

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
      const { Titulo, Conteudo, TagIDs } = req.body;

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

      if (TagIDs && !Array.isArray(TagIDs)) {
        return res.status(400).json({
          message: "'TagIDs' deve ser um array se fornecido.",
        });
      }

      const result = await connection.query(`
        UPDATE Postagens
        SET Titulo = '${Titulo}', Conteudo = '${Conteudo}'
        WHERE PostagemID = ${PostagemID}
      `);

      // Atualize as tags associadas à postagem
      await this.tagRepository.associateTagsToPost(PostagemID, TagIDs);

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

      const newComment = await this.comentarioRepository.createComment({
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
