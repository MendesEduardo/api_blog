class PostagemModel {
  constructor(PostagemID, Titulo, Conteudo, DataCriacao, ImagemURL, UsuarioID) {
    this.PostagemID = PostagemID;
    this.Titulo = Titulo;
    this.Conteudo = Conteudo;
    this.DataCriacao = DataCriacao;
    this.ImagemURL = ImagemURL;
    this.UsuarioID = UsuarioID;
  }
}

module.exports = PostagemModel;
