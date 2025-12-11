document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos do DOM
    const form = document.getElementById('frete-form');
    const btn = document.getElementById('btn-calculate');
    const errorBox = document.getElementById('error-message');
    const resultsArea = document.getElementById('results-area');
    const cardsList = document.getElementById('cards-list');

    // Inputs com Máscara
    const cepOrigem = document.getElementById('cep-origem');
    const cepDestino = document.getElementById('cep-destino');

    // --- FUNÇÕES UTILITÁRIAS ---

    // Máscara de CEP (00000-000)
    const maskCep = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substr(0, 9);
    };

    // Formata Moeda (R$)
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Event Listeners para Máscaras
    [cepOrigem, cepDestino].forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = maskCep(e.target.value);
        });
    });

    // --- LÓGICA PRINCIPAL ---

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Coleta de Dados
        const peso = parseFloat(document.getElementById('peso').value);
        const valor = parseFloat(document.getElementById('valor').value) || 0;
        const altura = parseFloat(document.getElementById('altura').value);
        const largura = parseFloat(document.getElementById('largura').value);
        const comprimento = parseFloat(document.getElementById('comprimento').value);

        // 2. Validação
        if (!cepOrigem.value || !cepDestino.value || !peso || !altura || !largura || !comprimento) {
            showError(true);
            return;
        }
        showError(false);

        // 3. Estado de Loading
        setLoading(true);

        // 4. Cálculo (Simulado com delay para UX)
        setTimeout(() => {
            const resultados = calcularFrete(peso, altura, largura, comprimento, valor);
            renderizarResultados(resultados);
            setLoading(false);
        }, 800);
    });

    function showError(show) {
        errorBox.style.display = show ? 'block' : 'none';
        if(show) errorBox.classList.add('shake'); // Poderia adicionar animação CSS aqui
    }

    function setLoading(isLoading) {
        if (isLoading) {
            btn.disabled = true;
            btn.querySelector('span').innerText = "Calculando...";
            resultsArea.classList.add('hidden');
        } else {
            btn.disabled = false;
            btn.querySelector('span').innerText = "Calcular Estimativa";
        }
    }

    // Lógica Matemática do Cálculo
    function calcularFrete(peso, alt, larg, comp, valorDeclarado) {
        // Base de cálculo
        const taxaBase = 15.00;
        const precoKg = 1.50; // R$ 1,50 por kg
        const fatorCubagem = 0.003; // Fator fictício para cm³
        
        const pesoFisico = peso * precoKg;
        const pesoCubico = (alt * larg * comp) * fatorCubagem;
        const seguro = valorDeclarado * 0.01; // 1% do valor

        // O preço final considera o maior valor entre peso físico e cúbico
        const custoTransporte = Math.max(pesoFisico, pesoCubico) + taxaBase + seguro;

        // Gerar Transportadoras
        return [
            {
                nome: "Correios PAC",
                prazo: "5 a 8 dias úteis",
                preco: custoTransporte,
                badge: null
            },
            {
                nome: "Sedex Express",
                prazo: "1 a 3 dias úteis",
                preco: custoTransporte * 1.6, // 60% mais caro
                badge: "Mais Rápido"
            },
            {
                nome: "Loggi Standard",
                prazo: "3 a 6 dias úteis",
                preco: custoTransporte * 1.1,
                badge: "Melhor Custo"
            }
        ];
    }

    // Manipulação do DOM para criar os cards
    function renderizarResultados(opcoes) {
        cardsList.innerHTML = ''; // Limpa anteriores

        opcoes.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            // HTML Interno do Card
            card.innerHTML = `
                <div class="carrier-info">
                    <div style="display:flex; align-items:center">
                        <h3>${opt.nome}</h3>
                        ${opt.badge ? `<span class="badge">${opt.badge}</span>` : ''}
                    </div>
                    <p>Entrega em ${opt.prazo}</p>
                </div>
                <div class="carrier-price">
                    ${formatCurrency(opt.preco)}
                </div>
            `;
            
            cardsList.appendChild(card);
        });

        resultsArea.classList.remove('hidden');
        // Scroll suave até o resultado
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
