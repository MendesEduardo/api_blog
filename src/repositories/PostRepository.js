const sql = require("mssql");
const config = require("../config");

class PostRepository {
  constructor() {
    this.pool = new sql.ConnectionPool(config);
  }

  async connect() {
    try {
      await this.pool.connect();
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error.message);
      throw error;
    }
  }

  async close() {
    try {
      await this.pool.close();
    } catch (error) {
      console.error(
        "Erro ao fechar a conexão com o banco de dados:",
        error.message
      );
      throw error;
    }
  }

  async getAllPosts() {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request().query(`
        SELECT 
          p.PostagemID,
          p.Titulo AS TituloPostagem,
          p.Conteudo AS ConteudoPostagem,
          p.DataCriacao AS DataCriacaoPostagem,
          u.NomeUsuario AS AutorPostagem,
          c.ComentarioID,
          c.Conteudo AS ConteudoComentario,
          c.DataCriacao AS DataCriacaoComentario,
          cu.NomeUsuario AS AutorComentario
        FROM Postagens p
        LEFT JOIN Comentarios c ON p.PostagemID = c.PostagemID
        LEFT JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
        LEFT JOIN Usuarios cu ON c.UsuarioID = cu.UsuarioID
      `);
      connection.close();

      const postsWithComments = result.recordset.reduce((acc, post) => {
        const existingPost = acc.find((p) => p.PostagemID === post.PostagemID);

        if (!existingPost) {
          acc.push({
            PostagemID: post.PostagemID,
            TituloPostagem: post.TituloPostagem,
            ConteudoPostagem: post.ConteudoPostagem,
            DataCriacaoPostagem: post.DataCriacaoPostagem,
            AutorPostagem: post.AutorPostagem,
            Comentarios: post.ComentarioID
              ? [
                  {
                    ComentarioID: post.ComentarioID,
                    ConteudoComentario: post.ConteudoComentario,
                    DataCriacaoComentario: post.DataCriacaoComentario,
                    AutorComentario: post.AutorComentario,
                  },
                ]
              : [],
          });
        } else {
          existingPost.Comentarios.push({
            ComentarioID: post.ComentarioID,
            ConteudoComentario: post.ConteudoComentario,
            DataCriacaoComentario: post.DataCriacaoComentario,
            AutorComentario: post.AutorComentario,
          });
        }

        return acc;
      }, []);

      return postsWithComments;
    } catch (error) {
      console.error(
        "Erro ao recuperar postagens e comentários:",
        error.message
      );
      throw error;
    }
  }

  async createPost(postData) {
    let connection;
    try {
      connection = await this.pool.connect();
      const result = await connection.query`
        INSERT INTO Postagens (Titulo, Conteudo, UsuarioID, DataCriacao)
        OUTPUT INSERTED.*
        VALUES (${postData.Titulo}, ${postData.Conteudo}, ${postData.UsuarioID}, GETDATE())
      `;
      connection.close();

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      } else {
        throw new Error("Nenhum registro retornado após a inserção.");
      }
    } catch (error) {
      console.error("Erro ao criar postagem:", error.message);
      throw error;
    }
  }

  async editPost(postData) {
    try {
      await this.connect();

      const { PostagemID, Titulo, Conteudo } = postData;

      // Lógica para editar um post no banco de dados
      const result = await this.pool.query(`
        UPDATE Postagens
        SET Titulo = '${Titulo}', Conteudo = '${Conteudo}'
        WHERE PostagemID = ${PostagemID}
      `);

      return result.recordset; // Se necessário, retorne os dados do post atualizado
    } catch (error) {
      console.error("Erro ao editar postagem:", error.message);
      throw error;
    } finally {
      await this.close();
    }
  }

  async deletePost(postID) {
    try {
      await this.connect();

      // Verifica se a postagem existe antes de tentar excluir
      const postExists = await this.checkPostExists(postID);

      if (!postExists) {
        throw new Error("Postagem não encontrada.");
      }

      // Lógica para excluir um post do banco de dados
      const result = await this.pool.query(`
        DELETE FROM Postagens
        WHERE PostagemID = ${postID}
      `);

      return result.recordset; // Se necessário, retorne os dados do post excluído
    } catch (error) {
      console.error("Erro ao excluir postagem:", error.message);
      throw error;
    } finally {
      await this.close();
    }
  }

  async checkPostExists(postID) {
    try {
      const connection = await this.pool.connect();

      const result = await connection
        .request()
        .input("postID", sql.Int, postID)
        .query(
          "SELECT COUNT(*) AS postCount FROM Postagens WHERE PostagemID = @postID"
        );

      // Verifica se há pelo menos uma postagem com o ID fornecido
      return result.recordset[0].postCount > 0;
    } catch (error) {
      console.error("Erro ao verificar existência da postagem:", error.message);
      throw error;
    }
  }

  async connect() {
    return await this.pool.connect();
  }

  async close(connection) {
    await connection.close();
  }

  async createComment(commentData) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.query`
      INSERT INTO Comentarios (Conteudo, UsuarioID, PostagemID, DataCriacao)
      OUTPUT INSERTED.*
      VALUES (${commentData.Conteudo}, ${commentData.UsuarioID}, ${commentData.PostagemID}, GETDATE())
    `;
      connection.close();

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      } else {
        throw new Error(
          "Nenhum registro retornado após a inserção do comentário."
        );
      }
    } catch (error) {
      console.error("Erro ao criar comentário:", error.message);
      throw error;
    }
  }
}

module.exports = PostRepository;
