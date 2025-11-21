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

// Rotas da API

// Salvar agendamento
app.post('/api/agendar', (req, res) => {
    const { nome, endereco, data, tipo_material, peso_estimado } = req.body;
    
    // Cálculo simples de pontos: 10 pontos por kg
    const pontos = Math.round(peso_estimado * 10);

    const sql = `INSERT INTO agendamentos (nome, endereco, data, tipo_material, peso_estimado, pontos) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [nome, endereco, data, tipo_material, peso_estimado, pontos];

    db.run(sql, params, function(err) {
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

// Listar agendamentos
app.get('/api/agendamentos', (req, res) => {
    const sql = 'SELECT * FROM agendamentos ORDER BY id DESC';
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

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
