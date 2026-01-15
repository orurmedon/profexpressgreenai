let promptContext = "";

// Charger le prompt système au démarrage
fetch('assets/prompt.json')
    .then(r => r.json())
    .then(data => {
        promptContext = data.system_prompt;
    });

const widget = document.getElementById('chatbot-widget');
const toggleBtn = document.getElementById('chat-toggle');

toggleBtn.addEventListener('click', toggleChat);

function toggleChat() {
    widget.classList.toggle('active');
    // Change l'icône si ouvert/fermé
    toggleBtn.innerHTML = widget.classList.contains('active') ? '✖' : '💬';
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('msg', sender);
    div.innerText = text;
    const container = document.getElementById('chat-messages');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    // Simulation de chargement
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('msg', 'bot');
    loadingDiv.innerText = "...";
    loadingDiv.id = "loading-msg";
    document.getElementById('chat-messages').appendChild(loadingDiv);

    // --- LOGIQUE API (Simulation pour l'exercice) ---
    // Dans un vrai cas, on ferait un fetch vers votre backend ou l'API Vertex AI
    
    try {
        // Simulation d'une réflexion de Gemma 3
        const responseText = await simulateGemmaResponse(text);
        
        document.getElementById('loading-msg').remove();
        addMessage(responseText, 'bot');
        
    } catch (e) {
        document.getElementById('loading-msg').innerText = "Erreur de connexion.";
    }
}

// Fonction qui simule l'intelligence de Gemma (puisque nous n'avons pas de clé API active ici)
function simulateGemmaResponse(userText) {
    return new Promise(resolve => {
        setTimeout(() => {
            const lowerText = userText.toLowerCase();
            if (lowerText.includes("eau") || lowerText.includes("refroidissement")) {
                resolve("L'IA a très soif. Une conversation comme celle-ci consomme environ 50cl d'eau dans un datacenter pour le refroidissement.");
            } else if (lowerText.includes("co2") || lowerText.includes("carbone")) {
                resolve("L'entraînement de gros modèles émet autant de CO2 que 5 voitures sur toute leur vie. Préférez les petits modèles !");
            } else if (lowerText.includes("gemma")) {
                resolve("Je suis Gemma, une IA ouverte conçue par Google. J'essaie d'être efficiente.");
            } else {
                resolve("C'est une excellente question d'éthique numérique. L'important est de se demander : cet usage de l'IA est-il vraiment nécessaire ?");
            }
        }, 1000);
    });
}

// Pour connecter une VRAIE API (Exemple structurel)
/*
async function callRealGemma(text) {
    const response = await fetch('URL_DE_VOTRE_PROXY_API', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: promptContext + "\nUser: " + text
        })
    });
    const data = await response.json();
    return data.output;
}
*/