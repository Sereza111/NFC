import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../public/templates');
const DEST_DIR = path.join(__dirname, '../dist/templates');

async function copyTemplates() {
  console.log('📋 Копирование SVG шаблонов...\n');
  
  try {
    // Проверяем существование целевой директории
    try {
      await fs.access(DEST_DIR);
    } catch {
      console.log('📁 Создание директории dist/templates...');
      await fs.mkdir(DEST_DIR, { recursive: true });
    }
    
    // Получаем список SVG файлов
    const files = await fs.readdir(SOURCE_DIR);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    if (svgFiles.length === 0) {
      console.log('⚠️  SVG файлы не найдены в public/templates');
      return;
    }
    
    let copiedCount = 0;
    let totalSize = 0;
    
    // Копируем каждый файл
    for (const file of svgFiles) {
      const sourcePath = path.join(SOURCE_DIR, file);
      const destPath = path.join(DEST_DIR, file);
      
      await fs.copyFile(sourcePath, destPath);
      
      const stats = await fs.stat(destPath);
      totalSize += stats.size;
      copiedCount++;
      
      console.log(`  ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Скопировано файлов: ${copiedCount}`);
    console.log(`📦 Общий размер: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('='.repeat(50));
    console.log('✨ Копирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при копировании:', error.message);
    process.exit(1);
  }
}

copyTemplates();

