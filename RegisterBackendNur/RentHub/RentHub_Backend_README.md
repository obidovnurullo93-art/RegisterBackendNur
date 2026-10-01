# RentHub --- Backend README

## 1. Цель проекта

RentHub --- сервис аренды вещей.

Frontend уже подготовлен и ожидает **ASP.NET Core Web API** по адресу:

``` text
/api
```

Твоя задача --- реализовать backend, который будет обслуживать:

-   регистрацию и авторизацию;
-   товары/объявления;
-   бронирования;
-   избранное;
-   отзывы;
-   профиль пользователя.

Главное правило разработки:

> Сначала Entity + EF Core + база данных → потом Service → потом
> Controller → потом проверка через Swagger → потом подключение
> Frontend.

------------------------------------------------------------------------

# 2. Рекомендуемый стек

Используй:

-   ASP.NET Core Web API
-   C#
-   Entity Framework Core
-   SQL Server
-   JWT Bearer Authentication
-   FluentValidation
-   AutoMapper --- по желанию
-   Swagger / OpenAPI

Пример структуры:

``` text
RentHub.Api
│
├── Controllers
│   ├── AuthController.cs
│   ├── ProductsController.cs
│   ├── BookingsController.cs
│   ├── FavoritesController.cs
│   ├── ReviewsController.cs
│   └── UsersController.cs
│
├── Data
│   └── AppDbContext.cs
│
├── Entities
│   ├── User.cs
│   ├── Product.cs
│   ├── Booking.cs
│   ├── Favorite.cs
│   └── Review.cs
│
├── DTOs
│   ├── Auth
│   ├── Products
│   ├── Bookings
│   ├── Favorites
│   └── Reviews
│
├── Services
│   ├── AuthService.cs
│   ├── ProductService.cs
│   ├── BookingService.cs
│   ├── FavoriteService.cs
│   └── ReviewService.cs
│
├── Interfaces
│   ├── IAuthService.cs
│   ├── IProductService.cs
│   ├── IBookingService.cs
│   ├── IFavoriteService.cs
│   └── IReviewService.cs
│
├── Validators
│
├── Mapping
│
└── Program.cs
```

------------------------------------------------------------------------

# 3. База данных

Минимальная схема:

``` text
User
 │
 ├──── Product
 │       │
 │       ├──── Booking
 │       ├──── Favorite
 │       └──── Review
 │
 ├──── Booking
 ├──── Favorite
 └──── Review
```

## User

``` text
Id
Name
Email
Phone
PasswordHash
CreatedAt
```

Не храни обычный пароль. Только хеш.

------------------------------------------------------------------------

## Product

``` text
Id
Name
Category
City
Description
PricePerDay
Terms
Image
CreatedAt
OwnerId
```

Связь:

``` text
User 1 ---- N Product
```

Один пользователь может иметь много объявлений.

------------------------------------------------------------------------

## Booking

``` text
Id
ProductId
UserId
StartDate
EndDate
TotalPrice
Status
CreatedAt
```

Связи:

``` text
User 1 ---- N Booking
Product 1 ---- N Booking
```

Пример статуса:

``` text
Pending
Approved
Rejected
Cancelled
Completed
```

Важно: **TotalPrice должен рассчитывать backend**, а не frontend.

Например:

``` text
pricePerDay = 1500
start = 10.09
end = 13.09

количество дней = 3

total = 1500 * 3 = 4500
```

------------------------------------------------------------------------

## Favorite

``` text
Id
UserId
ProductId
CreatedAt
```

Один пользователь не должен добавить один товар два раза.

Добавь уникальность:

``` text
UserId + ProductId
```

------------------------------------------------------------------------

## Review

``` text
Id
ProductId
UserId
Rating
Text
CreatedAt
```

`Rating`:

``` text
1–5
```

------------------------------------------------------------------------

# 4. Authentication

Frontend уже ожидает:

``` http
POST /api/auth/register
POST /api/auth/login
```

## POST /api/auth/register

Request:

``` json
{
  "name": "Ali",
  "email": "ali@mail.com",
  "phone": "+992900000001",
  "password": "123456"
}
```

Backend должен:

1.  проверить данные;
2.  проверить, что email свободен;
3.  захешировать пароль;
4.  создать User;
5.  создать JWT;
6.  вернуть токен.

