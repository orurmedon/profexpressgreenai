let gameData = {};
let currentStep = 0;
let metrics = { innovation: 10, co2: 10, water: 10 };

document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/content.json')
        .then(response => response.json())
        .then(data => {
            gameData = data;
            initGame();
        });
});

function initGame() {
    updateDashboard();
    renderIntro();
}

// Fonction avancée pour gérer l'aspect visuel des jauges
function updateDashboard() {
    updateSingleBar('bar-innovation', 'val-inno', metrics.innovation, false); // false = plus c'est haut, mieux c'est
    updateSingleBar('bar-co2', 'val-co2', metrics.co2, true);       // true = plus c'est haut, pire c'est (danger)
    updateSingleBar('bar-water', 'val-water', metrics.water, true);
}

function updateSingleBar(barId, textId, value, isDangerMetric) {
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);
    
    // 1. Mise à jour de la largeur
    bar.style.width = value + '%';
    text.innerText = value + '%';

    // 2. Gestion des couleurs et classes d'état
    bar.className = 'progress-fill'; // Reset classes
    
    if (isDangerMetric) {
        if (value < 40) {
            bar.classList.add('safe');  // Vert/Bleu
        } else if (value < 75) {
            bar.classList.add('warning'); // Orange
        } else {
            bar.classList.add('critical'); // Rouge + Clignotement
        }
    } else {
        // Pour l'innovation, c'est l'inverse ou juste une couleur constante "Tech"
        bar.classList.add('tech'); 
    }
}

function renderIntro() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="glass-card fade-in">
            <h1>${gameData.intro.title}</h1>
            <p>${gameData.intro.text}</p>
            <button onclick="startGame()" style="margin-top:20px; width:100%">${gameData.intro.button}</button>
        </div>
    `;
}

function startGame() {
    currentStep = 0;
    renderScenario();
}

function renderScenario() {
    if (currentStep >= gameData.scenarios.length) { renderConclusion(); return; }
    
    const scenario = gameData.scenarios[currentStep];
    const app = document.getElementById('app');

    // On utilise ici l'image définie dans le JSON
    // Astuce : on ajoute un fallback (onerror) si l'image n'existe pas
    const imageHTML = scenario.image ? 
        `<div class="img-container fade-in">
            <img src="${scenario.image}" alt="Illustration" onerror="this.style.display='none'">
         </div>` : '';

    app.innerHTML = `
        <div class="glass-card slide-up">
            <div class="header-row">
                <small>DOSSIER ${scenario.id} / ${gameData.scenarios.length}</small>
                <span class="tag">CONFIDENTIEL</span>
            </div>
            
            <h2>${scenario.title}</h2>
            
            ${imageHTML}

            <div class="ceo-request">
                <span class="avatar">CEO</span>
                "${scenario.ceo_request}"
            </div>
            
            <div class="theory-block">
                <strong>⚡ Concept Clé : ${scenario.theory.concept}</strong>
                <p>${scenario.theory.definition}</p>
            </div>

            <div class="choices">
                ${scenario.choices.map((choice, index) => `
                    <button onclick="makeChoice(${index})">${choice.text}</button>
                `).join('')}
            </div>
        </div>
    `;
}

window.makeChoice = function(index) {
    const scenario = gameData.scenarios[currentStep];
    const choice = scenario.choices[index];
    
    // Mise à jour des scores avec bornage 0-100
    metrics.innovation = Math.min(100, Math.max(0, metrics.innovation + choice.impact.innovation));
    metrics.co2 = Math.min(100, Math.max(0, metrics.co2 + choice.impact.co2));
    metrics.water = Math.min(100, Math.max(0, metrics.water + choice.impact.water));
    
    updateDashboard();
    
    // Feedback
    document.getElementById('app').innerHTML = `
        <div class="glass-card fade-in" style="text-align:center">
            <div style="font-size:3rem; margin-bottom:1rem">
                ${choice.impact.co2 > 15 ? '⚠️' : '✅'}
            </div>
            <h3>Analyse d'Impact</h3>
            <p>${choice.feedback}</p>
            
            <div class="impact-summary">
                <span>Innovation: ${choice.impact.innovation > 0 ? '+' : ''}${choice.impact.innovation}</span>
                <span style="color:${choice.impact.co2 > 10 ? '#e74c3c' : '#2ecc71'}">CO2: +${choice.impact.co2}</span>
            </div>

            <button onclick="nextStep()" style="width:100%; margin-top:20px">Dossier Suivant ➤</button>
        </div>
    `;
}

window.nextStep = function() { currentStep++; renderScenario(); }

function renderConclusion() {
    let title = "Audit Terminé";
    let msg = "";
    
    if (metrics.co2 > 80 || metrics.water > 80) {
        title = "❌ Désastre Écologique";
        msg = "Votre technologie est avancée, mais la planète est à genoux.";
    } else if (metrics.innovation < 40) {
        title = "❌ Faillite Technique";
        msg = "L'empreinte est faible, mais votre produit est obsolète.";
    } else {
        title = "🏆 Équilibre Atteint";
        msg = "Bravo ! Vous avez concilié innovation et responsabilité (Green IT).";
    }

    document.getElementById('app').innerHTML = `
        <div class="glass-card fade-in">
            <h1>${title}</h1>
            <p>${msg}</p>
            <div class="final-scores">
                <div>Innov: ${metrics.innovation}%</div>
                <div>CO2: ${metrics.co2}%</div>
                <div>Eau: ${metrics.water}%</div>
            </div>
            <button onclick="location.reload()">Recommencer l'Audit</button>
        </div>
    `;
}