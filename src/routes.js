const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Conectando ao banco com as mesmas variáveis do .env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ==========================================
// ROTAS DE MATERIAIS
// ==========================================

// 1. Cadastrar um novo material
router.post('/materiais', async (req, res) => {
    const { nome, categoria, unidade_medida, quantidade_atual, estoque_minimo, local_armazenamento } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO materiais (nome, categoria, unidade_medida, quantidade_atual, estoque_minimo, local_armazenamento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nome, categoria, unidade_medida, quantidade_atual || 0, estoque_minimo || 0, local_armazenamento]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// 2. Listar todos os materiais
router.get('/materiais', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM materiais ORDER BY nome ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// ==========================================
// ROTAS DE MOVIMENTAÇÃO
// ==========================================

// 3. Registrar entrada/saída e atualizar estoque automaticamente
router.post('/movimentacoes', async (req, res) => {
    const { material_id, tipo, quantidade, responsavel, motivo_finalidade } = req.body;
    
    // Iniciamos uma transação (BEGIN) para garantir a integridade dos dados
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insere a movimentação
        const movResult = await client.query(
            'INSERT INTO movimentacoes (material_id, tipo, quantidade, responsavel, motivo_finalidade) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [material_id, tipo.toUpperCase(), quantidade, responsavel, motivo_finalidade]
        );

        // Atualiza o estoque na tabela de materiais
        const operador = tipo.toUpperCase() === 'ENTRADA' ? '+' : '-';
        const matResult = await client.query(
            `UPDATE materiais SET quantidade_atual = quantidade_atual ${operador} $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [quantidade, material_id]
        );

        await client.query('COMMIT');
        res.status(201).json({
            movimentacao: movResult.rows[0],
            estoque_atualizado: matResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;