import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к папке с SVG файлами
const SVG_DIR = path.join(__dirname, '../public/templates');

// Функция для извлечения и оптимизации base64 изображений в SVG
async function optimizeSvgImages(svgPath) {
  console.log(`\n📄 Обработка: ${path.basename(svgPath)}`);
  
  // Читаем SVG файл
  let svgContent = await fs.readFile(svgPath, 'utf-8');
  const originalSize = Buffer.byteLength(svgContent);
  
  // Находим все base64 изображения
  const base64Pattern = /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/g;
  let match;
  let optimizedCount = 0;
  let totalSaved = 0;
  
  while ((match = base64Pattern.exec(svgContent)) !== null) {
    const [fullMatch, imageType, base64Data] = match;
    
    try {
      // Декодируем base64
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const originalImageSize = imageBuffer.length;
      
      console.log(`  🖼️  Найдено ${imageType} изображение: ${(originalImageSize / 1024).toFixed(2)} KB`);
      
      // Оптимизируем изображение с помощью sharp
      const optimizedBuffer = await sharp(imageBuffer)
        .png({
          quality: 85,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true
        })
        .toBuffer();
      
      const optimizedSize = optimizedBuffer.length;
      const saved = originalImageSize - optimizedSize;
      totalSaved += saved;
      
      console.log(`  ✅ Оптимизировано: ${(optimizedSize / 1024).toFixed(2)} KB (сэкономлено ${(saved / 1024).toFixed(2)} KB, ${((saved / originalImageSize) * 100).toFixed(1)}%)`);
      
      // Кодируем обратно в base64
      const optimizedBase64 = optimizedBuffer.toString('base64');
      
      // Заменяем в SVG
      svgContent = svgContent.replace(fullMatch, `data:image/png;base64,${optimizedBase64}`);
      optimizedCount++;
      
    } catch (error) {
      console.error(`  ❌ Ошибка при оптимизации изображения: ${error.message}`);
    }
  }
  
  if (optimizedCount > 0) {
    // Сохраняем оптимизированный SVG
    await fs.writeFile(svgPath, svgContent, 'utf-8');
    const newSize = Buffer.byteLength(svgContent);
    const savedTotal = originalSize - newSize;
    
    console.log(`  💾 Всего оптимизировано изображений: ${optimizedCount}`);
    console.log(`  📊 Размер файла: ${(originalSize / 1024).toFixed(2)} KB → ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`  🎉 Сэкономлено: ${(savedTotal / 1024).toFixed(2)} KB (${((savedTotal / originalSize) * 100).toFixed(1)}%)`);
    
    return { optimizedCount, savedTotal, originalSize, newSize };
  } else {
    console.log(`  ℹ️  Base64 изображений не найдено`);
    return null;
  }
}

// Главная функция
async function main() {
  console.log('🚀 Запуск оптимизации встроенных изображений в SVG файлах...\n');
  
  try {
    // Получаем все SVG файлы
    const files = await fs.readdir(SVG_DIR);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    if (svgFiles.length === 0) {
      console.log('❌ SVG файлы не найдены');
      return;
    }
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let totalFilesOptimized = 0;
    
    // Обрабатываем каждый файл
    for (const file of svgFiles) {
      const svgPath = path.join(SVG_DIR, file);
      const result = await optimizeSvgImages(svgPath);
      
      if (result) {
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        totalFilesOptimized++;
      }
    }
    
    // Итоговая статистика
    if (totalFilesOptimized > 0) {
      const totalSaved = totalOriginalSize - totalNewSize;
      console.log('\n' + '='.repeat(60));
      console.log('📊 ИТОГОВАЯ СТАТИСТИКА:');
      console.log('='.repeat(60));
      console.log(`Обработано файлов: ${totalFilesOptimized} из ${svgFiles.length}`);
      console.log(`Исходный размер: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Новый размер: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Сэкономлено: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${((totalSaved / totalOriginalSize) * 100).toFixed(1)}%)`);
      console.log('='.repeat(60));
    } else {
      console.log('\n✅ Все файлы уже оптимизированы или не содержат встроенных изображений');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();

