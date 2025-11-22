import sqlite3
import os

def create_database():
    db_file = 'reciclagem.db'
    
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Drop tabela antiga para recriar com nova estrutura (CUIDADO: Apaga dados)
        cursor.execute('DROP TABLE IF EXISTS agendamentos')

        # Criação da tabela de agendamentos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                endereco TEXT NOT NULL,
                data TEXT NOT NULL,
                tipo_material TEXT NOT NULL,
                peso_estimado REAL NOT NULL,
                pontos INTEGER NOT NULL,
                status TEXT DEFAULT 'Pendente',
                ponto_coleta_id INTEGER,
                FOREIGN KEY (ponto_coleta_id) REFERENCES coleta_points(id)
            )
        ''')

        # Criação da tabela de pontos de coleta
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS coleta_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_local TEXT NOT NULL,
                endereco TEXT NOT NULL,
                bairro TEXT NOT NULL,
                tipos_aceitos TEXT NOT NULL
            )
        ''')

        # Inserir dados iniciais se a tabela estiver vazia
        cursor.execute('SELECT count(*) FROM coleta_points')
        if cursor.fetchone()[0] == 0:
            pontos = [
                ('Ecoponto Gonzaga', 'Praça das Bandeiras, s/n', 'Gonzaga', 'Vidro, Plástico, Papel, Metal'),
                ('Estação Boqueirão', 'Av. Conselheiro Nébias, 800', 'Boqueirão', 'Eletrônicos, Pilhas, Baterias'),
                ('Coleta Ponta da Praia', 'Av. Almirante Saldanha da Gama, 150', 'Ponta da Praia', 'Óleo de Cozinha, Plástico, Papel')
            ]
            cursor.executemany('INSERT INTO coleta_points (nome_local, endereco, bairro, tipos_aceitos) VALUES (?, ?, ?, ?)', pontos)
            print("Dados iniciais de pontos de coleta inseridos.")

        print(f"Banco de dados '{db_file}' atualizado com sucesso.")
        
        conn.commit()
        conn.close()

    except sqlite3.Error as e:
        print(f"Erro ao criar/atualizar o banco de dados: {e}")

if __name__ == '__main__':
    create_database()
