const sql = require("mssql");
const config = require("../config");

class CurtidaRepository {
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

  // Adicione outras operações conforme necessário (listar curtidas, remover curtida, etc.)
}

module.exports = CurtidaRepository;
