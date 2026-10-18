require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const rotas = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// <-- Ligamos as rotas na API (todas começarão com /api)
app.use('/api', rotas);

// Configuração da conexão com o banco de dados (usando os dados do .env)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Rota de teste
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS data_atual');
        res.json({ 
            mensagem: 'API Escola rodando!', 
            banco_conectado: result.rows[0].data_atual 
        });
    } catch (error) {
        res.status(500).json({ erro: 'Falha ao conectar no banco', detalhes: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});