let quizzData = {};
let quizzScore = 0;
let currentQIndex = 0;

async function startQuizz() {
    const res = await fetch('assets/quizz.json');
    quizzData = await res.json();
    quizzScore = 0;
    currentQIndex = 0;
    renderQuestion();
}

function renderQuestion() {
    const container = document.getElementById('quizz-container');
    
    if (currentQIndex >= quizzData.questions.length) {
        showQuizzResults(container);
        return;
    }

    const q = quizzData.questions[currentQIndex];

    container.innerHTML = `
        <div class="glass-card fade-in centered-content">
            <div class="step-indicator">Question ${currentQIndex + 1} / ${quizzData.questions.length}</div>
            <h2>${q.question}</h2>
            <div class="quizz-choices">
                ${q.choices.map((choice, idx) => `
                    <button onclick="checkAnswer(${idx})" class="choice-btn">${choice}</button>
                `).join('')}
            </div>
        </div>
    `;
}

window.checkAnswer = function(selectedIndex) {
    const q = quizzData.questions[currentQIndex];
    const isCorrect = selectedIndex === q.correct;
    if (isCorrect) quizzScore++;

    const container = document.getElementById('quizz-container');
    container.innerHTML = `
        <div class="glass-card fade-in centered-content">
            <h1 style="color: ${isCorrect ? '#2ecc71' : '#e74c3c'}">
                ${isCorrect ? 'Correct !' : 'Oups...'}
            </h1>
            <p>${q.explanation}</p>
            <button onclick="nextQuestion()">Suivant</button>
        </div>
    `;
}

window.nextQuestion = function() {
    currentQIndex++;
    renderQuestion();
}

function showQuizzResults(container) {
    let msg = "";
    if (quizzScore < 5) msg = quizzData.results.bad;
    else if (quizzScore < 8) msg = quizzData.results.average;
    else msg = quizzData.results.good;

    msg = msg.replace("{score}", quizzScore);

    container.innerHTML = `
        <div class="glass-card fade-in centered-content">
            <h1>Résultats du Quiz</h1>
            <div class="score-circle">${quizzScore}/10</div>
            <p class="result-msg">${msg}</p>
            <div class="nav-actions">
                <button onclick="router('lesson')">Aller au Cours</button>
                <button onclick="router('home')">Retour Menu</button>
            </div>
        </div>
    `;
}