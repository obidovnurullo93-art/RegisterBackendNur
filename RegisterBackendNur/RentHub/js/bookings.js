// bookings.js — бронирования через реальный API:
// GET /api/bookings, POST /api/bookings, DELETE /api/bookings/{id}.

async function getBookings() {
    const data = await api.get('/bookings');
    return Array.isArray(data) ? data : [];
}

// booking: { productId, startDate, endDate } — цену и статус
// рассчитывает backend.
async function createBooking(booking) {
    return api.post('/bookings', booking);
}

async function cancelBookingRequest(id) {
    return api.delete(`/bookings/${id}`);
}