Response:

``` json
{
  "token": "JWT_TOKEN"
}
```

------------------------------------------------------------------------

## POST /api/auth/login

Request:

``` json
{
  "email": "ali@mail.com",
  "password": "123456"
}
```

Backend:

``` text
Email → найти пользователя
       ↓
Проверить пароль
       ↓
Создать JWT
       ↓
Вернуть token
```

Response:

``` json
{
  "token": "JWT_TOKEN"
}
```

JWT желательно должен содержать claims:

``` text
sub / user id
name
email
phone
```

Frontend уже читает эти claims.

------------------------------------------------------------------------

# 5. Products API

Frontend использует:

``` http
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

------------------------------------------------------------------------

## GET /api/products

Получить список товаров.

Response желательно сделать таким:

``` json
[
  {
    "id": 1,
    "name": "Canon EOS 250D",
    "category": "camera",
    "city": "moscow",
    "description": "Хорошая камера",
    "pricePerDay": 1500,
    "rating": 4.8,
    "image": "https://..."
  }
]
```

Frontend использует:

``` text
id
name
category
city
description
pricePerDay
rating
image
```

------------------------------------------------------------------------

## GET /api/products/{id}

Получить один товар.

Кроме основных данных желательно вернуть:

``` text
owner / seller
reviews
rating
images
```

Пример:

``` json
{
  "id": 1,
  "name": "Canon EOS 250D",
  "category": "camera",
  "city": "moscow",
  "description": "Хорошая камера",
  "pricePerDay": 1500,
  "rating": 4.8,
  "image": "https://...",
  "seller": {
    "id": 10,
    "name": "Ali"
  },
  "reviews": []
}
```

------------------------------------------------------------------------

## POST /api/products

Требует JWT.

Frontend отправляет:

``` json
{
  "name": "Canon EOS 250D",
  "category": "camera",
  "city": "moscow",
  "description": "Хорошая камера",
  "pricePerDay": 1500,
  "terms": "Бережное использование",
  "image": "data:image/...",
  "images": [
    "data:image/..."
  ]
}
```

Backend должен взять `OwnerId` из JWT.

Не позволяй frontend передавать чужой `OwnerId`.

------------------------------------------------------------------------

## PUT /api/products/{id}

Требует JWT.

Редактировать объявление может только его владелец.

Проверка:

``` text
JWT UserId
     ↓
Product.OwnerId
     ↓
