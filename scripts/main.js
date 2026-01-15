// Point d'entrée global
document.addEventListener('DOMContentLoaded', () => {
    router('home'); // Affiche le menu au démarrage
});

window.router = function(viewName) {
    // 1. Cacher toutes les vues
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('sidebar').classList.remove('active'); // Cacher sidebar par défaut
    
    // 2. Afficher la vue demandée
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    // 3. Logique spécifique par vue
    if (viewName === 'home') {
        // Rien de spécial
    } else if (viewName === 'quizz') {
        startQuizz();
    } else if (viewName === 'lesson') {
        startLesson();
    } else if (viewName === 'game') {
        document.getElementById('sidebar').classList.add('active'); // Afficher sidebar
        // On vérifie si le jeu a déjà été init, sinon on le lance
        if (typeof window.initGame === 'function') {
            window.initGame(); 
        }
    }
    // --- AJOUT ICI ---
    else if (viewName === 'ref') {
        if (typeof window.startRef === 'function') startRef();
    }
};