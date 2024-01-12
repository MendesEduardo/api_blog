class ComentarioModel {
  constructor(ComentarioID, Conteudo, DataCriacao, UsuarioID, PostagemID) {
    this.ComentarioID = ComentarioID;
    this.Conteudo = Conteudo;
    this.DataCriacao = DataCriacao;
    this.UsuarioID = UsuarioID;
    this.PostagemID = PostagemID;
  }
}

module.exports = ComentarioModel;
