const sql = require("mssql");
const config = require("../config");
const { Buffer } = require("buffer");

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

  async getAllPosts(userId) {
    try {
      const connection = await this.pool.connect();
      const result = await connection.request().input("userId", sql.Int, userId)
        .query(`
        SELECT 
          p.PostagemID,
          p.Titulo AS TituloPostagem,
          p.Conteudo AS ConteudoPostagem,
          p.DataCriacao AS DataCriacaoPostagem,
          u.NomeUsuario AS AutorPostagem,
          p.ImagemURL,
          c.ComentarioID,
          c.Conteudo AS ConteudoComentario,
          c.DataCriacao AS DataCriacaoComentario,
          cu.NomeUsuario AS AutorComentario,
          cl.CurtidaID,
          cl.UsuarioID AS CurtidaUsuarioID
        FROM Postagens p
        LEFT JOIN Comentarios c ON p.PostagemID = c.PostagemID
        LEFT JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
        LEFT JOIN Usuarios cu ON c.UsuarioID = cu.UsuarioID
        LEFT JOIN Curtidas cl ON p.PostagemID = cl.PostagemID AND cl.UsuarioID = @userId
      `);

      connection.close();

      const postsWithLikes = result.recordset.reduce((acc, post) => {
        const existingPost = acc.find((p) => p.PostagemID === post.PostagemID);

        if (!existingPost) {
          const decodedImage = post.ImagemURL
            ? Buffer.from(post.ImagemURL, "base64").toString("base64")
            : null;

          acc.push({
            PostagemID: post.PostagemID,
            TituloPostagem: post.TituloPostagem,
            ConteudoPostagem: post.ConteudoPostagem,
            DataCriacaoPostagem: post.DataCriacaoPostagem,
            AutorPostagem: post.AutorPostagem,
            ImagemURL: decodedImage,
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
            Curtida: post.CurtidaID
              ? {
                  CurtidaID: post.CurtidaID,
                  UsuarioID: post.CurtidaUsuarioID,
                }
              : null,
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

      return postsWithLikes;
    } catch (error) {
      console.error(
        "Erro ao recuperar postagens, comentários e curtidas:",
        error.message
      );
      throw error;
    }
  }

  async checkIfPostIsLiked(postID, userID) {
    try {
      const connection = await this.pool.connect();

      const result = await connection
        .request()
        .input("postID", postID)
        .input("userID", userID).query(`
          SELECT COUNT(*) AS likeCount
          FROM Curtidas
          WHERE PostagemID = @postID AND UsuarioID = @userID
        `);

      connection.close();

      return result.recordset[0].likeCount > 0;
    } catch (error) {
      console.error("Erro ao verificar se o post foi curtido:", error.message);
      throw error;
    }
  }

  async likePost(postID, userID) {
    try {
      const connection = await this.pool.connect();

      await connection.request().input("postID", postID).input("userID", userID)
        .query(`
          INSERT INTO Curtidas (PostagemID, UsuarioID)
          VALUES (@postID, @userID)
        `);

      connection.close();
    } catch (error) {
      console.error("Erro ao curtir o post:", error.message);
      throw error;
    }
  }

  async unlikePost(postID, userID) {
    try {
      const connection = await this.pool.connect();

      await connection.request().input("postID", postID).input("userID", userID)
        .query(`
          DELETE FROM Curtidas
          WHERE PostagemID = @postID AND UsuarioID = @userID
        `);

      connection.close();
    } catch (error) {
      console.error("Erro ao descurtir o post:", error.message);
      throw error;
    }
  }

  async createPost(postData) {
    let connection;
    try {
      connection = await this.pool.connect();

      // Extraia os dados da requisição
      const { Titulo, Conteudo, UsuarioID, Imagem } = postData;

      // Lógica para inserir uma nova postagem no banco de dados
      const result = await connection.query`
      INSERT INTO Postagens (Titulo, Conteudo, UsuarioID, DataCriacao, ImagemURL)
      OUTPUT INSERTED.*
      VALUES (${Titulo}, ${Conteudo}, ${UsuarioID}, GETDATE(), ${Imagem})`;

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

      const result = await this.pool.query(`
        UPDATE Postagens
        SET Titulo = '${Titulo}', Conteudo = '${Conteudo}'
        WHERE PostagemID = ${PostagemID}
      `);

      return result.recordset;
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