если совпадает → разрешить
если нет → 403 Forbidden
```

------------------------------------------------------------------------

## DELETE /api/products/{id}

Требует JWT.

Удалять товар может только владелец.

Если товар не найден:

``` http
404 Not Found
```

Если пользователь не владелец:

``` http
403 Forbidden
```

------------------------------------------------------------------------

# 6. Bookings API

Frontend использует:

``` http
GET    /api/bookings
POST   /api/bookings
DELETE /api/bookings/{id}
```

Все эти операции должны работать с авторизованным пользователем.

------------------------------------------------------------------------

## GET /api/bookings

Получить бронирования текущего пользователя.

Важно:

``` text
UserId берём из JWT
```

а не из query:

``` text
/api/bookings?userId=5
```

Так делать не надо.

------------------------------------------------------------------------

## POST /api/bookings

Frontend отправляет:

``` json
{
  "productId": 1,
  "startDate": "2026-09-20",
  "endDate": "2026-09-23"
}
```

Backend должен:

1.  найти Product;
2.  проверить даты;
3.  проверить доступность;
4.  определить цену;
5.  посчитать количество дней;
6.  посчитать TotalPrice;
7.  определить текущего UserId;
8.  создать Booking;
9.  поставить статус `Pending`.

Response:

``` json
{
  "id": 15,
  "productId": 1,
  "startDate": "2026-09-20",
  "endDate": "2026-09-23",
  "totalPrice": 4500,
  "status": "Pending"
}
```

------------------------------------------------------------------------

## Проверка дат

Нельзя:

``` text
startDate > endDate
```

Нельзя:

``` text
startDate == endDate
```

Минимально:

``` text
endDate > startDate
```

Также желательно запретить бронирование уже занятого периода.

------------------------------------------------------------------------

## DELETE /api/bookings/{id}

Отмена бронирования.

Проверить:

``` text
Booking.UserId == JWT UserId
```

Если нет:

``` http
403 Forbidden
```

------------------------------------------------------------------------

# 7. Favorites API

Frontend использует:

``` http
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/{id}
```

------------------------------------------------------------------------

## GET /api/favorites

Вернуть избранные товары текущего пользователя.

Frontend ожидает, что у записи есть:

``` text
id
productId
```

Например:

``` json
[
  {
    "id": 10,
    "productId": 5
  },
  {
    "id": 11,
    "productId": 8
  }
]
```

Можно дополнительно вернуть сам Product.

------------------------------------------------------------------------

## POST /api/favorites

Request:

``` json
{
  "productId": 5
}
```

Backend:

``` text
JWT UserId
+
ProductId
```

создаёт Favorite.

Если такой Favorite уже существует:

``` http
409 Conflict
```

------------------------------------------------------------------------

## DELETE /api/favorites/{id}

Удалить избранное.

Проверить владельца записи.

------------------------------------------------------------------------

# 8. Reviews API

Frontend использует:

``` http
GET    /api/reviews
POST   /api/reviews
DELETE /api/reviews/{id}
```

------------------------------------------------------------------------

## GET /api/reviews

Можно вернуть все отзывы.

Пример:

``` json
[
  {
    "id": 1,
    "productId": 5,
    "rating": 5,
    "text": "Отличный товар!",
    "author": "Ali",
    "date": "15.09.2026"
  }
]
```

Frontend использует:

``` text
productId
rating
text
author
date
```

------------------------------------------------------------------------

## POST /api/reviews

Request:

``` json
{
  "productId": 5,
  "rating": 5,
  "text": "Отличный товар!"
}
```

Backend должен взять `UserId` из JWT.

Проверить:

``` text
1 <= Rating <= 5
Text не пустой
Product существует
```

После добавления отзыва рейтинг товара можно считать:

``` text
AVG(Review.Rating)
```

------------------------------------------------------------------------

## DELETE /api/reviews/{id}

Удалить отзыв может:

``` text
автор отзыва
```

или, если добавишь роли:

``` text
Admin
```

------------------------------------------------------------------------

# 9. Users / Profile

Frontend имеет страницу:

``` text
profile.html
```

Пользователь должен видеть:

``` text
Name
Email
Phone
```

Добавь:

``` http
GET /api/users/me
```

Response:

``` json
{
  "id": 10,
  "name": "Ali",
  "email": "ali@mail.com",
  "phone": "+992900000001"
}
```

Для `/me` UserId берётся из JWT.

------------------------------------------------------------------------

# 10. Авторизация endpoint'ов

## Public

Без JWT:

``` text
GET /api/products
GET /api/products/{id}

POST /api/auth/register
POST /api/auth/login

GET /api/reviews
```

## Authorization required

С JWT:

``` text
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}

GET /api/bookings
POST /api/bookings
DELETE /api/bookings/{id}

GET /api/favorites
POST /api/favorites
DELETE /api/favorites/{id}

POST /api/reviews
DELETE /api/reviews/{id}

GET /api/users/me
```

------------------------------------------------------------------------

# 11. DTO

Не отдавай Entity напрямую из Controller.

Например:

``` csharp
public class CreateProductDto
{
    public string Name { get; set; }
    public string Category { get; set; }
    public string City { get; set; }
    public string Description { get; set; }
    public decimal PricePerDay { get; set; }
    public string? Terms { get; set; }
    public string? Image { get; set; }
    public List<string>? Images { get; set; }
}
```

И отдельный response:

``` csharp
public class ProductResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }
    public string City { get; set; }
    public string Description { get; set; }
    public decimal PricePerDay { get; set; }
    public double Rating { get; set; }
    public string? Image { get; set; }
}
```

------------------------------------------------------------------------

# 12. Validation

Используй FluentValidation.

Например:

``` text
Name
    required
    min 2

Email
    required
    valid email

Password
    minimum 6

PricePerDay
    > 0

Rating
    1..5

StartDate
    required

EndDate
    required
    > StartDate
