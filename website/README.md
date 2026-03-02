# Этерия — статичный сайт на Docusaurus

Документация кампании Этерия, мигрированная из Gramax в Docusaurus.

## Запуск

```bash
# Установка зависимостей (если ещё не установлены)
npm install

# Режим разработки
npm start

# Сборка статического сайта
npm run build

# Просмотр собранного сайта
npm run serve
```

## Структура

- `docs/` — весь контент в формате Markdown
- `static/img/` — статические изображения (favicon, logo)
- `src/css/custom.css` — кастомные стили

## Миграция контента

При добавлении новых файлов в исходные папки Gramax (home, eteriya-lor, teni-nad-konklavom, avanyuristy, sessii) запустите скрипт миграции:

```bash
node scripts/migrate-to-docusaurus.js
```

Скрипт:
- Копирует все .md файлы в `website/docs/`
- Удаляет Gramax-специфичный синтаксис (`<view>`, атрибуты изображений)
- Конвертирует `_index.md` в `index.md`
- Копирует изображения
