import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    outDir: 'dist',
    
    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в продакшене
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false // Удалить комментарии
      }
    },
    
    // Code splitting для оптимальной загрузки
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделить React и React-DOM в отдельный chunk
          'react-vendor': ['react', 'react-dom'],
          
          // Three.js и 3D библиотеки в отдельный chunk
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          
          // Остальные большие библиотеки
          'vendor': ['framer-motion', 'gsap'],
          
          // Формы и утилиты
          'utils': ['react-hook-form', 'react-input-mask', 'qrcode.react']
        },
        // Хеширование имен файлов для кеширования
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Увеличить лимит предупреждения (для 3D моделей)
    chunkSizeWarningLimit: 1000,
    
    // Оптимизация ассетов
    assetsInlineLimit: 4096, // Встроить файлы < 4kb как base64
    
    // Source maps только для ошибок
    sourcemap: false,
    
    // CSS оптимизация
    cssCodeSplit: true,
    cssMinify: true,
    
    // Сжатие
    reportCompressedSize: true
  },
  
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion'
    ],
    exclude: []
  },
  
  // Предзагрузка модулей
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    legalComments: 'none' // Удалить лицензионные комментарии
  }
})

