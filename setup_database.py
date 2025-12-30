import sqlite3
import os

def create_database():
    db_file = 'reciclagem.db'
    
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Drop tabelas antigas (Limpar tudo para nova estrutura)
        cursor.execute('DROP TABLE IF EXISTS agendamentos')
        cursor.execute('DROP TABLE IF EXISTS usuarios')
        cursor.execute('DROP TABLE IF EXISTS coleta_points')

        # 1. Tabela Usuarios
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                tipo TEXT NOT NULL  -- 'cidadao' ou 'gestor'
            )
        ''')

        # 2. Tabela Pontos de Coleta
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS coleta_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_local TEXT NOT NULL,
                endereco TEXT NOT NULL,
                bairro TEXT NOT NULL,
                tipos_aceitos TEXT NOT NULL
            )
        ''')

        # 3. Tabela Agendamentos (com usuario_id)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                nome TEXT NOT NULL, -- Nome de quem agendou (pode ser redundante com usuario, mas mantemos para histórico)
                endereco TEXT NOT NULL,
                data TEXT NOT NULL,
                tipo_material TEXT NOT NULL,
                peso_estimado REAL NOT NULL,
                pontos INTEGER NOT NULL,
                status TEXT DEFAULT 'Pendente',
                ponto_coleta_id INTEGER,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
                FOREIGN KEY (ponto_coleta_id) REFERENCES coleta_points(id)
            )
        ''')

        # --- SEEDS (DADOS INICIAIS) ---

        # Pontos de Coleta
        pontos = [
            ('Ecoponto Gonzaga', 'Praça das Bandeiras, s/n', 'Gonzaga', 'Vidro, Plástico, Papel, Metal'),
            ('Estação Boqueirão', 'Av. Conselheiro Nébias, 800', 'Boqueirão', 'Eletrônicos, Pilhas, Baterias'),
            ('Coleta Ponta da Praia', 'Av. Almirante Saldanha da Gama, 150', 'Ponta da Praia', 'Óleo de Cozinha, Plástico, Papel')
        ]
        cursor.executemany('INSERT INTO coleta_points (nome_local, endereco, bairro, tipos_aceitos) VALUES (?, ?, ?, ?)', pontos)
        print("Pontos de coleta inseridos.")

        # Usuários
        usuarios = [
            ('Gestor Admin', 'admin@recicla.com', 'admin', 'gestor'),
            ('Cidadão Teste', 'cidadao@teste.com', '123456', 'cidadao')
        ]
        cursor.executemany('INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)', usuarios)
        print("Usuários iniciais inseridos (Admin e Cidadão).")

        print(f"Banco de dados '{db_file}' recriado com sucesso.")
        
        conn.commit()
        conn.close()

    except sqlite3.Error as e:
        print(f"Erro ao criar/atualizar o banco de dados: {e}")

if __name__ == '__main__':
    create_database()
