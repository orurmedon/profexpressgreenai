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

// VUE 1 : MENU AVEC IMAGES DE FOND
function renderLessonMenu() {
    const container = document.getElementById('lesson-container');
    
    let html = `
        <div style="text-align:center; margin-bottom:3rem;">
            <h2>Programme de formation</h2>
            <p class="subtitle">Sélectionnez un module pour commencer.</p>
        </div>
        <div class="chapter-grid">
    `;
    
    lessonData.chapters.forEach((chapter, index) => {
        // Astuce : On prend l'image de la première sous-partie pour illustrer le chapitre
        // Si pas d'image, on met une couleur par défaut
        const coverImage = chapter.subsections[0]?.image || '';
        const bgStyle = coverImage ? `background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('${coverImage}'); background-size: cover; background-position: center;` : '';

        html += `
            <div class="glass-card chapter-card" onclick="openChapter(${index})" style="${bgStyle}">
                <div class="chapter-number">0${index + 1}</div>
                <h3>${chapter.title}</h3>
                <div class="chapter-meta">
                    ${chapter.subsections.length} Sections
                </div>
            </div>
        `;
    });

    html += `</div>
             <div style="text-align:center; margin-top:4rem;">
                <button onclick="router('game')" class="cta-btn">Passer l'examen pratique</button>
             </div>`;

    container.innerHTML = html;
}

// VUE 2 : LEÇON PLEINE PAGE (Verticale)
async function openChapter(index) {
    currentChapterIndex = index;
    const chapter = lessonData.chapters[index];
    const container = document.getElementById('lesson-container');

    document.querySelector('main').scrollTop = 0;

    let html = `
        <div class="lesson-header fade-in">
            <button onclick="renderLessonMenu()" class="back-link">← Retour au sommaire</button>
            <h1>${chapter.title}</h1>
        </div>
        <div class="lesson-content fade-in">
    `;

    // Boucle sur les sous-parties
    html += chapter.subsections.map((sub, idx) => `
        <div class="subsection" id="subsection-${index}-${idx}">
            
            <div class="subsection-text">
                <h3>${sub.subtitle}</h3>
                
                <div class="subsection-visual">
                    <img src="${sub.image}" onerror="this.style.display='none'">
                </div>

                <div class="md-content">Chargement du cours...</div> 
            </div>

        </div>
    `).join('');

    html += `</div><div class="lesson-footer">`;
    
    if (currentChapterIndex < lessonData.chapters.length - 1) {
        html += `<button onclick="nextChapter()" class="next-chapter-btn">Chapitre Suivant ➤</button>`;
    } else {
        html += `<button onclick="router('game')" class="next-chapter-btn finish-btn">Lancer la Mission</button>`;
    }
    html += `</div>`;

    container.innerHTML = html;

    // Chargement asynchrone des Markdowns
    for (let i = 0; i < chapter.subsections.length; i++) {
        await loadMarkdownContent(index + 1, i + 1, `subsection-${index}-${i}`);
    }
}

async function loadMarkdownContent(chapterNum, partNum, elementId) {
    const targetDiv = document.querySelector(`#${elementId} .md-content`);
    const fileName = `assets/cours/chapitre_${chapterNum}_partie_${partNum}.md`;
    const fallbackName = `assets/cours/generic.md`;

    try {
        let response = await fetch(fileName);
        if (!response.ok) response = await fetch(fallbackName);
        const markdownText = await response.text();
        targetDiv.innerHTML = marked.parse(markdownText);
    } catch (error) {
        targetDiv.innerHTML = "<p>Contenu indisponible.</p>";
    }
}

function nextChapter() {
    currentChapterIndex++;
    openChapter(currentChapterIndex);
}