```

------------------------------------------------------------------------

# 13. HTTP Status Codes

Используй нормально HTTP-коды.

``` text
200 OK
```

Успешный GET / PUT.

``` text
201 Created
```

Успешный POST создания.

``` text
400 Bad Request
```

Неверные данные.

``` text
401 Unauthorized
```

Нет JWT / JWT неправильный.

``` text
403 Forbidden
```

JWT есть, но нет права.

``` text
404 Not Found
```

Объект не найден.

``` text
409 Conflict
```

Например, Favorite уже существует или email занят.

``` text
500 Internal Server Error
```

Неожиданная ошибка сервера.

------------------------------------------------------------------------

# 14. Swagger

После запуска backend Swagger должен показывать примерно:

``` text
Auth
  POST /api/auth/register
  POST /api/auth/login

Products
  GET    /api/products
  GET    /api/products/{id}
  POST   /api/products
  PUT    /api/products/{id}
  DELETE /api/products/{id}

Bookings
  GET    /api/bookings
  POST   /api/bookings
  DELETE /api/bookings/{id}

Favorites
  GET    /api/favorites
  POST   /api/favorites
  DELETE /api/favorites/{id}

Reviews
  GET    /api/reviews
  POST   /api/reviews
  DELETE /api/reviews/{id}

Users
  GET /api/users/me
```

Сначала тестируй всё через Swagger.

Только когда API работает --- подключай frontend.

------------------------------------------------------------------------

# 15. Порядок разработки

## Этап 1 --- проект

Создай:

``` text
ASP.NET Core Web API
```

Подключи:

``` text
EF Core
SQL Server
Swagger
JWT
FluentValidation
```

------------------------------------------------------------------------

## Этап 2 --- Database

Создай:

``` text
User
Product
Booking
Favorite
Review
```

Настрой связи в:

``` text
AppDbContext
```

Потом:

``` powershell
Add-Migration InitialCreate
Update-Database
```

или через CLI:

``` powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

------------------------------------------------------------------------

# 16. Первый Controller --- Auth

Сделай:

``` text
AuthController
```

Endpoints:

``` text
POST /api/auth/register
POST /api/auth/login
```

После этого:

> Остановись и проверь регистрацию и login через Swagger.

Не переходи дальше, пока JWT не работает.

------------------------------------------------------------------------

# 17. Второй Controller --- Products

Сделай CRUD:

``` text
GET
GET/{id}
POST
PUT/{id}
DELETE/{id}
```

Сначала без сложных фильтров.

Проверь:

``` text
создать товар
получить товары
получить один товар
изменить
удалить
```

------------------------------------------------------------------------

# 18. Третий Controller --- Favorites

После Products:

``` text
GET /favorites
POST /favorites
DELETE /favorites/{id}
```

------------------------------------------------------------------------

# 19. Четвёртый Controller --- Bookings

После этого:

``` text
GET /bookings
POST /bookings
DELETE /bookings/{id}
```

Особое внимание:

``` text
даты
цена
пересечение бронирований
UserId
```

------------------------------------------------------------------------

# 20. Пятый Controller --- Reviews

``` text
GET /reviews
POST /reviews
DELETE /reviews/{id}
```

После добавления отзыва проверь рейтинг товара.

------------------------------------------------------------------------

# 21. Шестой Controller --- Users

``` text
GET /api/users/me
```

После этого страница профиля сможет получать данные с backend.

------------------------------------------------------------------------

# 22. Что НЕ надо делать

Не делай так:

``` csharp
[HttpPost]
public async Task<IActionResult> Create(Product product)
{
    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    return Ok(product);
}
```

Почему?

Controller начинает заниматься всем сразу.

Лучше:

``` text
Controller
    ↓
Service
    ↓
DbContext
    ↓
Database
```

------------------------------------------------------------------------

# 23. Что брать из JWT

Например:

``` csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

И затем:

``` csharp
var id = int.Parse(userId);
```

Не принимай `userId` от frontend для операций текущего пользователя.

Плохо:

``` json
{
  "userId": 5
}
```

Лучше:

``` text
JWT → UserId
```

Это очень важный момент для безопасности.

------------------------------------------------------------------------

# 24. Frontend → Backend

Frontend уже имеет единый API-клиент:

``` text
js/api.js
```

Он автоматически отправляет:

``` http
Authorization: Bearer JWT
```

если пользователь авторизован.

Поэтому backend должен настроить:

``` csharp
AddAuthentication()
AddJwtBearer()
```

и:

``` csharp
app.UseAuthentication();
app.UseAuthorization();
```

Порядок важен:

``` text
UseRouting
    ↓
