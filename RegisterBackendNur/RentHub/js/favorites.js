// favorites.js — избранное через реальный API:
// GET/POST /api/favorites, DELETE /api/favorites/{id}.
//
// Кеш ниже живёт ТОЛЬКО в памяти вкладки (обычная переменная, не
// localStorage) и нужен исключительно для того, чтобы сразу отрисовать
// закрашенное сердечко на карточках товара, не дожидаясь отдельного
// запроса на каждую карточку. При перезагрузке страницы кеш собирается
// заново из API — это не хранилище бизнес-данных.

let favoritesCache = new Map(); // productId -> id записи избранного

function isFavoritedCached(productId) {
    return favoritesCache.has(Number(productId));
}

// Подтягивает список избранного текущего пользователя в кеш.
// Для неавторизованных ничего не запрашивает.
async function loadFavoritesCache() {
    favoritesCache = new Map();

    if (!isUserLoggedIn()) {
        return favoritesCache;
    }

    const data = await api.get('/favorites');
    const list = Array.isArray(data) ? data : [];

    list.forEach(item => {
        const productId = Number(item.productId ?? item.product?.id ?? item.id);
        if (!Number.isNaN(productId)) {
            favoritesCache.set(productId, item.id ?? productId);
        }
    });

    return favoritesCache;
}

// Полный список избранного (используется страницей favorites.html).
async function getFavorites() {
    const data = await api.get('/favorites');
    return Array.isArray(data) ? data : [];
}

// Добавляет/убирает товар из избранного через API и держит кеш в
// актуальном состоянии. Возвращает true, если товар теперь в избранном.
async function toggleFavorite(productId) {
    const id = Number(productId);

    if (favoritesCache.has(id)) {
        const favoriteId = favoritesCache.get(id);
        await api.delete(`/favorites/${favoriteId}`);
        favoritesCache.delete(id);
        return false;
    }

    const created = await api.post('/favorites', { productId: id });
    favoritesCache.set(id, created && created.id !== undefined ? created.id : id);
    return true;
}
