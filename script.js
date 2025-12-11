/* --- BANCO DE DADOS LOCAL (SIMULAÇÃO) --- */
const DB_KEY = "ag_croppers_db";

// Inicializa o banco se não existir
function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        const initialData = {
            users: [
                { user: "admin", pass: "admin", role: "admin" } // Usuário Padrão
            ],
            config: {
                pricePerTonKm: 0.85 // Preço padrão
            }
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    }
}

function getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Estado da Sessão
let currentUser = null;

/* --- NAVEGAÇÃO ENTRE TELAS --- */
function toggleView(viewId) {
    // Esconde todas
    document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.view-container').forEach(el => setTimeout(() => el.classList.add('hidden'), 0));
    
    // Mostra a desejada
    const target = document.getElementById(viewId);
    target.classList.remove('hidden');
    setTimeout(() => target.classList.add('active'), 10);
}

/* --- AUTENTICAÇÃO --- */
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorMsg = document.getElementById('login-error');

    const db = getDB();
    const foundUser = db.users.find(u => u.user === user && u.pass === pass);

    if (foundUser) {
        // Sucesso
        currentUser = foundUser;
        errorMsg.classList.add('hidden');
        
        // Configura a tela do App
        document.getElementById('display-username').innerText = currentUser.role === 'admin' ? 'Administrador' : currentUser.user;
        
        // Mostra botão admin se for admin
        if(currentUser.role === 'admin') {
            document.getElementById('btn-admin-panel').classList.remove('hidden');
            // Carrega config atual no painel
            document.getElementById('conf-price').value = db.config.pricePerTonKm;
        } else {
            document.getElementById('btn-admin-panel').classList.add('hidden');
        }

        // Limpa campos
        document.getElementById('login-user').value = "";
        document.getElementById('login-pass').value = "";

        toggleView('view-app');
    } else {
        // Erro
        errorMsg.classList.remove('hidden');
    }
});

function logout() {
    currentUser = null;
    toggleView('view-login');
}

/* --- LÓGICA DO SIMULADOR --- */
document.getElementById('form-simulador').addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button');
    const loader = btn.querySelector('.loader');
    const span = btn.querySelector('span');
    const resultArea = document.getElementById('resultado-area');

    // Validação Simples
    const peso = parseFloat(document.getElementById('peso-ton').value);
    const origem = document.getElementById('origem-cidade').value;
    const destino = document.getElementById('destino-cidade').value;

    if (!peso || !origem || !destino) {
        alert("Preencha todos os campos da rota e carga.");
        return;
    }

    // UI Loading
    btn.disabled = true;
    span.style.display = 'none';
    loader.style.display = 'block';
    resultArea.classList.add('hidden');

    setTimeout(() => {
        // CÁLCULO FICTÍCIO INTELIGENTE
        // Gera uma distância aleatória baseada no "hash" dos nomes para ser consistente
        // (Ex: Sorriso -> Santos sempre dará a mesma distância fictícia)
        const rotaStr = origem + destino;
        let hash = 0;
        for (let i = 0; i < rotaStr.length; i++) hash = rotaStr.charCodeAt(i) + ((hash << 5) - hash);
        const distanciaFicticia = (Math.abs(hash) % 1500) + 200; // Entre 200km e 1700km

        // Pega preço do banco
        const db = getDB();
        const precoPorTonKm = db.config.pricePerTonKm;

        // Fórmula: (Peso * Distancia * PreçoConfig)
        const total = peso * distanciaFicticia * precoPorTonKm;

        // Mostrar Resultado
        document.getElementById('price-value').innerText = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        resultArea.classList.remove('hidden');
        
        // Reset UI
        btn.disabled = false;
        span.style.display = 'block';
        loader.style.display = 'none';
    }, 1000);
});

/* --- LÓGICA DO ADMIN --- */

// 1. Criar Usuário
document.getElementById('form-create-user').addEventListener('submit', (e) => {
    e.preventDefault();
    if(currentUser.role !== 'admin') return;

    const newUser = document.getElementById('new-user').value;
    const newPass = document.getElementById('new-pass').value;
    const msg = document.getElementById('user-msg');

    if(newUser && newPass) {
        const db = getDB();
        // Evita duplicados
        if(db.users.find(u => u.user === newUser)) {
            alert("Usuário já existe!");
            return;
        }

        db.users.push({ user: newUser, pass: newPass, role: 'user' });
        saveDB(db);

        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
        
        document.getElementById('new-user').value = "";
        document.getElementById('new-pass').value = "";
    }
});

// 2. Salvar Configurações
function saveConfig() {
    if(currentUser.role !== 'admin') return;

    const newPrice = parseFloat(document.getElementById('conf-price').value);
    const msg = document.getElementById('config-msg');

    if(newPrice) {
        const db = getDB();
        db.config.pricePerTonKm = newPrice;
        saveDB(db);

        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    }
}

// Inicializa tudo
initDB();
// Começa no Login
toggleView('view-login');
