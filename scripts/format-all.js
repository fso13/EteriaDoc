#!/usr/bin/env node
/**
 * Применяет единое форматирование ко всем .md файлам
 * Запускать перед миграцией: node scripts/format-all.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['.gramax', 'website', 'node_modules', '.git', 'scripts', 'docs'];

// Метки для ***Метка***:
const CATEGORY_LABELS = [
  'Внешний вид', 'Атмосфера', 'Окружение', 'Описание', 'Внешность', 'Детали',
  'Информация', 'Локация', 'Зацепки', 'Расспросы', 'Помощь', 'Внутреннее убранство',
  'Детали интерьера', 'Описание здания', 'Ключевая информация', 'Новые цели',
  'НПС-союзник', 'Направления для расследования', 'Информация от соседки',
  'Крючок', 'Пути перехода', 'Социальное взаимодействие', 'Внутри таверны',
  'Противники', 'Тактика', 'Тактика врагов', 'Развитие', 'Действие', 'Действующие лица',
  'Что можно найти', 'Что могут сделать герои', 'Найденные улики', 'Содержание письма',
  'Зона 1', 'Зона 2', 'Зона 3', 'Подход', 'Вид сверху', 'Склад', 'Дорога', 'Местность',
  'Укрытия', 'Освещение', 'Владелец', 'Услуги', 'Товары', 'Побочный квест',
  'Сокровища', 'Влияние', 'Роль', 'Вариант 1', 'Вариант 2', 'Вариант 3',
  'Первый этаж', 'Второй этаж', 'Раунд 1', 'Раунд 2', 'Раунд 3',
  'Если сахагины отступили или убиты', 'Если сахагина взяли в плен',
  'Прямая зацепка', 'Через исследование', 'Через жителей',
  'Разрушение Фрагментов', 'Очищение Собора', 'Дипломатия с Торном',
  'В начале боя', 'При уничтожении фрагментов', 'Детали', 'Варианты ответа',
  'Особенность поля боя', 'Подробное описание', 'Небоевое решение'
];

function formatContent(content) {
  let result = content;

  // 1. Нормализовать списки: -  -> -
  result = result.replace(/^(\s*)-  /gm, '$1- ');

  // 2. Цель: в начале строки -> **Цель:**
  result = result.replace(/^(Цель):\s*/gm, '**$1:** ');

  // 3. Локация: Окружение: и т.д. в начале строки -> ***Метка***:
  CATEGORY_LABELS.forEach((label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re1 = new RegExp(`^(${escaped}):\\s*`, 'gm');
    result = result.replace(re1, '***$1***: ');
    const re2 = new RegExp(`\\*\\*${escaped}\\*\\*:\\s*`, 'g');
    result = result.replace(re2, `***${label}***: `);
  });

  // 4. #### **1. Title** -> ### 1. Title
  result = result.replace(/^#### \*\*(\d+\\. [^*]+)\*\*$/gm, '### $1');
  result = result.replace(/^#### \*\*([^*]+)\*\*$/gm, '### $1');

  // 5. Нумерованные структурные параграфы: 1\. Title -> ### 1. Title
  result = result.replace(/^(\d+)\\\\. (.+)$/gm, '### $1. $2');

  // 6. Нормализовать тире: -- -> — (между словами)
  result = result.replace(/(\w)\s+--\s+(\w)/g, '$1 — $2');

  // 7. Исправить ***Метка***: 1. <note> -> ***Метка***:\n\n<note>
  result = result.replace(/(\*\*\*[^*]+\*\*\*:)\s*1\.\s*(<note>)/g, '$1\n\n$2');

  return result;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const formatted = formatContent(content);
    if (content !== formatted) {
      fs.writeFileSync(filePath, formatted);
      return true;
    }
  } catch (err) {
    console.error('Error:', filePath, err.message);
  }
  return false;
}

function walkDir(dir, baseDir = dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        count += walkDir(fullPath, baseDir);
      }
    } else if (entry.name.endsWith('.md') && !entry.name.match(/^README|^FORMATTING-STYLE/i)) {
      if (processFile(fullPath)) {
        console.log('Formatted:', relPath);
        count++;
      }
    }
  }
  return count;
}

console.log('Formatting all markdown files...');
const count = walkDir(ROOT);
console.log(`Done. Formatted ${count} files.`);
