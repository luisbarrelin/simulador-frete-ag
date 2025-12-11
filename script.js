/* --- BANCO DE DADOS LOCAL --- */
const DB_KEY = "ag_croppers_db";

function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        const initialData = {
            users: [
                { user: "admin", pass: "admin", role: "admin" }
            ],
            config: { pricePerTonKm: 0.85 }
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

let currentUser = null;

/* --- NAVEGAÇÃO ENTRE TELAS (CORRIGIDO) --- */
function toggleView(viewId) {
    const containers = document.querySelectorAll('.view-container');
    
    containers.forEach(el => {
        if (el.id === viewId) {
            // Se for a tela que queremos mostrar:
            el.classList.remove('hidden');
            // Pequeno delay para permitir a animação CSS
            setTimeout(() => el.classList.add('active'), 50);
        } else {
            // Se for qualquer outra tela:
            el.classList.remove('active');
            el.classList.add('hidden');
        }
    });
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
        currentUser = foundUser;
        errorMsg.classList.add('hidden');
        
        document.getElementById('display-username').innerText = currentUser.role === 'admin' ? 'Administrador' : currentUser.user;
        
        if(currentUser.role === 'admin') {
            document.getElementById('btn-admin-panel').classList.remove('hidden');
            document.getElementById('conf-price').value = db.config.pricePerTonKm;
        } else {
            document.getElementById('btn-admin-panel').classList.add('hidden');
        }

        // Limpa inputs
        document.getElementById('login-user').value = "";
        document.getElementById('login-pass').value = "";

        toggleView('view-app');
    } else {
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

    const peso = parseFloat(document.getElementById('peso-ton').value);
    const origem = document.getElementById('origem-cidade').value;
    const destino = document.getElementById('destino-cidade').value;

    if (!peso || !origem || !destino) {
        alert("Preencha todos os campos da rota e carga.");
        return;
    }

    btn.disabled = true;
    span.style.display = 'none';
    loader.style.display = 'block';
    resultArea.classList.add('hidden');

    setTimeout(() => {
        // Cálculo Fictício (Hash de distância)
        const rotaStr = origem + destino;
        let hash = 0;
        for (let i = 0; i < rotaStr.length; i++) hash = rotaStr.charCodeAt(i) + ((hash << 5) - hash);
        const distanciaFicticia = (Math.abs(hash) % 1500) + 200;

        const db = getDB();
        const precoPorTonKm = db.config.pricePerTonKm;

        const total = peso * distanciaFicticia * precoPorTonKm;

        document.getElementById('price-value').innerText = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        resultArea.classList.remove('hidden');
        
        btn.disabled = false;
        span.style.display = 'block';
        loader.style.display = 'none';
    }, 1000);
});

/* --- LÓGICA DO ADMIN --- */
document.getElementById('form-create-user').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!currentUser || currentUser.role !== 'admin') return;

    const newUser = document.getElementById('new-user').value;
    const newPass = document.getElementById('new-pass').value;
    const msg = document.getElementById('user-msg');

    if(newUser && newPass) {
        const db = getDB();
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

function saveConfig() {
    if(!currentUser || currentUser.role !== 'admin') return;

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

// INICIALIZAÇÃO
initDB();

// Garante que o DOM carregou antes de chamar
document.addEventListener("DOMContentLoaded", () => {
    toggleView('view-login');
});
