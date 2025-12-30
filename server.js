const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3000;

// --- CONFIGURAÇÕES E MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());

// Configuração da Sessão
app.use(session({
    secret: 'reciclagem_secreta_chave_123', // Em produção, use variável de ambiente
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Em produção com HTTPS, use true
}));

// Conexão com o Banco de Dados
const db = new sqlite3.Database('./reciclagem.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// --- MIDDLEWARES DE PROTEÇÃO ---

// Verifica se usuário está logado (Genérico)
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Não autorizado. Por favor, faça login.' });
};

// Middleware para proteger rota /cooperativa (Apenas Gestor)
const protectCooperativa = (req, res, next) => {
    // Se não estiver logado ou não for gestor
    if (!req.session.userId || req.session.userType !== 'gestor') {
        // Redireciona para o login do cidadão/padrão
        return res.redirect('/cliente/login.html');
    }
    next();
};

// Middleware API para verificar se é Admin (Retorna JSON error)
const isAdminAPI = (req, res, next) => {
    if (req.session.userId && req.session.userType === 'gestor') {
        return next();
    }
    res.status(403).json({ error: 'Acesso negado. Apenas gestores.' });
};

// --- ROTAS ESTÁTICAS (AMBIENTES) ---

// Servir assets compartilhados (CSS, JS, Imagens) na raiz da pasta public
// Permite acesso a /style.css, /app.js, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Ambiente Cidadão (/cliente)
app.use('/cliente', express.static(path.join(__dirname, 'public/cidadao')));

// Ambiente Gestor (/cooperativa) - Protegido
app.use('/cooperativa', protectCooperativa, express.static(path.join(__dirname, 'public/gestor')));

// Redirecionamento da raiz -> Cliente
app.get('/', (req, res) => {
    res.redirect('/cliente/index.html');
});

// --- ROTAS DE AUTENTICAÇÃO (API) ---

// Registro de Usuário (Cidadão)
app.post('/api/register', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verificar se email já existe
    db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: 'Email já cadastrado.' });

        const sql = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)';
        // Em produção, a senha deve ser hasheada (bcrypt)
        db.run(sql, [nome, email, senha, 'cidadao'], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Cadastro realizado com sucesso!' });
        });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}, Senha fornecida: ${senha}`);

    db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('[LOGIN ERROR] DB Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            console.log('[LOGIN FAILED] Usuário não encontrado no banco.');
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        console.log(`[LOGIN USER FOUND] ID: ${user.id}, Nome: ${user.nome}, Senha Banco: ${user.senha}, Tipo: ${user.tipo}`);

        if (user.senha !== senha) {
            console.log(`[LOGIN FAILED] Senha incorreta. Esperado: ${user.senha}, Recebido: ${senha}`);
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }

        // Criar sessão
        req.session.userId = user.id;
        req.session.userName = user.nome;
        req.session.userType = user.tipo;

        console.log('[LOGIN SUCCESS] Sessão criada.');

        // Definir rota de redirecionamento baseada no tipo
        const redirectUrl = user.tipo === 'gestor'
            ? '/cooperativa/admin.html'
            : '/cliente/dashboard.html';

        res.json({
            message: 'Login realizado com sucesso!',
            user: { id: user.id, nome: user.nome, type: user.tipo },
            redirectUrl: redirectUrl
        });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Erro ao sair.' });
        res.json({ message: 'Logout realizado.' });
    });
});

// Verificar Sessão
app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, user: { id: req.session.userId, nome: req.session.userName, type: req.session.userType } });
    } else {
        res.json({ loggedIn: false });
    }
});

// --- ROTAS DE FUNCIOANLIDADE (API) ---

// Salvar agendamento (Apenas Logado)
app.post('/api/agendar', isAuthenticated, (req, res) => {
    const { nome, endereco, data, tipo_material, peso_estimado } = req.body;
    const usuario_id = req.session.userId;

    // Cálculo simples de pontos: 10 pontos por kg
    const pontos = Math.round(peso_estimado * 10);

    const sql = `INSERT INTO agendamentos (usuario_id, nome, endereco, data, tipo_material, peso_estimado, pontos, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendente')`;
    const params = [usuario_id, nome, endereco, data, tipo_material, peso_estimado, pontos];

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

// Listar agendamentos (Apenas do Usuário Logado)
app.get('/api/agendamentos', isAuthenticated, (req, res) => {
    const usuario_id = req.session.userId;
    const sql = `
        SELECT a.*, p.nome_local as ponto_coleta_nome 
        FROM agendamentos a 
        LEFT JOIN coleta_points p ON a.ponto_coleta_id = p.id 
        WHERE a.usuario_id = ?
        ORDER BY a.id DESC
    `;
    db.all(sql, [usuario_id], (err, rows) => {
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

// Listar Pontos de Coleta (Público)
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

// --- ROTAS ADMIN (PROTEGIDAS PELA API) ---

// Listar todos agendamentos (Admin)
app.get('/api/admin/agendamentos', isAdminAPI, (req, res) => {
    const sql = `
        SELECT a.*, p.nome_local as ponto_coleta_nome, u.email as usuario_email 
        FROM agendamentos a 
        LEFT JOIN coleta_points p ON a.ponto_coleta_id = p.id 
        LEFT JOIN usuarios u ON a.usuario_id = u.id
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

// Aprovar agendamento (Admin)
app.post('/api/admin/aprovar', isAdminAPI, (req, res) => {
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
