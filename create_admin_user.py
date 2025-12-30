import sqlite3

def create_admin():
    db_file = 'reciclagem.db'
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Dados do novo admin
        nome = "Administrador Reciclagem"
        email = "admin@reciclagem.com"
        senha = "admin"
        tipo = "gestor"

        # Verifica se já existe
        cursor.execute('SELECT id FROM usuarios WHERE email = ?', (email,))
        user = cursor.fetchone()

        if user:
            print(f"O usuário {email} já existe. Atualizando senha...")
            cursor.execute('UPDATE usuarios SET senha = ?, tipo = ? WHERE email = ?', (senha, tipo, email))
        else:
            print(f"Criando novo usuário admin: {email}")
            cursor.execute('INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)', (nome, email, senha, tipo))

        conn.commit()
        conn.close()
        print("Usuário Admin configurado com sucesso!")

    except sqlite3.Error as e:
        print(f"Erro no banco de dados: {e}")

if __name__ == '__main__':
    create_admin()
