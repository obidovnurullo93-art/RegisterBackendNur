// validation.js — небольшие переиспользуемые валидаторы.
// Каждая страница сама выводит текст ошибки рядом с полем,
// этот файл только отвечает да/нет.

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhone(value) {
    return /^[+]?[\d\s()-]{7,}$/.test(String(value).trim());
}

function isValidPassword(value) {
    return String(value).length >= 6;
}
