Reciclagem Consciente - Santos/SP ♻️

Este projeto é um MVP (Produto Mínimo Viável) desenvolvido como parte da Atividade Extensionista do curso CST GESTÃO DA TECNOLOGIA DA INFORMAÇÃO - DISTÂNCIA. O sistema visa conectar cidadãos à rede de coleta seletiva de Santos, incentivando a reciclagem através de um sistema de agendamento e recompensas (EcoPoints).

🚀 Funcionalidades Principais
O sistema foi estruturado em dois ambientes independentes para garantir a segurança e a separação de perfis de acesso:

👤 Ambiente do Cidadão
Cadastro e Login: Sistema de autenticação seguro para moradores.

Agendamento de Coleta: Formulário para registrar o tipo de material (Vidro, Papel, Plástico, Metal) e peso estimado.

Mapa de Pontos: Visualização de locais de entrega voluntária em Santos (Gonzaga, Boqueirão e Ponta da Praia).

Dashboard de Pontos: Consulta de saldo de EcoPoints e histórico de coletas aprovadas.

🛡️ Ambiente da Cooperativa (Gestor)
Painel Administrativo: Área exclusiva para visualização de pedidos pendentes.

Gestão de Logística: Vinculação de agendamentos a pontos de coleta específicos.

Aprovação e Crédito: Validação da coleta que converte o peso do material em pontos para o usuário.

🛠️ Stack Tecnológica
Backend: Node.js com Express.

Banco de Dados: SQLite (Reciclagem.db).

Frontend: HTML5, CSS3 e JavaScript Vanilla (Design responsivo e sustentável).

Autenticação: Gerenciamento de sessões com express-session.

📋 Como Testar o Projeto
Credenciais de Acesso (Teste)
Perfil Gestor: * Login: admin@recicla.com

Senha: admin

Perfil Cidadão: O usuário pode se cadastrar livremente pela tela de cadastro.

Execução Local
Instale as dependências: npm install.

Inicialize o banco de dados: py setup_database.py.

Inicie o servidor: node server.js.

Acesse:

Cidadão: http://localhost:3000/cliente/login.html.

Gestor: http://localhost:3000/cooperativa/admin.html.

Desenvolvido por: Henrique Garcia

Localização: Santos, SP
