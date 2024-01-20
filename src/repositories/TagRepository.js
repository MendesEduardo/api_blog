const sql = require("mssql");
const config = require("../config");

class TagRepository {
  constructor() {
    this.pool = new sql.ConnectionPool(config);
  }

  async associateTagsToPost(postID, tagNames) {
    try {
      const connection = await this.pool.connect();

      for (const tagName of tagNames) {
        const tagResult = await connection.query`
          SELECT TagID
          FROM Tags
          WHERE NomeTag = ${tagName}
        `;

        if (tagResult.recordset.length > 0) {
          const tagID = tagResult.recordset[0].TagID;

          await connection.query`
            INSERT INTO PostagemTag (PostagemID, TagID)
            VALUES (${postID}, ${tagID})
          `;
        }
      }

      connection.close();
    } catch (error) {
      console.error("Erro ao associar tags ao post:", error.message);
      throw error;
    }
  }
}

module.exports = TagRepository;
