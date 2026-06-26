# 🌐 OpenCode Proxy

<p align="center">
  <a href="https://github.com/xodapi/opencode-proxy"><img src="https://img.shields.io/github/stars/xodapi/opencode-proxy?style=flat-square&logo=github&color=yellow" alt="Stars"></a>
  <a href="https://github.com/xodapi/opencode-proxy/blob/main/LICENSE"><img src="https://img.shields.io/github/license/xodapi/opencode-proxy?style=flat-square&logo=github&color=blue" alt="License"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D%2018.0.0-green?style=flat-square&logo=node.js" alt="Node Version">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey?style=flat-square&logo=windows" alt="Platform Support">
  <img src="https://img.shields.io/badge/tests-89%20passing-brightgreen?style=flat-square&logo=jest" alt="Tests Status">
  <img src="https://img.shields.io/badge/code%20style-standard-brightgreen?style=flat-square&logo=javascript" alt="Code Style">
</p>

---

## 🇷🇺 Руководство пользователя (Russian Setup)

**OpenCode Proxy** — это легковесный локальный прокси-сервер для бесплатного пула моделей OpenCode Zen без внешних зависимостей. Он работает на локальном компьютере, по умолчанию слушает порт `127.0.0.1:3000` и предоставляет OpenAI-совместимый интерфейс. Это позволяет бесшовно использовать качественные бесплатные модели в **OpenCode Desktop** и **Factory Droid** (для Missions и Validation).

> [!IMPORTANT]
> Данный проект является независимой разработкой сообщества. Он не связан с официальной командой OpenCode, не спонсируется и не поддерживается ими. Доступность бесплатных моделей полностью контролируется апстримом OpenCode Zen.

---

### ✨ Ключевые особенности

- **⚡ Без внешних зависимостей**: Написан исключительно на стандартной библиотеке Node.js (никаких `node_modules` или сложных настроек Python).
- **🔀 Умная балансировка (Routing)**: Автоматическое переключение моделей по стратегиям `round-robin` (циклический перебор) или `random` (случайный выбор), если запрошенная модель перегружена или недоступна.
- **⏱️ Exponential Backoff для сбойных моделей**: Интеллектуальный опрос моделей с нарастающим интервалом при ошибках (**20 секунд -> 2 минуты -> 10 минут -> 30 минут**), что устраняет излишний спам апстрима.
- **⚠️ Исключение 429 ошибок**: Ошибки лимитов (`rate_limited`) больше не считаются критическими сбоями, не портят статус здоровья в `/diag` и отображаются в виде мягкого оранжевого предупреждения на дашборде.
- **📊 Вкладка «Утилиты» и интерактивный терминал**: Запуск диагностики (`doctor`), проверки здоровья моделей (`model-health`), резервного копирования и других утилит прямо из веб-интерфейса дашборда с выводом логов в терминал.
- **🔔 Десктопные уведомления**: Всплывающие оповещения на рабочем столе, когда заблокированная модель снова становится доступной.
- **🛡️ Безопасность и конфиденциальность**: Тексты промптов, ответы моделей, локальные пути проектов, API-ключи и сессии никогда не логируются и не сохраняются на диск.

---

### 📁 Управление скриптами (CLI Management Tool)

Вместо кучи разрозненных `.cmd` файлов в корне репозитория теперь используются единые управляющие скрипты: [run.cmd](run.cmd) (для Windows) и [run.sh](run.sh) (для Linux/macOS).

Они принимают следующие команды управления:

| Команда | Эквивалент в npm | Описание |
|---|---|---|
| `.\run.cmd start` | `npm start` | **Запуск прокси**: Запуск локального сервера. |
| `.\run.cmd dev` | `npm run dev` | Запуск прокси в режиме разработки с автоматическим перезапуском при изменениях. |
| `.\run.cmd doctor` | `npm run doctor` | **Диагностика**: Проверка окружения, синтаксиса конфигурации, доступности сети и эндпоинтов. |
| `.\run.cmd doctor-factory`| `npm run doctor:factory`| Диагностика конфигурации Factory Droid, активных миссий и моделей валидации. |
| `.\run.cmd health` | `npm run model-health` | Сканирование статуса доступности и ошибок всех бесплатных моделей в пуле. |
| `.\run.cmd status` | `npm run proxy-status` | Вывод компактной текстовой сводки метрик работы прокси прямо в терминал. |
| `.\run.cmd backup` | `npm run factory:backup` | Создание локальных бэкапов и откат изменений в конфигурационных файлах Factory Droid. |
| `.\run.cmd setup` | `npm run setup:opencode` | Первичная регистрация локального провайдера в OpenCode Desktop. |
| `.\run.cmd setup-factory` | `npm run setup:factory` | Прописывание кастомных моделей OpenCode Proxy в конфигурационные файлы Factory Droid. |
| `.\run.cmd setup-vibemode`| `npm run setup:vibemode`| Обновление и миграция старых конфигураций NeuroGate на новый URL VibeMode. |
| `.\run.cmd open` | — | Запуск OpenCode Desktop с автоматической проверкой активности прокси. |
| `.\run.cmd scan` | `npm run secret-scan` | Проверка файлов проекта на утечки ключей или секретов. |
| `.\run.cmd cleanup` | `npm run cleanup:usage` | Очистка истории использования и файлов базы данных `usage.jsonl`. |
| `.\run.cmd build` | `npm run release:zip` | Сборка чистого ZIP-архива исходных кодов релиза. |
| `.\run.cmd test` | `npm test` | Запуск тестовой сюиты проекта. |

