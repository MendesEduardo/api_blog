class PostController {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  // Obtém todas as postagens
  async getAllPosts(req, res) {
    try {
      const postsWithComments = await this.postRepository.getAllPosts();
      res.json(postsWithComments);
    } catch (error) {
      PostController.handleControllerError(
        res,
        error,
        "Erro ao obter postagens."
      );
    }
  }

  // Cria uma nova postagem
  async createPost(req, res) {
    try {
      this.checkAdminPermission(req);

      const { Titulo, Conteudo } = req.body;

      // Verifica se Título e Conteúdo foram fornecidos
      if (!Titulo || !Conteudo) {
        return res
          .status(400)
          .json({ message: "Título e conteúdo são obrigatórios." });
      }

      // Chama o método createPost do postRepository para criar um novo post
      const newPost = await this.postRepository.createPost({
        Titulo,
        Conteudo,
        UsuarioID: req.user.userId, // Adiciona a associação ao usuário logado
      });

      res.json({ message: "Post criado com sucesso.", post: newPost });
    } catch (error) {
      console.error("Erro ao criar post:", error.message);
      res.status(500).json({ message: "Erro ao criar post." });
    }
  }

  // Edita uma postagem existente
  async editPost(req, res) {
    let connection;

    try {
      this.checkAdminPermission(req);

      // Obtém o PostagemID a partir dos parâmetros da rota
      const { PostagemID } = req.params;
      const { Titulo, Conteudo } = req.body;

      // Conecta ao banco
      connection = await this.postRepository.connect();

      // Verifica se a postagem existe antes de tentar editar
      const postExists = await this.postRepository.checkPostExists(PostagemID);

      if (!postExists) {
        return res.status(404).json({ message: "Postagem não encontrada." });
      }

      // Verifica se pelo menos um campo (Título ou Conteúdo) foi fornecido para editar o post
      if (!Titulo && !Conteudo) {
        return res.status(400).json({
          message:
            "Pelo menos um campo (Título ou Conteúdo) deve ser fornecido para editar o post.",
        });
      }

      // Lógica para editar um post no banco de dados
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
      // Fecha a conexão após o uso
      if (connection) {
        await this.postRepository.close(connection);
      }
    }
  }

  // Exclui uma postagem
  async deletePost(req, res) {
    let connection;

    try {
      this.checkAdminPermission(req);

      const { PostagemID } = req.params;

      // Conecta ao banco
      connection = await this.postRepository.connect();

      // Verifica se a postagem existe antes de tentar excluir
      const postExists = await this.postRepository.checkPostExists(PostagemID);

      if (!postExists) {
        return res.status(404).json({ message: "Postagem não encontrada." });
      }

      // Lógica para excluir um post do banco de dados
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
      // Fecha a conexão após o uso
      if (connection) {
        await this.postRepository.close(connection);
      }
    }
  }

  // Verifica permissão de administrador
  checkAdminPermission(req) {
    if (!(req.user && req.user.role === "adm")) {
      throw new Error(
        "Acesso negado. Você não tem permissão para realizar esta operação."
      );
    }
  }

  // Lida com erros no controlador
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
