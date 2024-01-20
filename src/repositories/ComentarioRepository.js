const sql = require("mssql");
const config = require("../config");

class ComentarioRepository {
  constructor() {
    this.pool = new sql.ConnectionPool(config);
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

module.exports = ComentarioRepository;