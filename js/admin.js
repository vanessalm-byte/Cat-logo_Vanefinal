const API_URL = 'https://fake-coffee-api.vercel.app/api';

const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
];

let coffees = [];
const productFormModal = new bootstrap.Modal(document.getElementById('productFormModal'));

// 1. Proteger la vista y cargar tanto productos como pedidos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    const savedUser = JSON.parse(localStorage.getItem('coffee_user'));
    if (!savedUser || savedUser.role !== 'admin') {
        alert('Acceso exclusivo para administradores. Inicia sesión como Administrador.');
        window.location.href = 'login.html';
        return;
    }

    await loadAdminProducts();
    renderOrdersTable();
});

// 2. Cargar productos desde localStorage o desde Fake Coffee API
async function loadAdminProducts() {
    const stored = JSON.parse(localStorage.getItem('coffee_catalog'));
    if (stored && stored.length > 0) {
        coffees = stored;
    } else {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            coffees = data.map((c, idx) => ({
                ...c,
                image_url: (!c.image_url || c.image_url.includes('iili.io')) ? DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length] : c.image_url
            }));
            localStorage.setItem('coffee_catalog', JSON.stringify(coffees));
        } catch (err) {
            console.error('Error cargando API en admin:', err);
        }
    }
    renderAdminTable();
}

function getRoastText(level) {
    if (level <= 2) return 'Ligero';
    if (level == 3) return 'Medio';
    return 'Oscuro';
}

// 3. Renderizar tabla de productos y estadísticas
function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    document.getElementById('statTotalProducts').textContent = coffees.length;

    const avg = coffees.length > 0 
        ? coffees.reduce((sum, c) => sum + Number(c.price), 0) / coffees.length 
        : 0;
    document.getElementById('statAvgPrice').textContent = `$${avg.toFixed(2)}`;

    const uniqueRegions = new Set(coffees.map(c => c.region));
    document.getElementById('statRegions').textContent = uniqueRegions.size;

    tbody.innerHTML = coffees.map(coffee => `
        <tr>
            <td class="ps-4">
                <div class="d-flex align-items-center gap-3">
                    <img src="${coffee.image_url}" alt="${coffee.name}" 
                         onerror="this.src='${DEFAULT_IMAGES[0]}'"
                         class="rounded-3" style="width: 48px; height: 48px; object-fit: cover;">
                    <div>
                        <div class="fw-bold font-serif">${coffee.name}</div>
                        <small class="text-muted">${coffee.weight}g</small>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-light text-dark border rounded-pill">${coffee.region}</span></td>
            <td>${getRoastText(coffee.roast_level)} (${coffee.roast_level}/5)</td>
            <td><small class="text-muted">${(coffee.flavor_profile || []).join(', ')}</small></td>
            <td class="fw-bold" style="color: var(--accent-coffee);">$${Number(coffee.price).toFixed(2)}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-coffee rounded-pill me-1" onclick="editCoffee(${coffee.id})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="deleteCoffee(${coffee.id})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 4. Abrir modal limpio para crear café
window.openFormModal = function() {
    document.getElementById('formModalTitle').textContent = 'Agregar Nuevo Café';
    document.getElementById('coffeeForm').reset();
    document.getElementById('coffeeId').value = '';
    productFormModal.show();
};

// 5. Cargar datos en el modal para editar
window.editCoffee = function(id) {
    const coffee = coffees.find(c => c.id === id);
    if (!coffee) return;

    document.getElementById('formModalTitle').textContent = 'Editar Café';
    document.getElementById('coffeeId').value = coffee.id;
    document.getElementById('coffeeName').value = coffee.name;
    document.getElementById('coffeeRegion').value = coffee.region;
    document.getElementById('coffeePrice').value = coffee.price;
    document.getElementById('coffeeRoast').value = coffee.roast_level;
    document.getElementById('coffeeWeight').value = coffee.weight;
    document.getElementById('coffeeFlavors').value = (coffee.flavor_profile || []).join(', ');
    document.getElementById('coffeeDesc').value = coffee.description;
    document.getElementById('coffeeImg').value = coffee.image_url;

    productFormModal.show();
};

// 6. Guardar creación o edición
document.getElementById('coffeeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const idVal = document.getElementById('coffeeId').value;
    const flavorsArray = document.getElementById('coffeeFlavors').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const imgInput = document.getElementById('coffeeImg').value.trim();

    const coffeeData = {
        id: idVal ? Number(idVal) : Date.now(),
        name: document.getElementById('coffeeName').value.trim(),
        region: document.getElementById('coffeeRegion').value.trim(),
        price: parseFloat(document.getElementById('coffeePrice').value),
        roast_level: parseInt(document.getElementById('coffeeRoast').value),
        weight: parseInt(document.getElementById('coffeeWeight').value),
        flavor_profile: flavorsArray,
        description: document.getElementById('coffeeDesc').value.trim(),
        image_url: imgInput || DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)]
    };

    if (idVal) {
        const index = coffees.findIndex(c => c.id === Number(idVal));
        if (index !== -1) coffees[index] = coffeeData;
    } else {
        coffees.unshift(coffeeData);
    }

    localStorage.setItem('coffee_catalog', JSON.stringify(coffees));
    renderAdminTable();
    productFormModal.hide();
});

// 7. Eliminar producto
window.deleteCoffee = function(id) {
    if (!confirm('¿Segura que quieres eliminar este café del catálogo?')) return;
    coffees = coffees.filter(c => c.id !== id);
    localStorage.setItem('coffee_catalog', JSON.stringify(coffees));
    renderAdminTable();
};

// 8. Botón para restaurar los datos originales de la API
document.getElementById('resetApiBtn').addEventListener('click', async () => {
    if (!confirm('¿Restaurar el catálogo original de Fake Coffee API? Se borrarán los cambios locales.')) return;
    localStorage.removeItem('coffee_catalog');
    await loadAdminProducts();
});

// 9. Tabla de Pedidos Recibidos
function renderOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('coffee_orders')) || [];
    const tbody = document.getElementById('ordersTableBody');
    const badge = document.getElementById('pendingOrdersBadge');

    const pendingCount = orders.filter(o => o.status === 'Pendiente').length;
    badge.textContent = pendingCount;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Aún no hay pedidos registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
        return `
            <tr>
                <td class="ps-4 fw-bold font-monospace">${order.id}</td>
                <td>
                    <div class="fw-semibold">${order.customer}</div>
                    <small class="text-muted">${order.email}</small>
                </td>
                <td><small>${order.date}</small></td>
                <td><small>${itemsSummary}</small></td>
                <td class="fw-bold" style="color: var(--accent-coffee);">$${order.total.toFixed(2)}</td>
                <td>
                    <select class="form-select form-select-sm rounded-pill" style="width: 145px;" onchange="changeOrderStatus('${order.id}', this.value)">
                        <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>🟡 Pendiente</option>
                        <option value="Preparando" ${order.status === 'Preparando' ? 'selected' : ''}>🔵 Preparando</option>
                        <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>🟢 Entregado</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

window.changeOrderStatus = function(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('coffee_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('coffee_orders', JSON.stringify(orders));
        renderOrdersTable();
    }
};