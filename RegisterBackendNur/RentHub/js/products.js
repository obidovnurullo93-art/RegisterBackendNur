// products.js — товары через реальный API:
// GET /api/products, GET /api/products/{id}, POST /api/products,
// PUT /api/products/{id}, DELETE /api/products/{id}.
// Плюс единая функция отрисовки карточки товара, используемая на
// главной, в каталоге и в избранном.

// Подписи для значений категории/города, которые приходят с backend'а
// (совпадают со значениями <select> на странице создания объявления).
// Это UI-константы, а не бизнес-данные, поэтому мокам не замена.
const CATEGORY_LABELS = {
    auto: 'Авто',
    tech: 'Техника',
    camera: 'Камеры',
    games: 'Игры',
    sport: 'Спорт',
    tools: 'Инструменты',
    tourism: 'Туризм',
};

const CITY_LABELS = {
    moscow: 'Москва',
    spb: 'Санкт-Петербург',
    novosibirsk: 'Новосибирск',
    ekaterinburg: 'Екатеринбург',
    kazan: 'Казань',
};

async function getProducts() {
    const data = await api.get('/products');
    return Array.isArray(data) ? data : [];
}

async function getProductById(id) {
    return api.get(`/products/${id}`);
}

async function createProduct(product) {
    return api.post('/products', product);
}

async function updateProduct(id, product) {
    return api.put(`/products/${id}`, product);
}

async function deleteProductRequest(id) {
    return api.delete(`/products/${id}`);
}

// Строит карточку товара: изображение, название, категория, город,
// цена/день, рейтинг, кнопка "Подробнее" и переключатель "избранное".
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const favActive = isFavoritedCached(product.id) ? ' active' : '';
    const categoryLabel = CATEGORY_LABELS[product.category] || product.category || '';
    const cityLabel = CITY_LABELS[product.city] || product.city || '';

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'https://via.placeholder.com/400x300'}" alt="${product.name}">
            <button class="favorite-btn${favActive}" title="Добавить в избранное" data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="product-info">
            <a href="product.html?id=${product.id}" style="color:inherit;text-decoration:none;">
                <span class="product-category">${categoryLabel}</span>
                <h3 class="product-name">${product.name}</h3>
            </a>
            <div class="card-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${cityLabel}</span>
                <span class="product-rating"><i class="fas fa-star"></i> ${product.rating ?? '—'}</span>
            </div>
            <div class="product-footer">
                <div>
                    <span class="product-price">${product.pricePerDay} ₽</span>
                    <span class="product-price-label">за день</span>
                </div>
                <a href="product.html?id=${product.id}" class="btn btn-outline product-btn">Подробнее</a>
            </div>
        </div>
    `;

    const favBtn = card.querySelector('.favorite-btn');
    favBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!isUserLoggedIn()) {
            alert('Пожалуйста, войдите в систему, чтобы добавить в избранное.');
            window.location.href = 'login.html';
            return;
        }

        favBtn.disabled = true;
        try {
            const nowActive = await toggleFavorite(product.id);
            favBtn.classList.toggle('active', nowActive);
        } catch (err) {
            alert(err.message || 'Не удалось загрузить данные с сервера.');
        } finally {
            favBtn.disabled = false;
        }
    });

    return card;
}
