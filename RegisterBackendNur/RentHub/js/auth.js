// auth.js — авторизация через реальный API.
// localStorage используется ТОЛЬКО для технического токена:
//   localStorage.setItem('token', token)
//   localStorage.getItem('token')
// Никакие бизнес-данные (пользователь, роли и т.п.) в localStorage не
// хранятся. Данные текущего пользователя (имя, email, id) читаются из
// payload уже сохранённого JWT — отдельного кеша для них нет.

function decodeToken(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

function isUserLoggedIn() {
    return !!localStorage.getItem('token');
}

// Достаёт данные текущего пользователя из claim'ов токена.
// Возвращает null, если токена нет или он повреждён/просрочен.
function getCurrentUser() {
    const payload = decodeToken(localStorage.getItem('token'));
    if (!payload) return null;

    return {
        id: payload.sub || payload.nameid || payload.id || null,
        name: payload.name || payload.unique_name || payload.email || '',
        email: payload.email || '',
        phone: payload.phone_number || payload.phone || '',
    };
}

// Вызывать в начале страниц, доступных только авторизованным.
function requireLogin() {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// POST /api/auth/login — тело { email, password }.
// Ожидаемый ответ: { token: "..." }.
async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (!data || !data.token) {
        throw new Error('Сервер не вернул токен авторизации.');
    }
    localStorage.setItem('token', data.token);
    return data;
}

// POST /api/auth/register — тело { name, email, phone, password }.
// Ожидаемый ответ: { token: "..." }.
async function register(userData) {
    const data = await api.post('/auth/register', userData);
    if (!data || !data.token) {
        throw new Error('Сервер не вернул токен авторизации.');
    }
    localStorage.setItem('token', data.token);
    return data;
}
