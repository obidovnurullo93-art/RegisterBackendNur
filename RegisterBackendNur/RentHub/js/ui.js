// ui.js — поведение, общее для шапки на каждой странице, плюс
// стандартные состояния "загрузка" / "ошибка" для любого контейнера,
// который наполняется данными с backend'а.

function updateAuthUI() {
    const loggedIn = isUserLoggedIn();
    const authBox = document.getElementById('navbarAuth');
    const userBox = document.getElementById('navbarUserMenu');
    if (authBox) authBox.style.display = loggedIn ? 'none' : 'flex';
    if (userBox) userBox.style.display = loggedIn ? 'flex' : 'none';
}

function initHeaderInteractions() {
    // Мобильное меню (гамбургер).
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navbarMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('show');
            hamburger.classList.toggle('active');
        });
    }

    // Выпадающее меню аккаунта.
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userMenuBtn.classList.toggle('active');
        });
        document.addEventListener('click', function (e) {
            if (!userMenuBtn.contains(e.target)) {
                userMenuBtn.classList.remove('active');
            }
        });
    }

    // Выход через шапку (есть почти на каждой странице).
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }
}

// Стандартный "загружаем..." для любого контейнера с данными с сервера.
function showLoading(container, message) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
        ${message ? `<p class="text-center">${message}</p>` : ''}
    `;
}

// Стандартное сообщение об ошибке запроса к API.
function showError(container, message) {
    container.innerHTML = `<div class="empty-state"><p>${message || 'Не удалось загрузить данные с сервера.'}</p></div>`;
}

document.addEventListener('DOMContentLoaded', initHeaderInteractions);
