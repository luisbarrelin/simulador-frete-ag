document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementos ---
    const form = document.getElementById('frete-form');
    const btn = document.getElementById('btn-calc');
    const errorMsg = document.getElementById('error-msg');
    const resultsDiv = document.getElementById('results');
    const cardsList = document.getElementById('cards-list');

    // --- Máscara de CEP (00000-000) ---
    const mascaraCep = (event) => {
        let input = event.target;
        input.value = input.value.replace(/\D/g, '')
                                 .replace(/^(\d{5})(\d)/, '$1-$2');
    };

    document.getElementById('cep-origin').addEventListener('input', mascaraCep);
    document.getElementById('cep-dest').addEventListener('input', mascaraCep);

    // --- Lógica Principal ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Pegar Valores
        const peso = parseFloat(document.getElementById('weight').value);
        const altura = parseFloat(document.getElementById('height').value);
        const largura = parseFloat(document.getElementById('width').value);
        const comprimento = parseFloat(document.getElementById('length').value);
        const valorDeclarado = parseFloat(document.getElementById('value').value) || 0;
        const cepOrigem = document.getElementById('cep-origin').value;
        const cepDest = document.getElementById('cep-dest').value;

        // 2. Validar
        if(!peso || !altura || !largura || !comprimento || cepOrigem.length < 9 || cepDest.length < 9) {
            errorMsg.classList.remove('hidden');
            return;
        }
        errorMsg.classList.add('hidden');

        // 3. Estado de Carregamento
        btn.disabled = true;
        btn.querySelector('.btn-text').style.display = 'none';
        btn.querySelector('.loader').style.display = 'block';
        resultsDiv.classList.add('hidden');

        // 4. Calcular (Simulando delay de rede)
        setTimeout(() => {
            const opcoes = calcularLogica(peso, altura, largura, comprimento, valorDeclarado);
            renderizarCards(opcoes);
            
            // Restaurar botão
            btn.disabled = false;
            btn.querySelector('.btn-text').style.display = 'block';
            btn.querySelector('.loader').style.display = 'none';
        }, 1000);
    });

    // --- O Cérebro Matemático (Sua Lógica) ---
    function calcularLogica(peso, alt, larg, comp, valor) {
        // Base R$ 10,00
        const base = 10.00;
        
        // Peso: R$ 1,20 por kg
        const custoPeso = peso * 1.20;
        
        // Volume: R$ 0,05 por cm³ (fictício, ajustado para não ficar milionário)
        // Usando fator de cubagem padrão transporte (300) para realismo
        const cubagem = (alt * larg * comp) / 6000; 
        const custoVolume = cubagem * 5.00; // R$ 5,00 por kg cúbico

        // Seguro: 0.5% do valor
        const seguro = valor * 0.005;

        // Preço Base Final
        const precoFinal = base + Math.max(custoPeso, custoVolume) + seguro;

        return [
            {
                nome: "Econômico (PAC)",
                prazo: "7 a 10 dias úteis",
                preco: precoFinal,
                tag: null
            },
            {
                nome: "Expresso (Sedex)",
                prazo: "2 a 4 dias úteis",
                preco: precoFinal * 1.6, // 60% mais caro
                tag: "Rápido"
            },
            {
                nome: "Flash Delivery",
                prazo: "Até 24 horas",
                preco: precoFinal * 2.5, // 150% mais caro
                tag: "VIP"
            }
        ];
    }

    // --- Renderizar na Tela ---
    function renderizarCards(lista) {
        cardsList.innerHTML = '';
        
        lista.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card-result';
            card.innerHTML = `
                <div class="info">
                    <h3>${item.nome} ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}</h3>
                    <p>Chega em ${item.prazo}</p>
                </div>
                <div class="price">
                    ${item.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </div>
            `;
            cardsList.appendChild(card);
        });

        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
