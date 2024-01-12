class UsuarioModel {
  constructor(UsuarioID, NomeUsuario, Senha, Email, Role) {
    this.UsuarioID = UsuarioID;
    this.NomeUsuario = NomeUsuario;
    this.Senha = Senha;
    this.Email = Email;
    this.Role = Role;
  }
}

module.exports = UsuarioModel;
