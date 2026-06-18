<a id="top"></a>

<div align="center">

# opencode-proxy

**OpenAI-compatible proxy for the OpenCode Zen API with automatic model rotation.**

![Node](https://img.shields.io/badge/node-%E2%89%A5%2018-339933?logo=node.js&logoColor=white)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Tests](https://img.shields.io/badge/tests-17%20passing-success)
![License](https://img.shields.io/badge/license-MIT-blue)

🌐 **[English](#english)**  ·  **[Русский](#russian)**

</div>

---

<a id="english"></a>

## English

> 🌐 **English**  ·  [Русский](#russian)

A tiny, zero-dependency HTTP proxy that sits in front of [OpenCode Zen](https://opencode.ai/zen) and speaks the **OpenAI Chat Completions** format. On every request it transparently picks a model from a pool using **round-robin** (or random) rotation — so you can spread load across several free models without changing your client code.

### ✨ Features

- **OpenAI-compatible** — works with any OpenAI client/SDK, just point `baseURL` at the proxy.
- **Automatic model rotation** — round-robin or random across a pool of models.
- **No API key required** for free Zen models (defaults to the `public` key).
- **Zero dependencies** — pure Node.js built-ins (`node:http`, global `fetch`, `node:test`).
- **Transparent passthrough** — upstream status code and body are forwarded as-is, with an `X-Model-Used` header so you always know which model answered.
- **Configurable** via environment variables, with sensible defaults.

### 📋 Requirements

- **Node.js ≥ 18** (uses the built-in global `fetch`, `node --test`, and private class fields).

### 🚀 Quick start (free models, no key)

1. **Clone & enter the project:**
   ```bash
   git clone <repo-url> opencode-proxy
   cd opencode-proxy
   ```
2. **Start the proxy** (no install needed — there are no dependencies):
   ```bash
   npm start
   ```
3. **You should see:**
   ```
   OpenCode Proxy running on http://localhost:3000
   Models: big-pickle, deepseek-v4-flash-free, mimo-v2.5-free, north-mini-code-free, nemotron-3-ultra-free
   Routing: round-robin
   Upstream: https://opencode.ai/zen/v1
   ```
4. **Send your first request** (note: no `model` field needed — the proxy picks one):
   ```bash
   curl http://localhost:3000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{ "messages": [{ "role": "user", "content": "Hello!" }] }'
   ```
   Check the `X-Model-Used` response header to see which model handled the request. Run it a few times to watch the rotation in action.

### 🔑 Using paid models (with an API key)

Paid models require a key from [opencode.ai/zen](https://opencode.ai/zen):

```bash
export OPENCODE_ZEN_API_KEY=sk-zen-...
npm start
```

The key is sent upstream as `Authorization: Bearer <key>` on every request.

### 🔁 How model rotation works

When a request arrives, the proxy decides which model to use based on the `model` field you send:

| Incoming `model` field        | What the proxy does                          |
| ----------------------------- | -------------------------------------------- |
| *(omitted)*                   | Picks the **next** model in the rotation     |
| `"auto"`                      | Picks the **next** model in the rotation     |
| A model **in the pool**       | Uses **that exact** model (no rotation)      |
| A model **not in the pool**   | Falls back to the **next** model in rotation |

- **`round-robin`** (default): cycles through the pool in order — model 1, 2, 3, 1, 2, …
- **`random`**: picks a random model from the pool on each request.

The proxy rewrites the request's `model` field to the selected one before forwarding it upstream.

### 📡 Endpoints

| Method | Path                    | Description                                          |
| ------ | ----------------------- | ---------------------------------------------------- |
| `POST` | `/v1/chat/completions`  | Main proxy endpoint (OpenAI Chat Completions format) |
| `GET`  | `/v1/models`            | Lists the models currently in the pool               |
| `GET`  | `/health`               | Health check — returns `{ "status": "ok", ... }`     |

Any other route returns `404`.

### ⚙️ Configuration

All configuration is done through environment variables (an `.env.example` is included for reference):

| Variable                | Default                        | Description                                          |
| ----------------------- | ------------------------------ | ---------------------------------------------------- |
| `OPENCODE_ZEN_API_KEY`  | `public`                       | API key (not required for free models)               |
| `PORT`                  | `3000`                         | Port the proxy listens on                            |
| `MODELS`                | *(the 5 free models below)*    | Comma-separated list of models in the pool           |
| `ROUTING`               | `round-robin`                  | Rotation strategy: `round-robin` or `random`         |
| `UPSTREAM_URL`          | `https://opencode.ai/zen/v1`   | Upstream API base URL                                |
| `UPSTREAM_TIMEOUT`      | `30000`                        | Upstream request timeout in milliseconds             |

**Default model pool:**

- `big-pickle`
- `deepseek-v4-flash-free`
- `mimo-v2.5-free`
- `north-mini-code-free`
- `nemotron-3-ultra-free`

### 🧩 Use it with the OpenAI SDK

Just point the SDK's `baseURL` at the proxy:

```js
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/v1',
  apiKey: 'public', // ignored by the proxy for free models
});

const res = await client.chat.completions.create({
  model: 'auto', // let the proxy rotate for you
  messages: [{ role: 'user', content: 'Write a haiku about proxies.' }],
});

console.log(res.choices[0].message.content);
```

### ⚠️ Error responses

| Status | When it happens                                   |
| ------ | ------------------------------------------------- |
| `400`  | Request body is not valid JSON                    |
| `404`  | Unknown route or method                           |
| `502`  | Upstream request failed, or timed out (see below) |

On timeout the proxy aborts the upstream call after `UPSTREAM_TIMEOUT` ms and returns `502` with `{ "error": "Upstream request failed", "message": "Upstream timeout" }`.

### 🧪 Tests

```bash
npm test
```

Runs the built-in Node test runner (`node --test`). The suite covers the router, config loading, and the proxy's request handling (**17 tests**).

### 📁 Project structure

```
opencode-proxy/
├── src/
│   ├── index.js     # HTTP server entry point
│   ├── config.js    # Loads config from environment variables
│   ├── router.js    # Model rotation logic (round-robin / random)
│   └── proxy.js     # Request handling & upstream forwarding
├── tests/
│   └── proxy.test.js
├── .env.example
└── package.json
```

### 📄 License

MIT.

<div align="right"><sub><a href="#top">⬆ Back to top</a>  ·  <a href="#russian">Русская версия</a></sub></div>

---

<a id="russian"></a>

## Русский

> [English](#english)  ·  🌐 **Русский**

Крошечный HTTP-прокси без зависимостей, который встаёт перед [OpenCode Zen](https://opencode.ai/zen) и говорит на языке **OpenAI Chat Completions**. На каждый запрос он прозрачно выбирает модель из пула по принципу **round-robin** (или случайно) — так можно распределять нагрузку между несколькими бесплатными моделями, не меняя код клиента.

### ✨ Возможности

- **Совместимость с OpenAI** — работает с любым клиентом/SDK OpenAI, достаточно указать `baseURL` на прокси.
- **Автоматическая ротация моделей** — round-robin или случайный выбор из пула.
- **API-ключ не нужен** для бесплатных моделей Zen (по умолчанию используется ключ `public`).
- **Ноль зависимостей** — только встроенные модули Node.js (`node:http`, глобальный `fetch`, `node:test`).
- **Прозрачный проброс** — статус и тело ответа от upstream передаются как есть, плюс заголовок `X-Model-Used`, чтобы всегда знать, какая модель ответила.
- **Гибкая настройка** через переменные окружения с разумными значениями по умолчанию.

### 📋 Требования

- **Node.js ≥ 18** (используются встроенный глобальный `fetch`, `node --test` и приватные поля классов).

### 🚀 Быстрый старт (бесплатные модели, без ключа)

1. **Клонируйте и зайдите в проект:**
   ```bash
   git clone <repo-url> opencode-proxy
   cd opencode-proxy
   ```
2. **Запустите прокси** (установка не нужна — зависимостей нет):
   ```bash
   npm start
   ```
3. **Вы должны увидеть:**
   ```
   OpenCode Proxy running on http://localhost:3000
   Models: big-pickle, deepseek-v4-flash-free, mimo-v2.5-free, north-mini-code-free, nemotron-3-ultra-free
   Routing: round-robin
   Upstream: https://opencode.ai/zen/v1
   ```
4. **Отправьте первый запрос** (поле `model` указывать не нужно — прокси выберет сам):
   ```bash
   curl http://localhost:3000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{ "messages": [{ "role": "user", "content": "Привет!" }] }'
   ```
   Загляните в заголовок ответа `X-Model-Used`, чтобы увидеть, какая модель обработала запрос. Повторите несколько раз — увидите ротацию в действии.

### 🔑 Использование платных моделей (с API-ключом)

Платным моделям нужен ключ с [opencode.ai/zen](https://opencode.ai/zen):

```bash
export OPENCODE_ZEN_API_KEY=sk-zen-...
npm start
```

Ключ отправляется на upstream в заголовке `Authorization: Bearer <ключ>` при каждом запросе.

### 🔁 Как работает ротация моделей

Когда приходит запрос, прокси решает, какую модель использовать, по полю `model`, которое вы прислали:

| Поле `model` в запросе          | Что делает прокси                              |
| ------------------------------- | ---------------------------------------------- |
| *(не указано)*                  | Берёт **следующую** модель из ротации          |
| `"auto"`                        | Берёт **следующую** модель из ротации          |
| Модель **из пула**              | Использует **именно эту** модель (без ротации) |
| Модель **не из пула**           | Откатывается к **следующей** модели в ротации  |

- **`round-robin`** (по умолчанию): перебирает пул по кругу — модель 1, 2, 3, 1, 2, …
- **`random`**: на каждый запрос выбирает случайную модель из пула.

Перед отправкой на upstream прокси перезаписывает поле `model` в запросе на выбранную модель.

### 📡 Эндпоинты

| Метод  | Путь                    | Описание                                              |
| ------ | ----------------------- | ----------------------------------------------------- |
| `POST` | `/v1/chat/completions`  | Основной эндпоинт прокси (формат OpenAI Chat Completions) |
| `GET`  | `/v1/models`            | Список моделей, которые сейчас в пуле                  |
| `GET`  | `/health`               | Проверка статуса — возвращает `{ "status": "ok", ... }` |

Любой другой маршрут возвращает `404`.

### ⚙️ Настройка

Вся конфигурация задаётся через переменные окружения (для примера приложен `.env.example`):

| Переменная              | По умолчанию                   | Описание                                              |
| ----------------------- | ------------------------------ | ----------------------------------------------------- |
| `OPENCODE_ZEN_API_KEY`  | `public`                       | API-ключ (не обязателен для бесплатных моделей)       |
| `PORT`                  | `3000`                         | Порт, на котором слушает прокси                        |
| `MODELS`                | *(5 бесплатных моделей ниже)*  | Список моделей пула через запятую                      |
| `ROUTING`               | `round-robin`                  | Стратегия ротации: `round-robin` или `random`          |
| `UPSTREAM_URL`          | `https://opencode.ai/zen/v1`   | Базовый URL upstream-API                               |
| `UPSTREAM_TIMEOUT`      | `30000`                        | Таймаут запроса к upstream в миллисекундах             |

**Пул моделей по умолчанию:**

- `big-pickle`
- `deepseek-v4-flash-free`
- `mimo-v2.5-free`
- `north-mini-code-free`
- `nemotron-3-ultra-free`

### 🧩 Использование с OpenAI SDK

Просто укажите `baseURL` SDK на прокси:

```js
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/v1',
  apiKey: 'public', // прокси игнорирует его для бесплатных моделей
});

const res = await client.chat.completions.create({
  model: 'auto', // пусть прокси ротирует за вас
  messages: [{ role: 'user', content: 'Напиши хайку про прокси.' }],
});

console.log(res.choices[0].message.content);
```

### ⚠️ Ответы с ошибками

| Статус | Когда возникает                                    |
| ------ | -------------------------------------------------- |
| `400`  | Тело запроса — невалидный JSON                     |
| `404`  | Неизвестный маршрут или метод                      |
| `502`  | Запрос к upstream упал или истёк таймаут (см. ниже) |

При таймауте прокси прерывает запрос к upstream через `UPSTREAM_TIMEOUT` мс и возвращает `502` с телом `{ "error": "Upstream request failed", "message": "Upstream timeout" }`.

### 🧪 Тесты

```bash
npm test
```

Запускает встроенный тест-раннер Node (`node --test`). Набор покрывает роутер, загрузку конфигурации и обработку запросов прокси (**17 тестов**).

### 📁 Структура проекта

```
opencode-proxy/
├── src/
│   ├── index.js     # Точка входа HTTP-сервера
│   ├── config.js    # Загрузка конфигурации из переменных окружения
│   ├── router.js    # Логика ротации моделей (round-robin / random)
│   └── proxy.js     # Обработка запросов и проброс на upstream
├── tests/
│   └── proxy.test.js
├── .env.example
└── package.json
```

### 📄 Лицензия

MIT.

<div align="right"><sub><a href="#top">⬆ Наверх</a>  ·  <a href="#english">English version</a></sub></div>
