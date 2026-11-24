document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const authNavContainer = document.getElementById('authNavContainer');

    // 1. Procesar formulario en login.html
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('userRole').value;
            const name = document.getElementById('userName').value.trim();
            const email = document.getElementById('userEmail').value.trim();

            localStorage.setItem('coffee_user', JSON.stringify({ name, email, role }));

            // Redirigir según el rol elegido
            if (role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // 2. Mostrar menú de usuario en la barra de navegación
    if (authNavContainer) {
        const savedUser = JSON.parse(localStorage.getItem('coffee_user'));
        if (savedUser) {
            const adminLink = savedUser.role === 'admin' 
                ? `<li><a class="dropdown-item small fw-semibold" href="admin.html"><i class="bi bi-speedometer2 me-1"></i> Panel Admin</a></li>
                   <li><a class="dropdown-item small" href="index.html"><i class="bi bi-shop me-1"></i> Vista Cliente</a></li>
                   <li><hr class="dropdown-divider"></li>`
                : '';

            authNavContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-coffee btn-sm rounded-pill dropdown-toggle px-3" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-check me-1"></i> ${savedUser.name} (${savedUser.role === 'admin' ? 'Admin' : 'Cliente'})
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                        <li><span class="dropdown-item-text small text-muted">${savedUser.email}</span></li>
                        <li><hr class="dropdown-divider"></li>
                        ${adminLink}
                        <li><button class="dropdown-item small text-danger" id="logoutBtn">Cerrar sesión</button></li>
                    </ul>
                </div>
            `;

            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('coffee_user');
                window.location.href = 'index.html';
            });
        }
    }
});