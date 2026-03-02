#!/usr/bin/env node
/**
 * Скрипт миграции контента Gramax в Docusaurus
 * - Копирует .md файлы в website/docs/
 * - Удаляет Gramax-специфичный синтаксис
 * - Конвертирует _index.md в index.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = ROOT;
const DEST = path.join(ROOT, 'website', 'docs');

const EXCLUDE_DIRS = ['.gramax', 'website', 'node_modules', '.git', 'scripts'];

function updateFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return content;

  let frontmatter = match[1];
  const body = content.slice(match[0].length);

  // Если есть order и нет sidebar_position — добавить sidebar_position
  if (frontmatter.includes('order:') && !frontmatter.includes('sidebar_position:')) {
    const orderMatch = frontmatter.match(/^order:\s*(.+)$/m);
    if (orderMatch) {
      const orderValue = orderMatch[1].trim();
      frontmatter = frontmatter + '\nsidebar_position: ' + orderValue;
    }
  }

  return `---\n${frontmatter}\n---${body}`;
}

function convertContent(content, filePath) {
  let result = content;

  // Обновить frontmatter (добавить sidebar_position из order)
  result = updateFrontmatter(result);

  // Удалить <view defs="..." display="..."/>
  result = result.replace(/<view[^>]*\/>\s*/g, '');

  // Конвертировать изображения {width=... height=...} в HTML для контроля размера
  result = result.replace(
    /!\[([^\]]*)\]\((\.\/[^)]+)\)\{width=(\d+)px height=(\d+)px\}/g,
    (_, alt, src, width, height) =>
      `![${alt}](${src})`
  );
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{width=\d+px height=\d+px\}/g,
    (_, alt, src) => `![${alt}](${src})`
  );

  // Удалить оставшиеся атрибуты {width=...} у изображений
  result = result.replace(/\)\{[^}]+\}/g, ')');

  // Конвертировать <note type="quote"> в blockquote
  result = result.replace(/<note\s+type="quote">\s*([\s\S]*?)\s*<\/note>/g, (_, inner) => {
    const lines = inner.trim().split('\n');
    return lines.map((l) => '> ' + l).join('\n');
  });

  // Конвертировать <note type="lab|tip|info|warning|danger"> в Docusaurus admonitions (lab -> info)
  result = result.replace(/<note\s+type="(lab|tip|info|warning|danger)">\s*([\s\S]*?)\s*<\/note>/g, (_, type, inner) => {
    const docusaurusType = type === 'lab' ? 'info' : type;
    const content = inner.trim();
    return `:::${docusaurusType}\n${content}\n:::`;
  });

  // Конвертировать <note> без type в blockquote
  result = result.replace(/<note>\s*([\s\S]*?)\s*<\/note>/g, (_, inner) => {
    const lines = inner.trim().split('\n');
    return lines.map((l) => '> ' + l).join('\n');
  });

  // Конвертировать <image src="..." .../> в markdown
  result = result.replace(/<image\s+src="([^"]+)"[^/]*\/>/g, (_, src) => {
    const filename = src.replace(/^\.\//, '');
    return `![${filename}](${filename})`;
  });

  // Нормализовать списки: -  (двойной пробел) -> - (один пробел), включая вложенные
  result = result.replace(/^(\s*)-  /gm, '$1- ');

  // Удалить пустые заголовки ### \n и ## \n
  result = result.replace(/^(#{2,6})\s*\n/gm, '');

  return result;
}

function migrateFile(srcPath, relPath) {
  const destPath = path.join(DEST, relPath);
  const destDir = path.dirname(destPath);

  let content = fs.readFileSync(srcPath, 'utf-8');
  content = convertContent(content, srcPath);

  // _index.md -> index.md для Docusaurus
  let destFileName = path.basename(relPath);
  if (destFileName === '_index.md') {
    destFileName = 'index.md';
    const newDestPath = path.join(destDir, destFileName);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(newDestPath, content);
  } else {
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destPath, content);
  }
}

function walkDir(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        walkDir(fullPath, baseDir);
      }
    } else if (entry.name.endsWith('.md') && !entry.name.match(/^README/i)) {
      migrateFile(fullPath, relPath);
      console.log('Migrated:', relPath);
    }
  }
}

// Копировать изображения
function copyImages() {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  function findImages(dir, baseDir = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          findImages(fullPath, baseDir);
        }
      } else if (imageExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
        const destPath = path.join(DEST, relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(fullPath, destPath);
        console.log('Copied image:', relPath);
      }
    }
  }
  findImages(SRC);
}

console.log('Starting migration...');
fs.mkdirSync(DEST, { recursive: true });
walkDir(SRC);
copyImages();
console.log('Migration complete!');
