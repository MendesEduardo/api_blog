use blogDB;

select * from Postagens;
select * from Usuarios;
select * from Comentarios;

-- Tabela para armazenar informações de usuários
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    NomeUsuario VARCHAR(50) NOT NULL,
    Senha VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Role VARCHAR(20) DEFAULT 'default' CHECK (Role IN ('default', 'adm'))
);

-- Tabela para armazenar informações de postagens
CREATE TABLE Postagens (
    PostagemID INT PRIMARY KEY IDENTITY(1,1),
    Titulo VARCHAR(100) NOT NULL,
    Conteudo TEXT NOT NULL,
    DataCriacao DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID)
);

-- Tabela para armazenar informações de comentários
CREATE TABLE Comentarios (
    ComentarioID INT PRIMARY KEY IDENTITY(1,1),
    Conteudo TEXT NOT NULL,
    DataCriacao DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
    PostagemID INT FOREIGN KEY REFERENCES Postagens(PostagemID) ON DELETE CASCADE
);
