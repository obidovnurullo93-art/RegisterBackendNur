// reviews.js — отзывы через реальный API:
// GET /api/reviews, POST /api/reviews, DELETE /api/reviews/{id}.

async function getReviews() {
    const data = await api.get('/reviews');
    return Array.isArray(data) ? data : [];
}

// Если backend не отдаёт отзывы вложенными в товар (product.reviews),
// эта функция достаёт их из общего списка по productId.
async function getReviewsForProduct(productId) {
    const all = await getReviews();
    return all.filter(r => Number(r.productId) === Number(productId));
}

// review: { productId, rating, text }.
async function createReview(review) {
    return api.post('/reviews', review);
}

async function deleteReviewRequest(id) {
    return api.delete(`/reviews/${id}`);
}
