document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('agendamentoForm');
    const agendamentosList = document.getElementById('agendamentos-list');
    const totalPointsEl = document.getElementById('total-points');
    const totalColetasEl = document.getElementById('total-coletas');

    // Carregar dados iniciais
    loadDashboard();

    // Manipular envio do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            nome: document.getElementById('nome').value,
            endereco: document.getElementById('endereco').value,
            data: document.getElementById('data').value,
            tipo_material: document.getElementById('tipo_material').value,
            peso_estimado: parseFloat(document.getElementById('peso_estimado').value)
        };

        try {
            const response = await fetch('/api/agendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Agendamento realizado! Você ganhou ${result.data.pontos} EcoPoints.`);
                form.reset();
                loadDashboard(); // Recarregar dashboard
                // Rolar suavemente para o dashboard
                document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Erro ao agendar: ' + result.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });

    // Função para carregar o dashboard
    async function loadDashboard() {
        try {
            const response = await fetch('/api/agendamentos');
            const result = await response.json();

            if (result.data) {
                renderTable(result.data);
                updateStats(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    function renderTable(data) {
        agendamentosList.innerHTML = '';

        if (data.length === 0) {
            agendamentosList.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhum agendamento encontrado.</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.data)}</td>
                <td>${item.tipo_material}</td>
                <td>${item.peso_estimado} kg</td>
                <td><strong>${item.pontos}</strong></td>
                <td><span style="color: var(--primary-color); font-weight: bold;">Agendado</span></td>
            `;
            agendamentosList.appendChild(row);
        });
    }

    function updateStats(data) {
        const totalPoints = data.reduce((acc, curr) => acc + curr.pontos, 0);
        const totalColetas = data.length;

        // Animação simples dos números
        animateValue(totalPointsEl, parseInt(totalPointsEl.innerText), totalPoints, 1000);
        animateValue(totalColetasEl, parseInt(totalColetasEl.innerText), totalColetas, 1000);
    }

    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
