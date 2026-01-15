let gameData = {};
let currentStep = 0;
let metrics = { innovation: 10, co2: 10, water: 10 };

// Initialisation appelée par le router (main.js)
window.initGame = function() {
    // Si les données ne sont pas chargées, on les charge
    if (!gameData.scenarios) {
        fetch('assets/content.json')
            .then(response => response.json())
            .then(data => {
                gameData = data;
                startGame(); // On lance le jeu une fois chargé
            })
            .catch(err => console.error("Erreur chargement JSON:", err));
    } else {
        // Si déjà chargées, on relance juste une partie
        startGame();
    }
};

function startGame() {
    currentStep = 0;
    metrics = { innovation: 10, co2: 10, water: 10 }; // Reset scores
    updateDashboard();
    renderIntro();
}

function updateDashboard() {
    updateSingleBar('bar-innovation', 'val-inno', metrics.innovation, false);
    updateSingleBar('bar-co2', 'val-co2', metrics.co2, true);
    updateSingleBar('bar-water', 'val-water', metrics.water, true);
}

function updateSingleBar(barId, textId, value, isDanger) {
    const bar = document.getElementById(barId);
    if(bar) {
        document.getElementById(textId).innerText = value + '%';
        bar.style.width = value + '%';
        bar.className = 'progress-fill';
        
        if (isDanger) {
            if (value < 40) bar.classList.add('safe');
            else if (value < 75) bar.classList.add('warning');
            else bar.classList.add('critical');
        } else {
            bar.classList.add('tech');
        }
    }
}

function renderIntro() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="glass-card fade-in" style="text-align:center; max-width:600px; margin:auto;">
            <h1>${gameData.intro.title}</h1>
            <p>${gameData.intro.text}</p>
            <button onclick="nextStep()" style="margin-top:2rem">Lancer l'audit</button>
        </div>
    `;
}

function renderScenario() {
    if (currentStep >= gameData.scenarios.length) { 
        renderConclusion(); 
        return; 
    }
    
    const scenario = gameData.scenarios[currentStep];
    const app = document.getElementById('app');

    // On s'assure qu'il y a une image par défaut si le lien est cassé
    const imgSrc = scenario.image || 'https://via.placeholder.com/400x300?text=GreenGen';

    app.innerHTML = `
        <div class="glass-card fade-in" style="max-width:1000px; width:100%;">
            <div class="scenario-grid">
                <div class="visual-column">
                    <img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                </div>

                <div class="content-column">
                    <h2 style="color:var(--primary-green)">${scenario.title}</h2>
                    <div class="ceo-request">"${scenario.ceo_request}"</div>
                    
                    <div style="margin-bottom:1.5rem; font-size:0.9rem; color:#bdc3c7">
                        <strong>💡 ${scenario.theory.concept}</strong><br>
                        ${scenario.theory.definition}
                    </div>

                    <div class="choices" style="flex-direction:column; gap:10px;">
                        ${scenario.choices.map((choice, index) => `
                            <button onclick="openModalChoice(${index})">${choice.text}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- LOGIQUE DE NAVIGATION ---

// 1. Appelé quand on clique sur une réponse
window.openModalChoice = function(index) {
    const scenario = gameData.scenarios[currentStep];
    const choice = scenario.choices[index];

    // Calcul des scores
    metrics.innovation = clamp(metrics.innovation + choice.impact.innovation);
    metrics.co2 = clamp(metrics.co2 + choice.impact.co2);
    metrics.water = clamp(metrics.water + choice.impact.water);
    updateDashboard();

    // Remplissage de la Modale (qui est maintenant dans le HTML)
    const modal = document.getElementById('feedback-modal');
    const isBad = choice.impact.co2 > 15 || choice.impact.water > 15;
    
    document.getElementById('modal-icon').innerText = isBad ? '⚠️' : '✅';
    document.getElementById('modal-title').innerText = isBad ? 'Attention' : 'Bien joué';
    document.getElementById('modal-title').style.color = isBad ? '#e74c3c' : '#2ecc71';
    document.getElementById('modal-text').innerText = choice.feedback;
    
    document.getElementById('modal-impact').innerHTML = `
        <span style="color:${choice.impact.innovation > 0 ? '#3498db' : '#bdc3c7'}">Innov: ${choice.impact.innovation > 0 ? '+' : ''}${choice.impact.innovation}</span>
        <span style="color:${choice.impact.co2 > 10 ? '#e74c3c' : '#2ecc71'}">CO2: ${choice.impact.co2 > 0 ? '+' : ''}${choice.impact.co2}</span>
    `;

    // Affichage
    modal.classList.add('active');
};

// 2. Appelé quand on clique sur "Continuer" dans la modale
window.closeModalAndNext = function() {
    const modal = document.getElementById('feedback-modal');
    modal.classList.remove('active'); // Fermer la modale
    
    // On attend un tout petit peu que l'animation se finisse
    setTimeout(() => {
        nextStep(); 
    }, 200);
};

// 3. Passage à l'étape suivante
window.nextStep = function() {
    // Si on était à l'intro (-1 ou 0 initial sans scénario), on commence
    // Sinon on avance
    if(document.querySelector('.hero-card')) {
        currentStep = 0;
    } else {
        currentStep++;
    }
    
    // Petit fix : si renderIntro appelle nextStep, currentStep est à 0.
    // renderScenario gère l'affichage.
    renderScenario();
};

function clamp(val) { return Math.min(100, Math.max(0, val)); }

function renderConclusion() {
    let title = "Audit Terminé";
    let msg = "";
    if (metrics.co2 >= 100 || metrics.water >= 100) msg = "GAME OVER : Désastre Écologique.";
    else if (metrics.innovation < 40) msg = "Échec : Manque d'innovation stratégique.";
    else msg = "Succès : Vous avez trouvé la voie de l'IA Responsable !";

    document.getElementById('app').innerHTML = `
        <div class="glass-card fade-in" style="text-align:center">
            <h1>${title}</h1>
            <p>${msg}</p>
            <div class="impact-row" style="justify-content:center">
                <span>Innov: ${metrics.innovation}%</span>
                <span>CO2: ${metrics.co2}%</span>
                <span>Eau: ${metrics.water}%</span>
            </div>
            <button onclick="startGame()">Recommencer</button>
            <button onclick="router('home')" style="margin-top:10px; background:rgba(255,255,255,0.1)">Menu Principal</button>
        </div>
    `;
}