// =========================================================
// CONFIGURACIÓN DE LA API Y RESPALDO AUTOMÁTICO
// =========================================================
const API_URL = 'https://fake-coffee-api.vercel.app/api';

// Imágenes reales de café en alta calidad para reemplazar las URLs 404 de la API
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80"
];

// Respaldo con la estructura exacta de Fake Coffee API
const BACKUP_COFFEES = [
    {
        id: 1,
        name: "Signature Blend",
        description: "A rich, full-bodied coffee with notes of dark chocolate and black cherry. Grown on the slopes of a mist-covered mountain in Central America.",
        price: 12.99,
        region: "Central America",
        weight: 500,
        flavor_profile: ["Dark Chocolate", "Black Cherry"],
        roast_level: 3,
        image_url: FALLBACK_IMAGES[0]
    },
    {
        id: 2,
        name: "Golden Sunrise",
        description: "A smooth and bright coffee with a citrusy kick. Sourced from the rolling hills of Africa.",
        price: 10.99,
        region: "Africa",
        weight: 500,
        flavor_profile: ["Citrus"],
        roast_level: 2,
        image_url: FALLBACK_IMAGES[1]
    },
    {
        id: 3,
        name: "Rainforest Rhapsody",
        description: "An earthy and complex coffee with notes of toasted nuts and caramel. Sustainably grown in the lush rainforests of South America.",
        price: 14.99,
        region: "South America",
        weight: 500,
        flavor_profile: ["Citrus"],
        roast_level: 2,
        image_url: FALLBACK_IMAGES[2]
    },
    {
        id: 4,
        name: "Harvest Moon",
        description: "A smooth and earthy blend with notes of cocoa and hazelnut.",
        price: 9.99,
        region: "Central America",
        weight: 500,
        flavor_profile: ["Cocoa", "Hazelnut"],
        roast_level: 3,
        image_url: FALLBACK_IMAGES[3]
    },
    {
        id: 5,
        name: "Wildfire",
        description: "A bold and smoky coffee with notes of dark chocolate and molasses.",
        price: 12.99,
        region: "Africa",
        weight: 500,
        flavor_profile: ["Dark Chocolate", "Molasses"],
        roast_level: 5,
        image_url: FALLBACK_IMAGES[4]
    },
    {
        id: 6,
        name: "Walnut Wonder",
        description: "A smooth and nutty coffee from the slopes of South America.",
        price: 9.99,
        region: "South America",
        weight: 500,
        flavor_profile: ["Nutty", "Smooth"],
        roast_level: 3,
        image_url: FALLBACK_IMAGES[5]
    },
    {
        id: 7,
        name: "Breezy Beans",
        description: "This coffee blend is made from beans sourced from Honduras and Costa Rica. It is a light roast coffee with a bright and citrusy flavor profile.",
        price: 11.99,
        region: "Central America",
        weight: 500,
        flavor_profile: ["Citrusy"],
        roast_level: 1,
        image_url: FALLBACK_IMAGES[6]
    },
    {
        id: 8,
        name: "Indo-Viet Roast",
        description: "This coffee blend is made from beans sourced from Indonesia and Vietnam. It is a dark roast coffee with a bold and smoky flavor profile.",
        price: 13.99,
        region: "Asia Pacific",
        weight: 500,
        flavor_profile: ["Bold", "Smoky"],
        roast_level: 5,
        image_url: FALLBACK_IMAGES[7]
    }
];

let allCoffees = [];
let cart = JSON.parse(localStorage.getItem('coffee_cart')) || [];
let currentRoastFilter = 'all';

// Referencias al HTML
const featuredContainer = document.getElementById('featuredContainer');
const productsGrid = document.getElementById('productsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('#filterButtons button');
const coffeeModal = new bootstrap.Modal(document.getElementById('coffeeModal'));
const modalBodyContent = document.getElementById('modalBodyContent');

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchCoffees();
    updateCartUI();
});

// Función para asignar imagen válida si la URL original de la API da 404
function getSafeImage(coffee, index = 0) {
    if (!coffee.image_url || coffee.image_url.includes('iili.io')) {
        return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    }
    return coffee.image_url;
}

