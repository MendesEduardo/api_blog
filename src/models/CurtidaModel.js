class CurtidaModel {
  constructor(UsuarioID, PostagemID, DataCurtida) {
    this.UsuarioID = UsuarioID;
    this.PostagemID = PostagemID;
    this.DataCurtida = DataCurtida || new Date();
  }
}
module.exports = CurtidaModel;
