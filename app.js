const express = require('express');
const cors = require('cors');
const app = express();  
const bodyParser = require('body-parser');
const sequelize = require('./src/utils/db');
const routes = require('./src/routes/routes');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());

app.use('/', routes);

sequelize.sync()
  .then(() => {
    console.log('Modelos sincronizados com o banco de dados');
  })
  .catch((error) => {
    console.error('Erro ao sincronizar modelos com o banco de dados:', error);
  });

const PORT = 4000;

app.listen(PORT, function() {
  console.log('Servidor web iniciado na porta:', PORT);
});