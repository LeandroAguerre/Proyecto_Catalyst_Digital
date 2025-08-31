document.addEventListener('DOMContentLoaded', () => {

    const searchBar = document.getElementById('search-bar');
    const serviceCards = document.querySelectorAll('.service-card');

    searchBar.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        serviceCards.forEach(card => {
            const keywords = card.dataset.keywords;
            if (keywords.includes(searchTerm)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });

    
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            navButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const category = e.currentTarget.textContent.toLowerCase();
            serviceCards.forEach(card => {
                const keywords = card.dataset.keywords;
                if (category === 'todos' || keywords.includes(category)) {
                     card.classList.remove('hidden');
                } else {
                     card.classList.add('hidden');
                }
            });
            searchBar.value = '';
        });
    });

    // ================== REGISTRO ==================
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            
            if (pass !== confirm) {
                alert(" Las contraseñas no coinciden");
                return;
            }
            
            alert(" Registro exitoso (simulado)");
            formRegistro.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('registroModal'));
            modal.hide();
        });
    }

    // ================== LOGIN ==================
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            
            if (email === "" || pass === "") {
                alert(" Debes completar todos los campos");
                return;
            }

            //  Acá podrías validar contra un backend en el futuro
            alert(" Login exitoso (simulado)");
            formLogin.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modal.hide();
        });
    }
    
});
