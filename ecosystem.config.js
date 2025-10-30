// PM2 конфигурация для Timeweb Cloud
// Используется вместо Vercel для запуска Next.js на VDS

module.exports = {
  apps: [{
    name: 'kamchatour-hub',
    script: 'npm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true
  }]
};
