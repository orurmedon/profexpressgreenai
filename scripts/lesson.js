async function startLesson() {
    const res = await fetch('assets/lesson.json');
    const data = await res.json();
    const container = document.getElementById('lesson-container');
    
    let html = `<div class="lesson-grid">`;
    
    data.chapters.forEach((chapter, index) => {
        html += `
            <div class="glass-card lesson-card fade-in" style="animation-delay: ${index * 0.1}s">
                <h3>${chapter.title}</h3>
                <ul>
                    ${chapter.points.map(pt => `<li>${pt}</li>`).join('')}
                </ul>
            </div>
        `;
    });

    html += `</div>
             <div style="text-align:center; margin-top:3rem;">
                <button onclick="router('game')" class="cta-btn">Passer à la Simulation (Jeu)</button>
             </div>`;

    container.innerHTML = html;
}