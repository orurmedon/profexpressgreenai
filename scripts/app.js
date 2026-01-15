let gameData = {};
let currentStep = 0;
let metrics = { innovation: 10, co2: 10, water: 10 };

// 1. Initialisation (Appelé une seule fois par le Routeur main.js)
window.initGame = function() {
    if (!gameData.scenarios) {
        fetch('assets/content.json')
            .then(response => response.json())
            .then(data => {
                gameData = data;
                
                // --- AJOUT : PRÉCHARGEMENT ---
                preloadImages(); 
                // -----------------------------

                renderIntro();
            })
            .catch(err => console.error("Erreur JSON:", err));
    } else {
        renderIntro();
    }
}; 

// Nouvelle fonction magique pour la gestion d'image en cache 
function preloadImages() {
    console.log("Préchargement des images en arrière-plan...");
    gameData.scenarios.forEach(scenario => {
        if (scenario.image) {
            const img = new Image();
            img.src = scenario.image; // Le navigateur la télécharge et la garde en cache
        }
    });
} ; 

// 2. Affiche l'écran d'introduction de la mission
function renderIntro() {
    const app = document.getElementById('app');
    // On reset les métriques visuellement pour le début
    metrics = { innovation: 10, co2: 10, water: 10 };
    updateDashboard();

    app.innerHTML = `
        <div class="glass-card fade-in" style="text-align:center; max-width:600px; margin:auto;">
            <h1>${gameData.intro.title}</h1>
            <p>${gameData.intro.text}</p>
            <button onclick="startAudit()" style="margin-top:2rem; font-size:1.2rem;">${gameData.intro.button}</button>
        </div>
    `;
}

// 3. Lance vraiment le premier scénario (Reset explicite)
window.startAudit = function() {
    currentStep = 0;
    renderScenario();
};

// 4. Affiche le scénario en cours
function renderScenario() {
    // Si on dépasse le nombre de questions, on affiche la fin
    if (currentStep >= gameData.scenarios.length) { 
        renderConclusion(); 
        return; 
    }
    
    const scenario = gameData.scenarios[currentStep];
    const app = document.getElementById('app');

    // Image de fallback si lien cassé
    const imgSrc = scenario.image || 'assets/data/server.png'; 

    app.innerHTML = `
        <div class="glass-card fade-in" style="max-width:1000px; width:100%;">
            <div class="scenario-grid">
                <div class="visual-column">
                    <img src="${imgSrc}" onerror="this.style.display='none'">
                    <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:4px; font-size:0.8rem;">
                        Cas ${currentStep + 1} / ${gameData.scenarios.length}
                    </div>
                </div>

                <div class="content-column">
                    <h2 style="color:var(--primary-green)">${scenario.title}</h2>
                    <div class="ceo-request">"${scenario.ceo_request}"</div>
                    
                    <div style="margin-bottom:1.5rem; font-size:0.95rem; color:#bdc3c7; background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px;">
                        <strong>⚡ Concept Clé : ${scenario.theory.concept}</strong><br>
                        ${scenario.theory.definition}
                    </div>

                    <div class="choices" style="display:flex; flex-direction:column; gap:10px;">
                        ${scenario.choices.map((choice, index) => `
                            <button onclick="openModalChoice(${index})" style="text-align:left;">
                                ${index + 1}. ${choice.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- LOGIQUE DES JAUGES ---

function updateDashboard() {
    updateSingleBar('bar-innovation', 'val-inno', metrics.innovation, false);
    updateSingleBar('bar-co2', 'val-co2', metrics.co2, true);
    updateSingleBar('bar-water', 'val-water', metrics.water, true);
}

function updateSingleBar(barId, textId, value, isDanger) {
    const bar = document.getElementById(barId);
    const textSpan = document.getElementById(textId);
    
    if(bar && textSpan) {
        textSpan.innerText = value + '%';
        bar.style.width = value + '%';
        bar.className = 'progress-fill'; // Reset classes
        
        if (isDanger) {
            if (value < 50) bar.classList.add('safe');
            else if (value < 80) bar.classList.add('warning');
            else bar.classList.add('critical');
        } else {
            bar.classList.add('tech');
        }
    }
}

// --- NAVIGATION ET MODALE ---

// Étape A : L'utilisateur clique sur un choix
window.openModalChoice = function(index) {
    const scenario = gameData.scenarios[currentStep];
    const choice = scenario.choices[index];

    // Calcul
    metrics.innovation = clamp(metrics.innovation + choice.impact.innovation);
    metrics.co2 = clamp(metrics.co2 + choice.impact.co2);
    metrics.water = clamp(metrics.water + choice.impact.water);
    updateDashboard();

    // Remplissage Modale
    const modal = document.getElementById('feedback-modal');
    if(!modal) return console.error("Modale introuvable dans le HTML");

    const isBad = choice.impact.co2 > 10 || choice.impact.water > 10;
    
    document.getElementById('modal-icon').innerText = isBad ? '⚠️' : '✅';
    document.getElementById('modal-title').innerText = isBad ? 'Attention' : 'Bien joué';
    document.getElementById('modal-title').style.color = isBad ? '#e74c3c' : '#2ecc71';
    
    document.getElementById('modal-text').innerText = choice.feedback;
    
    // Affichage des deltas (+10, -5...)
    document.getElementById('modal-impact').innerHTML = `
        <span style="color:${choice.impact.innovation >= 0 ? '#3498db' : '#bdc3c7'}">
            Innov ${choice.impact.innovation > 0 ? '+' : ''}${choice.impact.innovation}
        </span>
        <span style="color:${choice.impact.co2 > 0 ? '#e74c3c' : '#2ecc71'}">
            CO2 ${choice.impact.co2 > 0 ? '+' : ''}${choice.impact.co2}
        </span>
    `;

    modal.classList.add('active');
};

// Étape B : L'utilisateur ferme la modale pour continuer
window.closeModalAndNext = function() {
    const modal = document.getElementById('feedback-modal');
    modal.classList.remove('active');
    
    // On attend 300ms que l'animation se finisse avant de changer le contenu
    setTimeout(() => {
        currentStep++; // On incrémente ICI
        renderScenario(); // On recharge l'écran
    }, 300);
};

// Utilitaires
function clamp(val) { return Math.min(100, Math.max(0, val)); }

function renderConclusion() {
    let title = "Audit Terminé";
    let msg = "";
    if (metrics.co2 >= 100 || metrics.water >= 100) msg = "GAME OVER : Désastre Écologique. La planète ne vous remercie pas.";
    else if (metrics.innovation < 30) msg = "Échec : Votre entreprise a coulé faute d'innovation.";
    else msg = "Succès : Vous avez trouvé la voie de l'IA Responsable !";

    document.getElementById('app').innerHTML = `
        <div class="glass-card fade-in" style="text-align:center">
            <h1>${title}</h1>
            <p style="font-size:1.2rem; margin:2rem 0;">${msg}</p>
            <div class="impact-row" style="justify-content:center; gap:2rem; font-size:1.5rem;">
                <div>💡 ${metrics.innovation}%</div>
                <div>☁️ ${metrics.co2}%</div>
                <div>💧 ${metrics.water}%</div>
            </div>
            <button onclick="renderIntro()" style="margin-top:2rem;">Recommencer</button>
            <br><br>
            <button onclick="router('home')" style="background:transparent; border:1px solid rgba(255,255,255,0.3)">Retour au Menu</button>
        </div>
    `;
}