const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o Banco de Dados
const db = new sqlite3.Database('./reciclagem.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// --- ROTAS DA API ---

// 1. Salvar agendamento (Público)
app.post('/api/agendar', (req, res) => {
    const { nome, endereco, data, tipo_material, peso_estimado } = req.body;

    // Cálculo simples de pontos: 10 pontos por kg
    const pontos = Math.round(peso_estimado * 10);

    // Status padrão é 'Pendente'
    const sql = `INSERT INTO agendamentos (nome, endereco, data, tipo_material, peso_estimado, pontos, status) VALUES (?, ?, ?, ?, ?, ?, 'Pendente')`;
    const params = [nome, endereco, data, tipo_material, peso_estimado, pontos];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Agendamento realizado com sucesso!',
            data: { id: this.lastID, pontos }
        });
    });
});

// 2. Listar agendamentos (Público - Para o Dashboard do Usuário)
app.get('/api/agendamentos', (req, res) => {
    const sql = `
        SELECT a.*, p.nome_local as ponto_coleta_nome 
        FROM agendamentos a 
        LEFT JOIN coleta_points p ON a.ponto_coleta_id = p.id 
        ORDER BY a.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Sucesso',
            data: rows
        });
    });
});

// 3. Listar Pontos de Coleta (Público)
app.get('/api/pontos', (req, res) => {
    const sql = 'SELECT * FROM coleta_points';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Sucesso',
            data: rows
        });
    });
});

// --- ROTAS ADMIN ---

// 4. Listar agendamentos (Admin - Pode ter filtros específicos no futuro)
app.get('/api/admin/agendamentos', (req, res) => {
    const sql = `
        SELECT a.*, p.nome_local as ponto_coleta_nome 
        FROM agendamentos a 
        LEFT JOIN coleta_points p ON a.ponto_coleta_id = p.id 
        ORDER BY 
            CASE WHEN a.status = 'Pendente' THEN 0 ELSE 1 END, 
            a.data ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Sucesso',
            data: rows
        });
    });
});

// 5. Aprovar agendamento (Admin)
app.post('/api/admin/aprovar', (req, res) => {
    const { id_agendamento, id_ponto_coleta } = req.body;

    if (!id_agendamento || !id_ponto_coleta) {
        res.status(400).json({ error: 'ID do agendamento e ID do ponto de coleta são obrigatórios.' });
        return;
    }

    const sql = `UPDATE agendamentos SET status = 'Aprovado', ponto_coleta_id = ? WHERE id = ?`;
    const params = [id_ponto_coleta, id_agendamento];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Agendamento não encontrado.' });
            return;
        }
        res.json({
            message: 'Agendamento aprovado com sucesso!',
            changes: this.changes
        });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