// 1. Consumir Fake Coffee API (sincronizado con cambios del Admin en localStorage)
async function fetchCoffees() {
    const storedCatalog = JSON.parse(localStorage.getItem('coffee_catalog'));

    if (storedCatalog && storedCatalog.length > 0) {
        allCoffees = storedCatalog;
        loadingSpinner.style.display = 'none';
        renderFeatured(allCoffees[0]);
        renderProducts(allCoffees);
        return;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API no disponible');
        const data = await response.json();
        
        allCoffees = data.map((coffee, idx) => ({
            ...coffee,
            image_url: getSafeImage(coffee, idx)
        }));
    } catch (error) {
        console.warn('Usando respaldo local de Fake Coffee API:', error.message);
        allCoffees = BACKUP_COFFEES;
    } finally {
        localStorage.setItem('coffee_catalog', JSON.stringify(allCoffees));
        loadingSpinner.style.display = 'none';
        renderFeatured(allCoffees[0]);
        renderProducts(allCoffees);
    }
}

// Convertir número de tueste (1-5) a texto
function getRoastLabel(level) {
    if (level <= 2) return 'Ligero';
    if (level === 3) return 'Medio';
    return 'Oscuro';
}

// 2. Renderizar tarjeta destacada del mes
function renderFeatured(coffee) {
    if (!coffee) return;
    const notes = coffee.flavor_profile ? coffee.flavor_profile.join(', ') : 'Notas clásicas';

    featuredContainer.innerHTML = `
        <div class="card coffee-card rounded-4 overflow-hidden shadow-sm border">
            <div class="row g-0 align-items-center">
                <div class="col-md-5 p-4 text-center" style="background-color: #EFE9E0;">
                    <span class="badge rounded-pill mb-3 px-3 py-2" style="background-color: var(--accent-coffee);">
                        Destacada del mes
                    </span>
                    <div>
                        <img src="${coffee.image_url}" alt="${coffee.name}" 
                             onerror="this.src='${FALLBACK_IMAGES[0]}'"
                             class="img-fluid rounded-3 shadow-sm" style="max-height: 220px; object-fit: cover;">
                    </div>
                </div>
                <div class="col-md-7 p-4 p-lg-5">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-uppercase small text-muted fw-semibold">${coffee.region} • ${coffee.weight}g</span>
                        <span class="fs-4 fw-bold" style="color: var(--accent-coffee);">$${coffee.price.toFixed(2)}</span>
                    </div>
                    <h3 class="font-serif fw-bold mb-2">${coffee.name}</h3>
                    <p class="text-muted small mb-3">${coffee.description}</p>
                    <p class="small mb-4">
                        <strong>Tueste:</strong> ${getRoastLabel(coffee.roast_level)} &nbsp;|&nbsp; 
                        <strong>Notas:</strong> ${notes}
                    </p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-coffee rounded-pill px-4" onclick="openCoffeeModal(${coffee.id})">Ver más</button>
                        <button class="btn btn-outline-coffee rounded-pill px-3" onclick="addToCart(${coffee.id})">
                            <i class="bi bi-plus-lg"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 3. Renderizar tarjetas del catálogo
function renderProducts(list) {
    productsGrid.innerHTML = '';

    if (list.length === 0) {
        productsGrid.innerHTML = `<div class="col-12 text-center text-muted py-5">No se encontraron cafés con ese filtro.</div>`;
        return;
    }

    list.forEach((coffee, idx) => {
        const notes = coffee.flavor_profile ? coffee.flavor_profile.slice(0, 2).join(', ') : '';
        const fallbackImg = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-lg-3';

        col.innerHTML = `
            <div class="card h-100 coffee-card rounded-4 overflow-hidden border shadow-sm">
                <div class="coffee-img-box position-relative p-0 overflow-hidden">
                    <span class="badge bg-white text-dark border position-absolute top-0 start-0 m-3 rounded-pill small shadow-sm" style="z-index: 2;">
                        ${coffee.region}
                    </span>
                    <img src="${coffee.image_url}" alt="${coffee.name}" 
                         onerror="this.src='${fallbackImg}'"
                         class="w-100 h-100" style="object-fit: cover; max-height: none;">
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h5 class="card-title font-serif fw-bold fs-6 mb-0">${coffee.name}</h5>
                        <span class="fw-bold" style="color: var(--accent-coffee);">$${coffee.price.toFixed(2)}</span>
                    </div>
                    <p class="text-muted small mb-2">Tueste: ${getRoastLabel(coffee.roast_level)}</p>
                    <div class="mb-3">
                        <span class="badge rounded-pill text-dark fw-normal" style="background-color: #EFE9E0;">
                            ${notes}
                        </span>
                    </div>
                    <div class="mt-auto d-flex gap-2">
                        <button class="btn btn-outline-coffee btn-sm rounded-pill flex-grow-1" onclick="openCoffeeModal(${coffee.id})">
                            Ver más
                        </button>
                        <button class="btn btn-coffee btn-sm rounded-circle" title="Agregar al carrito" onclick="addToCart(${coffee.id})">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        productsGrid.appendChild(col);
    });
}

