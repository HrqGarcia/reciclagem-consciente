const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./reciclagem.db');

const email = 'admin@reciclagem.com';
const senha = 'admin';
const nome = 'Administrador Reciclagem';
const tipo = 'gestor';

console.log('--- Iniciando Operação ---');

db.serialize(() => {
    // 1. Tentar criar ou atualizar
    db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Erro de leitura:', err.message);
            return;
        }

        if (row) {
            console.log(`Usuário encontrado (ID: ${row.id}). Atualizando senha...`);
            db.run('UPDATE usuarios SET senha = ?, tipo = ? WHERE email = ?', [senha, tipo, email], function (err) {
                if (err) console.error('Erro update:', err.message);
                else console.log('UPDATE SUCESSO. Senha redefinida para "admin"');
            });
        } else {
            console.log(`Usuário não encontrado. Criando novo...`);
            db.run('INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)', [nome, email, senha, tipo], function (err) {
                if (err) console.error('Erro insert:', err.message);
                else console.log('INSERT SUCESSO. Usuário criado.');
            });
        }
    });

    // 2. Listar todos os usuários para confirmação
    db.all('SELECT id, nome, email, senha, tipo FROM usuarios', [], (err, rows) => {
        console.log('\n--- VERIFICAÇÃO FINAL DO BANCO ---');
        if (err) {
            console.error(err);
        } else {
            if (rows.length === 0) console.log('BANCO ESTÁ VAZIO! Algo está errado.');
            rows.forEach(u => {
                console.log(`[${u.id}] ${u.nome} | ${u.email} | senha: ${u.senha} | tipo: ${u.tipo}`);
            });
        }
        console.log('----------------------------------');
        db.close();
    });
});
