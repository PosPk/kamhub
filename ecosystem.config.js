// PM2 конфигурация для Timeweb Cloud
// Используется вместо Vercel для запуска Next.js на VDS

module.exports = {
  apps: [{
    name: 'kamchatour-hub',
    script: 'npm',
    args: 'start',
    instances: 1, // Для начала 1 инстанс, можно увеличить при росте нагрузки
    exec_mode: 'fork', // Изменено на fork для стабильности
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,
      HOSTNAME: '0.0.0.0'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    // Автоматический перезапуск при падении
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
