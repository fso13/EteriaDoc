# Миграция на Docusaurus

Проект Этерия успешно мигрирован с Gramax на Docusaurus — статический генератор документации.

## Что сделано

1. **Создан проект Docusaurus** в папке `website/`
2. **Мигрирован весь контент** — 123 markdown-файла и изображения
3. **Удалён Gramax-специфичный синтаксис**:
   - `<view defs="..." display="..."/>` — виджеты навигации
   - `{width=...px height=...px}` — атрибуты изображений
4. **Настроена структура** — sidebar с автогенерацией из структуры папок

## Запуск

```bash
cd website
npm install   # если ещё не установлено
npm start    # режим разработки на http://localhost:3000
```

## Сборка статического сайта

```bash
cd website
npm run build
```

Результат — в папке `website/build/`.

## Деплой на GitHub Pages

Настроен автоматический деплой при пуше в `main` или `master`:

1. **Включите GitHub Pages** в настройках репозитория: Settings → Pages → Source: Deploy from a branch → Branch: `gh-pages` → / (root)
2. **Права для Actions**: Settings → Actions → General → Workflow permissions → Read and write permissions
3. Сайт будет доступен по адресу: **https://fso13.github.io/EteriaDoc/**

## Повторная миграция

Если вы редактируете исходные файлы в корне проекта (home/, eteriya-lor/, teni-nad-konklavom/ и т.д.), запустите:

```bash
node scripts/migrate-to-docusaurus.js
```

Скрипт обновит содержимое в `website/docs/`.

## Структура

```
Eteria/
├── website/           # Docusaurus проект
│   ├── docs/          # Мигрированный контент
│   ├── src/
│   ├── static/
│   └── docusaurus.config.js
├── scripts/
│   └── migrate-to-docusaurus.js
├── home/              # Исходный контент Gramax
├── eteriya-lor/
├── teni-nad-konklavom/
├── avanyuristy/
└── sessii/
```

## Рекомендации

- **Логотип**: можно заменить `website/static/img/logo.svg` на свой
- **Домен**: измените `url` и `baseUrl` в `docusaurus.config.js` для деплоя
- **Стили**: настройте `website/src/css/custom.css` под свой стиль (цвета из .doc-root.yaml: blue-pink)
