use blogDB;

select
    *
from
    Postagens;

select
    *
from
    Usuarios;

select
    *
from
    Comentarios;

-- Tabela para armazenar informações de usuários
CREATE TABLE
    Usuarios (
        UsuarioID INT PRIMARY KEY IDENTITY (1, 1),
        NomeUsuario VARCHAR(50) NOT NULL,
        Senha VARCHAR(50) NOT NULL,
        Email VARCHAR(100) NOT NULL,
        Role VARCHAR(20) DEFAULT 'default' CHECK (Role IN ('default', 'adm'))
    );

-- Tabela para armazenar informações de postagens
CREATE TABLE
    Postagens (
        PostagemID INT PRIMARY KEY IDENTITY (1, 1),
        Titulo VARCHAR(100) NOT NULL,
        Conteudo TEXT NOT NULL,
        DataCriacao DATETIME NOT NULL DEFAULT GETDATE (),
        UsuarioID INT FOREIGN KEY REFERENCES Usuarios (UsuarioID)
    );

-- Tabela para armazenar informações de comentários
CREATE TABLE
    Comentarios (
        ComentarioID INT PRIMARY KEY IDENTITY (1, 1),
        Conteudo TEXT NOT NULL,
        DataCriacao DATETIME NOT NULL DEFAULT GETDATE (),
        UsuarioID INT FOREIGN KEY REFERENCES Usuarios (UsuarioID),
        PostagemID INT FOREIGN KEY REFERENCES Postagens (PostagemID) ON DELETE CASCADE
    );

-- Tabela para armazenar informações de curtidas
CREATE TABLE
    Curtidas (
        CurtidaID INT PRIMARY KEY IDENTITY (1, 1),
        UsuarioID INT FOREIGN KEY REFERENCES Usuarios (UsuarioID),
        PostagemID INT FOREIGN KEY REFERENCES Postagens (PostagemID),
        DataCurtida DATETIME NOT NULL DEFAULT GETDATE (),
        CONSTRAINT UC_Curtida UNIQUE (UsuarioID, PostagemID)
    );

-- Tabela para armazenar informações das tags
CREATE TABLE
    Tags (
        TagID INT PRIMARY KEY IDENTITY (1, 1),
        NomeTag NVARCHAR (50) NOT NULL
    );

-- Tabela para armazenar informações das tags e postagens
CREATE TABLE
    PostagemTag (
        PostagemID INT,
        TagID INT,
        PRIMARY KEY (PostagemID, TagID),
        FOREIGN KEY (PostagemID) REFERENCES Postagens (PostagemID),
        FOREIGN KEY (TagID) REFERENCES Tags (TagID)
    );