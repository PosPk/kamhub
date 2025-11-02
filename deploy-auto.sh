#!/usr/bin/expect -f

set timeout 600
set SERVER "root@5.129.248.224"
set PASSWORD "xQvB1pv?yZTjaR"
set APP_DIR "/var/www/kamchatour"

puts "🚀 Начинаю деплой на $SERVER..."

# Подключение и создание директории
spawn ssh -o StrictHostKeyChecking=no root@5.129.248.224
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "root@" {
        send "mkdir -p $APP_DIR && cd $APP_DIR && pwd\r"
        expect "root@"
        send "exit\r"
        expect eof
    }
    timeout {
        puts "Timeout при подключении!"
        exit 1
    }
}

puts "📤 Копирую файлы проекта..."
spawn scp -o StrictHostKeyChecking=no -r /workspace/app root@5.129.248.224:$APP_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}

spawn scp -o StrictHostKeyChecking=no -r /workspace/components root@5.129.248.224:$APP_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}

spawn scp -o StrictHostKeyChecking=no -r /workspace/contexts root@5.129.248.224:$APP_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}

spawn scp -o StrictHostKeyChecking=no -r /workspace/lib root@5.129.248.224:$APP_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}

spawn scp -o StrictHostKeyChecking=no -r /workspace/types root@5.129.248.224:$APP_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}

spawn scp -o StrictHostKeyChecking=no /workspace/package.json /workspace/package-lock.json /workspace/tsconfig.json /workspace/next.config.js /workspace/tailwind.config.ts /workspace/middleware.ts /workspace/ecosystem.config.js root@5.129.248.224:$APP_DIR/
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}

puts "📋 Создаю скрипт деплоя..."
set deploy_script {
#!/bin/bash
set -e
cd /var/www/kamchatour
echo "📦 Установка зависимостей..."
npm install
echo "🏗️ Сборка проекта..."
npm run build
echo "🔄 Перезапуск PM2..."
if pm2 list | grep -q "kamchatour-hub"; then
    pm2 reload kamchatour-hub --update-env
else
    pm2 start ecosystem.config.js --name kamchatour-hub || npm start &
fi
pm2 save 2>/dev/null || true
echo "✅ Деплой завершен!"
}

spawn ssh -o StrictHostKeyChecking=no root@5.129.248.224 "cat > /tmp/deploy-remote.sh << 'EOFSCRIPT'
$deploy_script
EOFSCRIPT
chmod +x /tmp/deploy-remote.sh && /tmp/deploy-remote.sh"

expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "root@" {
        expect eof
    }
    timeout {
        puts "Timeout!"
        exit 1
    }
}

puts "✅ Деплой завершен!"
puts "🌐 Проверьте: http://5.129.248.224"
