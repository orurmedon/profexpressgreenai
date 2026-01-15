let lessonData = {};
let currentChapterIndex = 0;

async function startLesson() {
    if (!lessonData.chapters) {
        try {
            const res = await fetch('assets/lesson.json');
            lessonData = await res.json();
        } catch (e) {
            console.error("Erreur chargement structure leçon", e);
            return;
        }
    }
    renderLessonMenu();
}

function renderLessonMenu() {
    const container = document.getElementById('lesson-container');
    
    let html = `
        <h2>Programme de formation</h2>
        <p class="subtitle">Sélectionnez un module pour commencer.</p>
        <div class="chapter-grid">
    `;
    
    lessonData.chapters.forEach((chapter, index) => {
        html += `
            <div class="glass-card chapter-card" onclick="openChapter(${index})">
                <div class="chapter-number">0${index + 1}</div>
                <h3>${chapter.title}</h3>
                <div class="chapter-meta">${chapter.subsections.length} Leçons</div>
            </div>
        `;
    });

    html += `</div>
             <div style="text-align:center; margin-top:3rem;">
                <button onclick="router('game')" class="cta-btn">Passer l'examen pratique</button>
             </div>`;

    container.innerHTML = html;
}

// Fonction Principale : Charge le chapitre et ses Markdowns
async function openChapter(index) {
    currentChapterIndex = index;
    const chapter = lessonData.chapters[index];
    const container = document.getElementById('lesson-container');

    // Scroll en haut
    document.querySelector('main').scrollTop = 0;

    // 1. On prépare le squelette HTML (Titre + Conteneurs vides pour les sous-parties)
    let html = `
        <div class="lesson-header fade-in">
            <button onclick="renderLessonMenu()" class="back-link">← Retour au sommaire</button>
            <h1>${chapter.title}</h1>
        </div>
        <div class="lesson-content fade-in">
    `;

    // On crée les blocs HTML, mais le contenu texte est en chargement
    html += chapter.subsections.map((sub, idx) => `
        <div class="subsection glass-card" id="subsection-${index}-${idx}">
            <div class="subsection-text">
                <h3>${sub.subtitle}</h3>
                <div class="md-content">Chargement du cours...</div> 
            </div>
            <div class="subsection-visual">
                <img src="${sub.image}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'img-placeholder\\'>Infographie ${idx+1}</div>'">
            </div>
        </div>
    `).join('');

    // Footer navigation
    html += `</div><div class="lesson-footer">`;
    if (currentChapterIndex < lessonData.chapters.length - 1) {
        html += `<button onclick="nextChapter()" class="next-chapter-btn">Chapitre Suivant ➤</button>`;
    } else {
        html += `<button onclick="router('game')" class="next-chapter-btn finish-btn">Terminer & Lancer la Mission</button>`;
    }
    html += `</div>`;

    container.innerHTML = html;

    // 2. Une fois le HTML injecté, on va chercher les fichiers Markdown en asynchrone
    // On boucle sur chaque sous-partie pour remplir le texte
    for (let i = 0; i < chapter.subsections.length; i++) {
        await loadMarkdownContent(index + 1, i + 1, `subsection-${index}-${i}`);
    }
}

// Logique de récupération et conversion Markdown
async function loadMarkdownContent(chapterNum, partNum, elementId) {
    const targetDiv = document.querySelector(`#${elementId} .md-content`);
    const fileName = `assets/cours/chapitre_${chapterNum}_partie_${partNum}.md`;
    const fallbackName = `assets/cours/generic.md`;

    try {
        // Tente de charger le fichier spécifique
        let response = await fetch(fileName);
        
        // Si pas trouvé (404), on charge le générique
        if (!response.ok) {
            console.warn(`Fichier ${fileName} non trouvé, chargement du fallback.`);
            response = await fetch(fallbackName);
        }

        const markdownText = await response.text();
        
        // Utilisation de Marked.js pour convertir MD -> HTML
        // On sanitize (nettoie) pas ici car c'est votre propre contenu, donc sûr.
        targetDiv.innerHTML = marked.parse(markdownText);

    } catch (error) {
        targetDiv.innerHTML = "<p style='color:red'>Erreur de chargement du cours.</p>";
        console.error(error);
    }
}

function nextChapter() {
    currentChapterIndex++;
    openChapter(currentChapterIndex);
}