---

### 🚀 Быстрый старт (Windows)

1. Установите **OpenCode Desktop**: [opencode.ai/download](https://opencode.ai/download) -> Windows x64 Desktop Beta.
2. Установите **Node.js 18+** с официального сайта [nodejs.org](https://nodejs.org/).
3. Скачайте или клонируйте этот репозиторий.
4. Откройте PowerShell в папке проекта и запустите первоначальную настройку:
   ```powershell
   .\run.cmd setup
   ```
   Скрипт автоматически пропишет новый локальный провайдер в конфиг OpenCode Desktop.
5. Перезапустите OpenCode Desktop и выберите в моделях провайдер `Local Zen Proxy`.

Для ежедневного использования запускайте прокси и редактор одной командой:
```powershell
.\run.cmd open
```

Панель мониторинга (Dashboard) доступна по адресу:  
👉 **`http://127.0.0.1:3000/dashboard`**

---

### 🔌 Интеграция с Factory Droid (Missions & Validation)

Вы можете перенаправить запросы Factory Droid через этот прокси (например, если закончилась подписка на встроенные модели Factory Droid, но разрешено использование custom-моделей).

1. Запустите прокси:
   ```powershell
   .\run.cmd start
   ```
2. Выполните скрипт автонастройки:
   ```powershell
   .\run.cmd setup-factory
   ```
   Скрипт обновит конфигурации в `%USERPROFILE%\.factory\` и пропишет модели с суффиксом `[OpenCode Proxy]`.
3. Для проверки интеграции с Factory Droid запустите диагностику:
   ```powershell
   .\run.cmd doctor-factory
   ```

---

### ⚙️ Справочник переменных окружения (Configuration)

Настройка прокси осуществляется через переменные окружения или файл `.env` в корневой папке.

| Переменная | По умолчанию | Описание |
|---|---|---|
| `OPENCODE_ZEN_API_KEY` | `public` | API-ключ для авторизации в апстрим API OpenCode Zen. |
| `HOST` | `127.0.0.1` | Сетевой интерфейс, который слушает прокси-сервер. |
| `PORT` | `3000` | Сетевой порт прокси-сервера. |
| `MODELS` | *Список free-моделей* | Доступные модели в локальном пуле через запятую. |
| `PRIMARY_MODELS` | *Основные 4 модели*| Модели, отображаемые на верхних карточках дашборда. |
| `ROUTING` | `round-robin` | Стратегия балансировки нагрузки: `round-robin` или `random`. |
| `UPSTREAM_URL` | `https://opencode.ai/zen/v1` | URL-адрес оригинального API OpenCode Zen. |
| `UPSTREAM_TIMEOUT` | `30000` (мс) | Таймаут ожидания ответа от апстрима. |
| `MAX_BODY_BYTES` | `2097152` (2МБ) | Максимальный размер тела запроса к прокси. |
| `USAGE_DB_PATH` | *Папка конфига пользователя*| Путь к файлу `usage.jsonl` для сохранения истории. `off` отключает запись на диск. |
| `USAGE_RETENTION_DAYS`| `30` | Количество дней хранения локальной истории использования. |
| `MANAGEMENT_TOKEN` | *Пусто* | Токен для защиты дашборда и метрик при бинде вне localhost. |
| `PROBE_INTERVAL` | `30000` (мс) | Интервал проверки состояния заблокированных моделей. `0` отключает опрос. |

---

### 💻 Руководство разработчика

#### Запуск автотестов
Запуск тестов на встроенном Node.js Test Runner:
```bash
.\run.cmd test
```

#### Проверки качества кода
Запуск сканера секретов и проверка форматирования:
```powershell
.\run.cmd scan
git diff --check
```

---

## 🇬🇧 English User Guide

**OpenCode Proxy** is a lightweight, zero-dependency, OpenAI-compatible local proxy for the OpenCode Zen free models pool. It listens on `127.0.0.1:3000` by default and exposes an OpenAI-compatible endpoint.

---

### ✨ Core Features

- **⚡ Zero External Dependencies**: Powered entirely by the Node.js standard library.
- **🔀 Smart Routing**: Auto-fallbacks via `round-robin` or `random` strategies if a requested model is throttled or offline.
- **⏱️ Exponential Backoff Probing**: Intelligently pings throttled models with backoff intervals (**20s -> 2m -> 10m -> 30m**), preventing upstream spam.
- **⚠️ Exclude 429 Errors from Critical Failures**: Rate limits do not flag critical health failures. They show up as soft warnings on the dashboard.
- **📊 Embedded Terminal & Tools Tab**: Run doctor diagnostics, model health checks, and backups directly from the web dashboard.
- **🛡️ Privacy-Preserving**: Prompts, responses, local file paths, API keys, and session IDs are never saved to disk.

---

### 📁 CLI Management Tool

Instead of many individual files in the root directory, there are unified scripts: [run.cmd](run.cmd) (for Windows) and [run.sh](run.sh) (for Linux/macOS).

They support the following commands:

| Command | npm script | Description |
|---|---|---|
| `.\run.cmd start` | `npm start` | **Start Proxy**: Launches the local proxy server. |
| `.\run.cmd dev` | `npm run dev` | Runs the proxy in development watch-mode. |
| `.\run.cmd doctor` | `npm run doctor` | **Diagnostics**: Checks Node.js environment, config syntax, and endpoint access. |
| `.\run.cmd doctor-factory`| `npm run doctor:factory`| Checks Factory Droid settings, active missions, and validation models. |
| `.\run.cmd health` | `npm run model-health` | Verifies real-time status and errors of all free models in the pool. |
| `.\run.cmd status` | `npm run proxy-status` | Prints a compact CLI summary of requests, limits, and latency. |
| `.\run.cmd backup` | `npm run factory:backup` | Backs up or restores configuration files for Factory Droid. |
| `.\run.cmd setup` | `npm run setup:opencode` | Registers the local provider inside OpenCode Desktop. |
| `.\run.cmd setup-factory` | `npm run setup:factory` | Configures custom models inside Factory Droid's directory. |
| `.\run.cmd setup-vibemode`| `npm run setup:vibemode`| Migrates legacy configurations to the VibeMode endpoint. |
| `.\run.cmd open` | — | Launches OpenCode Desktop and verifies proxy activity. |
| `.\run.cmd scan` | `npm run secret-scan` | Audits files for raw API keys or passwords. |
| `.\run.cmd cleanup` | `npm run cleanup:usage` | Cleans up usage stats and local `usage.jsonl` database files. |
| `.\run.cmd build` | `npm run release:zip` | Packages a clean source-only release `.zip` bundle. |
| `.\run.cmd test` | `npm test` | Runs the Node.js test suite. |

---

### 🚀 Quick Start (Windows)

1. Install **OpenCode Desktop**: [opencode.ai/download](https://opencode.ai/download) -> Windows x64 Desktop Beta.
2. Install **Node.js 18+** from [nodejs.org](https://nodejs.org/).
3. Download or clone this repository.
4. Run the first-time setup in PowerShell:
   ```powershell
   .\run.cmd setup
   ```
5. Restart OpenCode Desktop and select `Local Zen Proxy`.

Daily launcher command:
```powershell
.\run.cmd open
```

Dashboard URL:  
👉 **`http://127.0.0.1:3000/dashboard`**

---

### 🔌 Factory Droid Integration

1. Start the proxy:
   ```powershell
   .\run.cmd start
   ```
2. Configure Factory settings:
   ```powershell
   .\run.cmd setup-factory
   ```
3. Run verification:
   ```powershell
   .\run.cmd doctor-factory
   ```

---

### ⚙️ Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `OPENCODE_ZEN_API_KEY` | `public` | Auth key for the upstream OpenCode Zen API. |
| `HOST` | `127.0.0.1` | Network host to bind the proxy server. |
| `PORT` | `3000` | Port to run the proxy server on. |
| `MODELS` | *Default free pool* | Comma-separated models pool. |
| `PRIMARY_MODELS` | *Top 4 models* | Selected models displayed as top dashboard cards. |
| `ROUTING` | `round-robin` | Load balancing strategy: `round-robin` or `random`. |
| `UPSTREAM_URL` | `https://opencode.ai/zen/v1` | Upstream API endpoint. |
| `UPSTREAM_TIMEOUT` | `30000` (ms) | Requests timeout limit. |
| `MAX_BODY_BYTES` | `2097152` (2MB) | Max allowed body payload size. |
| `USAGE_DB_PATH` | *User config folder* | JSONL storage path for usage statistics. Set to `off` to disable. |
| `USAGE_RETENTION_DAYS`| `30` | Prune records older than this duration from usage logs. |
| `MANAGEMENT_TOKEN` | *Empty* | Token to restrict `/dashboard`, `/flow`, `/metrics` etc. |
| `PROBE_INTERVAL` | `30000` (ms) | Rate limit checking frequency. Set to `0` to disable. |

---

### 💻 Developer Guide

#### Run Tests
```bash
.\run.cmd test
```

#### Run Checks
```powershell
.\run.cmd scan
git diff --check
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
