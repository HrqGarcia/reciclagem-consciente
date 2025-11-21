import sqlite3
import os

def create_database():
    db_file = 'reciclagem.db'
    
    # Remove o arquivo se já existir para garantir uma instalação limpa (opcional, mas bom para testes)
    # if os.path.exists(db_file):
    #     os.remove(db_file)
    #     print(f"Banco de dados antigo removido.")

    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Criação da tabela de agendamentos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                endereco TEXT NOT NULL,
                data TEXT NOT NULL,
                tipo_material TEXT NOT NULL,
                peso_estimado REAL NOT NULL,
                pontos INTEGER NOT NULL
            )
        ''')

        print(f"Banco de dados '{db_file}' criado com sucesso e tabela 'agendamentos' configurada.")
        
        conn.commit()
        conn.close()

    except sqlite3.Error as e:
        print(f"Erro ao criar o banco de dados: {e}")

if __name__ == '__main__':
    create_database()
