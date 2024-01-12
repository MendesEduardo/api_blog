const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Middleware para analisar o corpo das solicitações
app.use(bodyParser.json());

// Rotas
app.use('/', routes);


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor API rodando em http://localhost:${PORT}`);
});
