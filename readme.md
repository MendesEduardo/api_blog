# Documentação da API

## API de Blog

Esta é uma API simples para um blog, permitindo a criação, edição, exclusão e visualização de postagens. Além disso, oferece recursos como autenticação de usuários, curtidas em postagens e comentários.

### Rotas Disponíveis

#### Autenticação

1. **Cadastro de Usuário**

   - **Rota:** `POST /auth/cadastrar`
   - **Descrição:** Cadastra um novo usuário.
   - **Corpo da Solicitação:**
     ```json
     {
       "NomeUsuario": "string",
       "Senha": "string",
       "Email": "string",
     }
     ```
   - **Respostas:**
     - **200 OK:** Usuário cadastrado com sucesso.
     - **400 Bad Request:** Dados de entrada inválidos ou usuário já existente.
     - **500 Internal Server Error:** Erro interno no servidor.

2. **Login**

   - **Rota:** `POST /auth/login`
   - **Descrição:** Realiza o login de um usuário.
   - **Corpo da Solicitação:**
     ```json
     {
       "NomeUsuario": "string",
       "Senha": "string"
     }
     ```
   - **Respostas:**
     - **200 OK:** Login bem-sucedido. Retorna um token JWT.
     - **401 Unauthorized:** Usuário não encontrado ou senha incorreta.
     - **500 Internal Server Error:** Erro interno no servidor.

3. **Renovação de Token**

   - **Rota:** `POST /auth/refresh-token`
   - **Descrição:** Renova um token JWT.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Respostas:**
     - **200 OK:** Token renovado com sucesso.
     - **401 Unauthorized:** Token inválido ou expirado.

#### Postagens

4. **Listar Todas as Postagens**

   - **Rota:** `GET /`
   - **Descrição:** Obtém todas as postagens com detalhes como comentários, curtidas e tags.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Respostas:**
     - **200 OK:** Retorna todas as postagens com detalhes.
     - **401 Unauthorized:** Token não fornecido ou inválido.
     - **500 Internal Server Error:** Erro interno no servidor.

5. **Listar Postagens por Usuário Logado**

   - **Rota:** `GET /:username`
   - **Descrição:** Obtém todas as postagens para o usuário logado com detalhes como comentários, curtidas e tags.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Respostas:**
     - **200 OK:** Retorna todas as postagens para usuário logado com detalhes.
     - **401 Unauthorized:** Token não fornecido ou inválido.
     - **500 Internal Server Error:** Erro interno no servidor.

6. **Curtir/Descurtir Postagem**

   - **Rota:** `POST /:PostagemID/curtir`
   - **Descrição:** Curte ou descurte uma postagem.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Respostas:**
     - **200 OK:** Operação bem-sucedida. Retorna mensagem e estado da curtida.
     - **401 Unauthorized:** Usuário não logado.
     - **500 Internal Server Error:** Erro interno no servidor.

7. **Criar Postagem**

   - **Rota:** `POST /create`
   - **Descrição:** Cria uma nova postagem.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Corpo da Solicitação:**
     ```json
     {
       "Titulo": "string",
       "Conteudo": "string",
       "Imagem": "file",
       "Tags": ["string"]
     }
     ```
   - **Respostas:**
     - **200 OK:** Postagem criada com sucesso.
     - **400 Bad Request:** Dados de entrada inválidos.
     - **401 Unauthorized:** Token não fornecido ou inválido.
     - **500 Internal Server Error:** Erro interno no servidor.

8. **Editar Postagem**

   - **Rota:** `PUT /edit/:PostagemID`
   - **Descrição:** Edita uma postagem existente.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Corpo da Solicitação:**
     ```json
     {
       "Titulo": "string",
       "Conteudo": "string",
       "Imagem": "file",
       "Tags": ["string"]
     }
     ```
   - **Respostas:**
     - **200 OK:** Postagem editada com sucesso.
     - **400 Bad Request:** Dados de entrada inválidos ou postagem não encontrada.
     - **401 Unauthorized:** Token não fornecido ou inválido.
     - **500 Internal Server Error:** Erro interno no servidor.

9. **Excluir Postagem**

   - **Rota:** `DELETE /:PostagemID`
   - **Descrição:** Exclui uma postagem.
   - **Cabeçalho da Solicitação:**
     ```
     Authorization: Bearer [token]
     ```
   - **Respostas:**
     - **200 OK:** Postagem excluída com sucesso.
     - **401 Unauthorized:** Token não fornecido ou inválido.
     - **500 Internal Server Error:** Erro interno no servidor.

#### Comentários

10. **Adicionar Comentário**

    - **Rota:** `POST /:PostagemID/comentar`
    - **Descrição:** Adiciona um comentário a uma postagem.
    - **Cabeçalho da Solicitação:**
      ```
      Authorization: Bearer [token]
      ```
    - **Corpo da Solicitação:**
      ```json
      {
        "Conteudo": "string"
      }
      ```
    - **Respostas:**
      - **200 OK:** Comentário adicionado com sucesso.
      - **400 Bad Request:** Dados de entrada inválidos ou postagem não encontrada.
      - **401 Unauthorized:** Token não fornecido ou inválido.
      - **500 Internal Server Error:** Erro interno no servidor.

11. **Listar Comentários de uma Postagem**

    - **Rota:** `GET /:PostagemID/comentarios`
    - **Descrição:** Obtém todos os comentários de uma postagem.
    - **Cabeçalho da Solicitação:**
      ```
      Authorization: Bearer [token]
      ```
    - **Respostas:**
      - **200 OK:** Retorna todos os comentários da postagem.
      - **401 Unauthorized:** Token não fornecido ou inválido.
      - **500 Internal Server Error:** Erro interno no servidor.

12. **Editar Comentário**

    - **Rota:** `PUT /comentario/:ComentarioID`
    - **Descrição:** Edita um comentário existente.
    - **Cabeçalho da Solicitação:**
      ```
      Authorization: Bearer [token]
      ```
    - **Corpo da Solicitação:**
      ```json
      {
        "Conteudo": "string"
      }
      ```
    - **Respostas:**
      - **200 OK:** Comentário editado com sucesso.
      - **400 Bad Request:** Dados de entrada inválidos ou comentário não encontrado.
      - **401 Unauthorized:** Token não fornecido ou inválido.
      - **500 Internal Server Error:** Erro interno no servidor.

13. **Excluir Comentário**

    - **Rota:** `DELETE /comentario/:ComentarioID`
    - **Descrição:** Exclui um comentário.
    - **Cabeçalho da Solicitação:**
      ```
      Authorization: Bearer [token]
      ```
    - **Respostas:**
      - **200 OK:** Comentário excluído com sucesso.
      - **401 Unauthorized:** Token não fornecido ou inválido.
      - **500 Internal Server Error:** Erro interno no servidor.

### Erros Comuns

- **401 Unauthorized:** Acesso não autorizado.
- **404 Not Found:** Recurso não encontrado.
- **500 Internal Server Error:** Erro interno no servidor.
