let refData = {};

async function startRef() {
    if (!refData.categories) {
        try {
            const res = await fetch('assets/ref.json');
            refData = await res.json();
        } catch (e) {
            console.error("Erreur chargement références", e);
            return;
        }
    }
    renderRefPage();
}

function renderRefPage() {
    const container = document.getElementById('ref-container');
    
    // Header
    let html = `
        <div style="text-align:center; margin-bottom:3rem;">
            <h1>${refData.intro.title}</h1>
            <p class="subtitle">${refData.intro.subtitle}</p>
        </div>
        <div class="ref-grid">
    `;

    // Boucle sur les catégories
    refData.categories.forEach(cat => {
        html += `
            <div class="glass-card ref-card fade-in">
                <div class="ref-header">
                    <span class="ref-icon">${cat.icon}</span>
                    <h3>${cat.title}</h3>
                </div>
                <p class="ref-desc">${cat.description}</p>
                <div class="ref-list">
                    ${cat.links.map(link => `
                        <a href="${link.url}" target="_blank" class="ref-link-item">
                            <div class="link-title">${link.label} ↗</div>
                            <div class="link-meta">${link.author}</div>
                            <div class="link-note">${link.note}</div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += `</div>
             <div style="text-align:center; margin-top:3rem;">
                <button onclick="router('home')" class="back-btn">Retour Menu</button>
             </div>`;

    container.innerHTML = html;
}