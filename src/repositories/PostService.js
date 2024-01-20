const sql = require("mssql");
const config = require("../config");
const sharp = require("sharp");

class PostService {
  constructor() {
    this.pool = new sql.ConnectionPool(config);
  }

  async createPost(postData) {
    try {
      let connection = await this.pool.connect();

      const { Titulo, Conteudo, UsuarioID, Imagem, Tags } = postData;

      const processedImage = await sharp(Imagem)
        .resize({ width: 800, height: 600, fit: "inside" })
        .toBuffer();

      const result = await connection.query`
          INSERT INTO Postagens (Titulo, Conteudo, UsuarioID, DataCriacao, ImagemURL)
          OUTPUT INSERTED.PostagemID
          VALUES (${Titulo}, ${Conteudo}, ${UsuarioID}, GETDATE(), ${processedImage})
        `;

      const postagemID = result.recordset[0].PostagemID;

      if (Tags && Tags.length > 0) {
        await Promise.all(
          Tags.map(async (tag) => {
            await connection.query`
                  INSERT INTO Tags (Tag, PostagemID)
                  VALUES (${tag}, ${postagemID})
                `;
          })
        );
      }

      connection.close();

      return { PostagemID: postagemID };
    } catch (error) {
      console.error("Erro ao criar postagem:", error.message);
      throw error;
    }
  }

  async editPost(postData) {
    try {
      await this.connect();

      const { PostagemID, Titulo, Conteudo, Tags } = postData;

      let updateQuery = `UPDATE Postagens SET Titulo = '${Titulo}', Conteudo = '${Conteudo}'`;

      if (Tags && Tags.length > 0) {
        await this.pool.query`
              DELETE FROM Tags
              WHERE PostagemID = ${PostagemID}
            `;

        await Promise.all(
          Tags.map(async (tag) => {
            await this.pool.query`
                  INSERT INTO Tags (Tag, PostagemID)
                  VALUES (${tag}, ${PostagemID})
                `;
          })
        );
      }

      updateQuery += ` WHERE PostagemID = ${PostagemID}`;

      const result = await this.pool.query(updateQuery);

      return result.recordset;
    } catch (error) {
      console.error("Erro ao editar postagem:", error.message);
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = PostService;
