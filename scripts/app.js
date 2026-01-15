let gameData = {};
let currentStep = 0;
let metrics = {
    innovation: 10,
    co2: 10,
    water: 10
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/content.json')
        .then(response => response.json())
        .then(data => {
            gameData = data;
            initGame();
        })
        .catch(err => console.error("Erreur de chargement du contenu:", err));
});

function initGame() {
    updateDashboard();
    renderIntro();
}

// Mise à jour de l'affichage des jauges
function updateDashboard() {
    document.getElementById('bar-innovation').style.width = metrics.innovation + '%';
    document.getElementById('bar-co2').style.width = metrics.co2 + '%';
    document.getElementById('bar-water').style.width = metrics.water + '%';

    // Changement d'ambiance si pollution élevée
    if (metrics.co2 > 50 || metrics.water > 50) {
        document.body.classList.add('polluted');
    } else {
        document.body.classList.remove('polluted');
    }
}

// Affichage de l'intro
function renderIntro() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card">
            <h1>${gameData.intro.title}</h1>
            <p>${gameData.intro.text}</p>
            <button onclick="startGame()">${gameData.intro.button}</button>
        </div>
    `;
}

function startGame() {
    currentStep = 0;
    renderScenario();
}

// Moteur principal : Affiche le scénario en cours
function renderScenario() {
    if (currentStep >= gameData.scenarios.length) {
        renderConclusion();
        return;
    }

    const scenario = gameData.scenarios[currentStep];
    const app = document.getElementById('app');

    // Construction HTML dynamique
    let html = `
        <div class="card">
            <h2>Dossier #${scenario.id} : ${scenario.title}</h2>
            
            <div class="ceo-request">
                "${scenario.ceo_request}"
            </div>

            <img src="${scenario.image}" class="illustration" onerror="this.style.display='none'" alt="Illustration">

            <div class="theory-box">
                <div class="theory-title">Notion Clé : ${scenario.theory.concept}</div>
                <p><strong>Définition :</strong> ${scenario.theory.definition}</p>
                <p><strong>Analogie :</strong> ${scenario.theory.analogie}</p>
                <p><em>${scenario.theory.so_what}</em></p>
            </div>

            <div class="btn-group">
                ${scenario.choices.map((choice, index) => `
                    <button onclick="makeChoice(${index})">
                        ${choice.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    app.innerHTML = html;
}

// Gestion du clic sur un choix
window.makeChoice = function(choiceIndex) {
    const scenario = gameData.scenarios[currentStep];
    const choice = scenario.choices[choiceIndex];

    // Mise à jour des métriques
    metrics.innovation += choice.impact.innovation;
    metrics.co2 += choice.impact.co2;
    metrics.water += choice.impact.water;

    // Bornage des valeurs (0-100)
    metrics.innovation = Math.max(0, Math.min(100, metrics.innovation));
    metrics.co2 = Math.max(0, Math.min(100, metrics.co2));
    metrics.water = Math.max(0, Math.min(100, metrics.water));

    updateDashboard();

    // Feedback immédiat avant de passer à la suite
    showFeedback(choice.feedback);
};

function showFeedback(text) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card">
            <h3>Analyse de votre décision</h3>
            <p>${text}</p>
            <button onclick="nextStep()">Dossier Suivant</button>
        </div>
    `;
}

function nextStep() {
    currentStep++;
    renderScenario();
}

function renderConclusion() {
    const app = document.getElementById('app');
    let message = "";
    
    // Logique simple de victoire/défaite
    if (metrics.co2 < 60 && metrics.water < 60 && metrics.innovation > 40) {
        message = gameData.conclusion.success;
    } else {
        message = gameData.conclusion.failure;
    }

    app.innerHTML = `
        <div class="card">
            <h1>Audit Terminé</h1>
            <p>${message}</p>
            <div class="theory-box">
                <p>Score Final :</p>
                <ul>
                    <li>Innovation : ${metrics.innovation}/100</li>
                    <li>CO2 : ${metrics.co2}/100</li>
                    <li>Eau : ${metrics.water}/100</li>
                </ul>
            </div>
            <button onclick="location.reload()">${gameData.conclusion.restart}</button>
        </div>
    `;
}