// 4. Filtros por Tueste y Buscador
function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();

    const filtered = allCoffees.filter(coffee => {
        const matchesName = coffee.name.toLowerCase().includes(query) || 
                            coffee.region.toLowerCase().includes(query);
        
        let matchesRoast = true;
        if (currentRoastFilter === 'light') matchesRoast = coffee.roast_level <= 2;
        if (currentRoastFilter === 'medium') matchesRoast = coffee.roast_level === 3;
        if (currentRoastFilter === 'dark') matchesRoast = coffee.roast_level >= 4;

        return matchesName && matchesRoast;
    });

    renderProducts(filtered);
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRoastFilter = btn.dataset.roast;
        applyFilters();
    });
});

searchInput.addEventListener('input', applyFilters);

// 5. Modal de Detalle ("Ver más")
window.openCoffeeModal = function(id) {
    const coffee = allCoffees.find(c => c.id === id);
    if (!coffee) return;

    const flavors = coffee.flavor_profile 
        ? coffee.flavor_profile.map(f => `<span class="badge rounded-pill text-dark me-1" style="background-color: #EFE9E0;">${f}</span>`).join('')
        : '';

    modalBodyContent.innerHTML = `
        <div class="row align-items-center g-4">
            <div class="col-md-5 text-center rounded-4 p-0 overflow-hidden" style="background-color: #EFE9E0;">
                <img src="${coffee.image_url}" alt="${coffee.name}" 
                     onerror="this.src='${FALLBACK_IMAGES[0]}'"
                     class="img-fluid w-100" style="max-height: 280px; object-fit: cover;">
            </div>
            <div class="col-md-7">
                <span class="text-uppercase small text-muted fw-semibold">${coffee.region} • ${coffee.weight}g</span>
                <h3 class="font-serif fw-bold my-2">${coffee.name}</h3>
                <h4 class="fw-bold mb-3" style="color: var(--accent-coffee);">$${coffee.price.toFixed(2)}</h4>
                <p class="text-muted small">${coffee.description}</p>
                <div class="mb-3">
                    <strong class="small d-block mb-1">Notas de sabor:</strong>
                    ${flavors}
                </div>
                <p class="small mb-4"><strong>Nivel de tueste:</strong> ${getRoastLabel(coffee.roast_level)} (${coffee.roast_level}/5)</p>
                <button class="btn btn-coffee rounded-pill px-4 w-100" onclick="addToCart(${coffee.id}); coffeeModal.hide();">
                    <i class="bi bi-bag-plus me-2"></i> Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    coffeeModal.show();
};

// 6. Carrito de Compras
window.addToCart = function(id) {
    const coffee = allCoffees.find(c => c.id === id);
    if (!coffee) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: coffee.id, name: coffee.name, price: coffee.price, image: coffee.image_url, qty: 1 });
    }

    saveAndRenderCart();
};

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveAndRenderCart();
};

function saveAndRenderCart() {
    localStorage.setItem('coffee_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-muted text-center my-5">Tu carrito está vacío.</p>`;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="d-flex align-items-center gap-3 bg-white p-2 rounded-3 mb-2 border">
            <img src="${item.image}" alt="${item.name}" 
                 onerror="this.src='${FALLBACK_IMAGES[0]}'"
                 class="rounded-2" style="width: 50px; height: 50px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-0 small fw-bold">${item.name}</h6>
                <small class="text-muted">${item.qty} x $${item.price.toFixed(2)}</small>
            </div>
            <button class="btn btn-sm text-danger" onclick="removeFromCart(${item.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join('');
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) return alert('Agrega al menos un café a tu carrito.');

    const savedUser = JSON.parse(localStorage.getItem('coffee_user'));
    const orders = JSON.parse(localStorage.getItem('coffee_orders')) || [];

    const newOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customer: savedUser ? savedUser.name : 'Cliente Invitado',
        email: savedUser ? savedUser.email : 'Sin correo',
        date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: cart.reduce((acc, item) => acc + (item.price * item.qty), 0),
        status: 'Pendiente'
    };

    orders.unshift(newOrder);
    localStorage.setItem('coffee_orders', JSON.stringify(orders));

    alert(`¡Pedido ${newOrder.id} confirmado! El administrador ya puede verlo en su panel.`);
    cart = [];
    saveAndRenderCart();
});