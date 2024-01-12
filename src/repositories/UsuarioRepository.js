const sql = require("mssql");
const config = require("../config");

class UsuarioRepository {
  static async getByUsername(username) {
    try {
      await sql.connect(config);

      const result = await sql.query`
        SELECT * FROM Usuarios WHERE NomeUsuario = ${username}
      `;

      return result.recordset[0];
    } catch (error) {
      console.error(
        "Erro ao obter usuário por nome de usuário:",
        error.message
      );
      throw error;
    } finally {
      await sql.close();
    }
  }

  static async getByEmail(email) {
    try {
      await sql.connect(config);

      const result = await sql.query`
        SELECT * FROM Usuarios WHERE Email = ${email}
      `;

      return result.recordset[0];
    } catch (error) {
      console.error("Erro ao obter usuário por email:", error.message);
      throw error;
    } finally {
      await sql.close();
    }
  }

  static async save(usuario) {
    try {
      await sql.connect(config);

      const result = await sql.query`
        INSERT INTO Usuarios (NomeUsuario, Senha, Email, Role) 
        VALUES (${usuario.NomeUsuario}, ${usuario.Senha}, ${usuario.Email}, ${
        usuario.Role || "default"
      })
      `;

      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Erro ao salvar usuário:", error.message);
      throw error;
    } finally {
      await sql.close();
    }
  }
}

module.exports = UsuarioRepository;
