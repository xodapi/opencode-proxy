# opencode-proxy

**[English](#english) · [Русский](#russian)**

OpenAI-compatible proxy for OpenCode Zen. Rotates models on each request. Zero dependencies, Node ≥ 18.

---

<a id="english"></a>
## English

### Run

Free models (no key needed):
```bash
npm start
```

Paid models:
```bash
export OPENCODE_ZEN_API_KEY=sk-zen-...
npm start
```

Listens on `http://localhost:3000`.

### Auth

The proxy itself has no auth — anything reaching the port can use it. Upstream auth is a single header `Authorization: Bearer <OPENCODE_ZEN_API_KEY>`, defaulting to `public` for free models.

### Endpoints

- `POST /v1/chat/completions` — proxy (OpenAI format)
- `GET /v1/models` — pool list
- `GET /health` — status

### Model selection

The `model` field in the request decides:
- omitted / `"auto"` / not in pool → next model in rotation
- in pool → that exact model

The chosen model is rewritten into the request and returned in the `X-Model-Used` header. `round-robin` (default) or `random`.

### Config (env vars)

| Var | Default |
|---|---|
| `OPENCODE_ZEN_API_KEY` | `public` |
| `PORT` | `3000` |
| `MODELS` | 5 free models (comma-separated) |
| `ROUTING` | `round-robin` (or `random`) |
| `UPSTREAM_URL` | `https://opencode.ai/zen/v1` |
| `UPSTREAM_TIMEOUT` | `30000` (ms) |

Default models: `big-pickle`, `deepseek-v4-flash-free`, `mimo-v2.5-free`, `north-mini-code-free`, `nemotron-3-ultra-free`.

### Tests

```bash
npm test
```

MIT.

---

<a id="russian"></a>
## Русский

### Запуск

Бесплатные модели (ключ не нужен):
```bash
npm start
```

Платные модели:
```bash
export OPENCODE_ZEN_API_KEY=sk-zen-...
npm start
```

Слушает на `http://localhost:3000`.

### Авторизация

У самого прокси авторизации нет — кто достучится до порта, тот и пользуется. Наверх уходит один заголовок `Authorization: Bearer <OPENCODE_ZEN_API_KEY>`, по умолчанию `public` для бесплатных моделей.

### Эндпоинты

- `POST /v1/chat/completions` — прокси (формат OpenAI)
- `GET /v1/models` — список пула
- `GET /health` — статус

### Выбор модели

Поле `model` в запросе решает:
- не указано / `"auto"` / нет в пуле → следующая модель по ротации
- есть в пуле → ровно эта модель

Выбранная модель переписывается в запрос и возвращается в заголовке `X-Model-Used`. `round-robin` (по умолчанию) или `random`.

### Конфиг (env)

| Переменная | По умолчанию |
|---|---|
| `OPENCODE_ZEN_API_KEY` | `public` |
| `PORT` | `3000` |
| `MODELS` | 5 бесплатных моделей (через запятую) |
| `ROUTING` | `round-robin` (или `random`) |
| `UPSTREAM_URL` | `https://opencode.ai/zen/v1` |
| `UPSTREAM_TIMEOUT` | `30000` (мс) |

Модели по умолчанию: `big-pickle`, `deepseek-v4-flash-free`, `mimo-v2.5-free`, `north-mini-code-free`, `nemotron-3-ultra-free`.

### Тесты

```bash
npm test
```

MIT.
