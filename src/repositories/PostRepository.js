const sql = require("mssql");
const config = require("../config");
const { Buffer } = require("buffer");
const imageType = require("image-type");

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
            cl.UsuarioID AS CurtidaUsuarioID,
            t.TagID,
            t.NomeTag
          FROM Postagens p
          LEFT JOIN Comentarios c ON p.PostagemID = c.PostagemID
          LEFT JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
          LEFT JOIN Usuarios cu ON c.UsuarioID = cu.UsuarioID
          LEFT JOIN Curtidas cl ON p.PostagemID = cl.PostagemID AND cl.UsuarioID = @userId
          LEFT JOIN PostagemTag pt ON p.PostagemID = pt.PostagemID
          LEFT JOIN Tags t ON pt.TagID = t.TagID
        `);

      connection.close();

      const postsWithLikesAndTags = result.recordset.reduce((acc, post) => {
        const existingPost = acc.find((p) => p.PostagemID === post.PostagemID);

        if (!existingPost) {
          const decodedImage = post.ImagemURL
            ? Buffer.from(post.ImagemURL, "base64")
            : null;

          const detectedType = decodedImage ? imageType(decodedImage) : null;
          const imageTypeString = detectedType
            ? detectedType.mime
            : "application/octet-stream";

          const imageDataURL = decodedImage
            ? `data:${imageTypeString};base64,${decodedImage.toString(
                "base64"
              )}`
            : null;

          acc.push({
            PostagemID: post.PostagemID,
            TituloPostagem: post.TituloPostagem,
            ConteudoPostagem: post.ConteudoPostagem,
            DataCriacaoPostagem: post.DataCriacaoPostagem,
            AutorPostagem: post.AutorPostagem,
            ImagemURL: imageDataURL,
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
            Tags: post.TagID
              ? [
                  {
                    TagID: post.TagID,
                    NomeTag: post.NomeTag,
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

          if (post.TagID) {
            existingPost.Tags.push({
              TagID: post.TagID,
              NomeTag: post.NomeTag,
            });
          }
        }

        return acc;
      }, []);

      return postsWithLikesAndTags;
    } catch (error) {
      console.error(
        "Erro ao recuperar postagens, comentários, curtidas e tags:",
        error.message
      );
      throw error;
    }
  }

  async deletePost(postID) {
    try {
      await this.connect();

      const postExists = await this.checkPostExists(postID);

      if (!postExists) {
        throw new Error("Postagem não encontrada.");
      }

      const result = await this.pool.query(`
        DELETE FROM Postagens
        WHERE PostagemID = ${postID}
      `);

      return result.recordset;
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

      return result.recordset[0].postCount > 0;
    } catch (error) {
      console.error("Erro ao verificar existência da postagem:", error.message);
      throw error;
    }
  }
}

module.exports = PostRepository;
