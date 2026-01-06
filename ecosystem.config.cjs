module.exports = {
  apps: [{
    name: 'nfc-vl',
    script: './server.js',
    instances: 'max', // Использовать все доступные ядра CPU
    exec_mode: 'cluster', // Кластерный режим для балансировки нагрузки
    watch: false, // Отключить watch в продакшене
    max_memory_restart: '500M', // Рестарт при превышении памяти
    env: {
      NODE_ENV: 'production',
      PORT: 10010
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 10010
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Автоматический рестарт при ошибках
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: false,
    
    // Оптимизация производительности
    instance_var: 'INSTANCE_ID',
    listen_timeout: 3000,
    
    // Мониторинг
    pmx: true,
    
    // Restart cron (каждую ночь в 3:00)
    cron_restart: '0 3 * * *'
  }]
}

