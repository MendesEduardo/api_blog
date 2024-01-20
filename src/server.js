const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
};

const app = express();
const PORT = 3000;

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Servidor API rodando em http://localhost:${PORT}`);
});