UseAuthentication
    ↓
UseAuthorization
    ↓
MapControllers
```

------------------------------------------------------------------------

# 25. Важный момент с изображениями

Frontend сейчас отправляет:

``` text
image
images
```

в виде строк, включая данные изображения.

Для первой версии можно временно хранить:

``` text
Image
```

как string.

Но для нормального production-проекта лучше:

``` text
Frontend
   ↓
Upload image
   ↓
File/Object Storage
   ↓
URL
   ↓
Product.ImageUrl
```

Не делай хранение огромных Base64-изображений в SQL Server как финальную
архитектуру.

------------------------------------------------------------------------

# 26. MVP --- минимальная рабочая версия

Если хочешь быстрее получить работающий RentHub, сначала реализуй
только:

``` text
1. Register
2. Login
3. JWT
4. Products CRUD
5. Favorites
6. Bookings
7. Reviews
8. Profile
```

После этого frontend уже сможет работать с настоящим backend.

------------------------------------------------------------------------

# 27. Чек-лист

## Auth

-   [ ] Register
-   [ ] Login
-   [ ] Password hashing
-   [ ] JWT
-   [ ] Claims
-   [ ] Swagger Authorize

## Database

-   [ ] User
-   [ ] Product
-   [ ] Booking
-   [ ] Favorite
-   [ ] Review
-   [ ] Relationships
-   [ ] Migration
-   [ ] SQL Server

## Products

-   [ ] GET all
-   [ ] GET by id
-   [ ] POST
-   [ ] PUT
-   [ ] DELETE
-   [ ] Owner check

## Bookings

-   [ ] GET my bookings
-   [ ] POST
-   [ ] DELETE
-   [ ] Date validation
-   [ ] Price calculation
-   [ ] Status

## Favorites

-   [ ] GET
-   [ ] POST
-   [ ] DELETE
-   [ ] Duplicate protection

## Reviews

-   [ ] GET
-   [ ] POST
-   [ ] DELETE
-   [ ] Rating 1--5
-   [ ] Owner check
-   [ ] Product rating

## Users

-   [ ] GET /me

## Final

-   [ ] Swagger tested
-   [ ] Frontend connected
-   [ ] JWT works
-   [ ] Errors handled
-   [ ] Validation works
-   [ ] Authorization works

------------------------------------------------------------------------

# 28. Как работать по этой документации

Не пытайся написать весь backend сразу.

Работай так:

``` text
ШАГ 1
User Entity
       ↓
AppDbContext
       ↓
Migration
       ↓
Database
```

Потом:

``` text
ШАГ 2
Register
       ↓
Login
       ↓
JWT
       ↓
Swagger
```

Потом:

``` text
ШАГ 3
Product Entity
       ↓
ProductService
       ↓
ProductsController
       ↓
Swagger
```

И только после успешного теста переходи дальше.

------------------------------------------------------------------------

# 29. Главная схема проекта

Запомни эту цепочку:

``` text
Frontend
   ↓
HTTP Request
   ↓
Controller
   ↓
DTO
   ↓
Validation
   ↓
Service
   ↓
EF Core
   ↓
DbContext
   ↓
SQL Server
```

Ответ идёт обратно:

``` text
SQL Server
   ↓
EF Core
   ↓
Service
   ↓
DTO
   ↓
Controller
   ↓
JSON
   ↓
Frontend
```

Это основная архитектура, которую тебе нужно понять.

------------------------------------------------------------------------

# 30. Первый реальный шаг

Начинай не с Controller.

Первое задание:

``` text
Создать ASP.NET Core Web API проект
↓
Подключить SQL Server
↓
Создать User
↓
Создать Product
↓
Создать Booking
↓
Создать Favorite
↓
Создать Review
↓
Настроить связи
↓
Создать migration
↓
Создать БД
```

После этого делаем:

``` text
Auth + JWT
```

И только потом:

``` text
Products CRUD
```

**Не пиши весь код сразу. Делай по одному этапу и проверяй через
Swagger.**
