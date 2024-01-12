class PostagemModel {
  constructor(PostagemID, Titulo, Conteudo, DataCriacao, UsuarioID) {
    this.PostagemID = PostagemID;
    this.Titulo = Titulo;
    this.Conteudo = Conteudo;
    this.DataCriacao = DataCriacao;
    this.UsuarioID = UsuarioID;
  }
}

module.exports = PostagemModel;
