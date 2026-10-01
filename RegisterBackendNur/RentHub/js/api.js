// api.js
// Единая точка работы с backend'ом (ASP.NET Core Web API).
// Все запросы идут через fetch(). Если backend недоступен или вернул
// ошибку, наружу выбрасывается ApiError с сообщением
// "Не удалось загрузить данные с сервера." — страницы показывают его
// пользователю вместо падения тишиной.
//
// Меняйте только BASE_URL, когда адрес backend'а определится.

const API_BASE_URL = 'https://localhost:7208/api';

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function buildHeaders(hasBody) {
    const headers = {};
    const token = getToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (hasBody) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

async function parseResponseBody(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
}

async function handleResponse(response) {
    const data = await parseResponseBody(response);

    if (!response.ok) {
        const serverMessage = data && (data.message || data.title);
        throw new ApiError(serverMessage || 'Не удалось загрузить данные с сервера.', response.status);
    }

    return data;
}

async function apiRequest(method, endpoint, body) {
    const hasBody = body !== undefined && body !== null;

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: buildHeaders(hasBody),
            body: hasBody ? JSON.stringify(body) : undefined,
        });
    } catch (networkError) {
        // Сервер недоступен, нет сети, CORS и т.п.
        throw new ApiError('Не удалось загрузить данные с сервера.', 0);
    }

    return handleResponse(response);
}

const api = {
    get: (endpoint) => apiRequest('GET', endpoint),
    post: (endpoint, body) => apiRequest('POST', endpoint, body),
    put: (endpoint, body) => apiRequest('PUT', endpoint, body),
    delete: (endpoint) => apiRequest('DELETE', endpoint),
};
