let gameData = {};
let currentStep = 0;
let metrics = { innovation: 10, co2: 10, water: 10 };
// ... variables globales ... (gameData, metrics, etc.)

// Exposer la fonction initGame globalement pour main.js
window.initGame = function() {
    // On ne fetch qu'une seule fois
    if (!gameData.scenarios) {
        fetch('assets/content.json')
            .then(response => response.json())
            .then(data => {
                gameData = data;
                updateDashboard();
                renderIntro(); // Fonction du jeu
            });
    } else {
        // Si déjà chargé, on reset juste l'affichage si besoin
        updateDashboard();
    }
};

// ... Le reste du code (updateDashboard, renderScenario, etc.) reste identique ...
// Assurez-vous que renderIntro écrit bien dans document.getElementById('game-container') 
// OU que votre index.html a un <div id="app"> à l'intérieur de la section #view-game.

function createModalHTML() {
    const modalHTML = `
        <div id="feedback-modal" class="modal-overlay">
            <div class="modal-content">
                <span id="modal-icon" class="modal-icon"></span>
                <h2 id="modal-title">Analyse</h2>
                <p id="modal-text"></p>
                <div id="modal-impact" class="impact-row"></div>
                <button onclick="closeModalAndNext()" style="width:100%">Continuer</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function initGame() {
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

function renderIntro() {
    document.getElementById('app').innerHTML = `
        <div class="glass-card fade-in" style="text-align:center; max-width:600px; margin:auto;">
            <h1>${gameData.intro.title}</h1>
            <p>${gameData.intro.text}</p>
            <button onclick="startGame()" style="margin-top:2rem">Lancer</button>
        </div>
    `;
}

function startGame() {
    currentStep = 0;
    renderScenario();
}

// Nouvelle fonction de Rendu : IMAGE GAUCHE | TEXTE DROITE
function renderScenario() {
    if (currentStep >= gameData.scenarios.length) { renderConclusion(); return; }
    
    const scenario = gameData.scenarios[currentStep];
    const app = document.getElementById('app');

    // Structure Grid
    app.innerHTML = `
        <div class="glass-card fade-in" style="max-width:1000px; width:100%;">
            <div class="scenario-grid">
                
                <div class="visual-column">
                    <img src="${scenario.image}" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
                    <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); padding:5px 10px; border-radius:5px; font-size:0.8rem;">
                        Situation ${scenario.id} / ${gameData.scenarios.length}
                    </div>
                </div>

                <div class="content-column">
                    <h2 style="color:var(--primary-green)">${scenario.title}</h2>
                    
                    <div class="ceo-request">
                        "${scenario.ceo_request}"
                    </div>

                    <div style="margin-bottom:1.5rem; font-size:0.9rem; color:var(--text-muted)">
                        <strong>💡 Savoir : ${scenario.theory.concept}</strong><br>
                        ${scenario.theory.definition}
                    </div>

                    <div class="choices" style="flex-direction:column;">
                        ${scenario.choices.map((choice, index) => `
                            <button onclick="openModalChoice(${index})">${choice.text}</button>
                        `).join('')}
                    </div>
                </div>

            </div>
        </div>
    `;
}

// Ouverture de la Modale (au lieu de remplacer l'écran)
window.openModalChoice = function(index) {
    const scenario = gameData.scenarios[currentStep];
    const choice = scenario.choices[index];

    // Mise à jour des données
    metrics.innovation = clamp(metrics.innovation + choice.impact.innovation);
    metrics.co2 = clamp(metrics.co2 + choice.impact.co2);
    metrics.water = clamp(metrics.water + choice.impact.water);
    updateDashboard();

    // Remplissage de la modale
    const isBad = choice.impact.co2 > 10 || choice.impact.water > 10;
    document.getElementById('modal-icon').innerText = isBad ? '⚠️' : '✅';
    document.getElementById('modal-title').innerText = isBad ? 'Attention' : 'Bien joué';
    document.getElementById('modal-title').style.color = isBad ? '#e74c3c' : '#2ecc71';
    
    document.getElementById('modal-text').innerText = choice.feedback;
    
    document.getElementById('modal-impact').innerHTML = `
        <span style="color:${choice.impact.innovation > 0 ? '#3498db' : '#bdc3c7'}">Innov: ${choice.impact.innovation > 0 ? '+' : ''}${choice.impact.innovation}</span>
        <span style="color:${choice.impact.co2 > 10 ? '#e74c3c' : '#2ecc71'}">CO2: ${choice.impact.co2 > 0 ? '+' : ''}${choice.impact.co2}</span>
    `;

    // Affichage
    document.getElementById('feedback-modal').classList.add('active');
}

window.closeModalAndNext = function() {
    document.getElementById('feedback-modal').classList.remove('active');
    // Petit délai pour laisser l'animation de fermeture se faire
    setTimeout(() => {
        currentStep++;
        renderScenario();
    }, 300);
}

function clamp(val) { return Math.min(100, Math.max(0, val)); }

function renderConclusion() {
    let title = "Audit Terminé";
    let msg = "";
    if (metrics.co2 > 75 || metrics.water > 75) msg = "Échec : L'environnement est sacrifié.";
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
            <button onclick="location.reload()">Recommencer</button>
        </div>
    `;
}