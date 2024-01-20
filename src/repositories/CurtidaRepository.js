const sql = require("mssql");
const config = require("../config");

class CurtidaRepository {
  constructor() {
    this.pool = new sql.ConnectionPool(config);
  }
  async createCurtida(curtidaData) {
    try {
      await sql.connect(config);

      const result = await sql.query`
        INSERT INTO Curtidas (UsuarioID, PostagemID, DataCurtida)
        OUTPUT INSERTED.*
        VALUES (${curtidaData.UsuarioID}, ${curtidaData.PostagemID}, ${curtidaData.DataCurtida})
      `;

      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao criar curtida:", error.message);
      throw error;
    } finally {
      await sql.close();
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
}

module.exports = CurtidaRepository;
