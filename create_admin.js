const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./reciclagem.db');

const email = 'admin@reciclagem.com';
const senha = 'admin';
const nome = 'Administrador Reciclagem';
const tipo = 'gestor';

console.log('Iniciando verificação do usuário...');

db.serialize(() => {
    // Verificar se usuário existe
    db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Erro ao consultar:', err.message);
            db.close();
            return;
        }

        if (row) {
            console.log(`Usuário ${email} já existe. Atualizando senha e tipo...`);
            db.run('UPDATE usuarios SET senha = ?, tipo = ? WHERE email = ?', [senha, tipo, email], function (err) {
                if (err) console.error('Erro ao atualizar:', err.message);
                else console.log('Usuário atualizado com sucesso!');
                db.close(); // Fecha só depois de terminar
            });
        } else {
            console.log(`Criando novo usuário ${email}...`);
            db.run('INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)', [nome, email, senha, tipo], function (err) {
                if (err) console.error('Erro ao inserir:', err.message);
                else console.log('Usuário criado com sucesso!');
                db.close(); // Fecha só depois de terminar
            });
        }
    });
});
