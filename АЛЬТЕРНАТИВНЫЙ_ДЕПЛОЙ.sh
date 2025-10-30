#!/bin/bash

echo "🚀 АЛЬТЕРНАТИВНЫЙ ДЕПЛОЙ (БЕЗ GITHUB)"
echo "====================================="
echo ""
echo "GitHub блокирует push из-за большого файла core в истории."
echo "Используем прямой деплой на Timeweb VDS."
echo ""

echo "📋 ВАМ ПОНАДОБИТСЯ:"
echo "1. Timeweb VDS (заказать на https://timeweb.cloud/vds)"
echo "2. IP адрес и пароль root"
echo ""

read -p "У вас есть Timeweb VDS? (y/n): " has_vds

if [[ ! $has_vds =~ ^[Yy]$ ]]; then
    echo ""
    echo "Заказать VDS:"
    echo "1. https://timeweb.cloud/vds"
    echo "2. Выбрать: VDS-4 (4 CPU, 4GB RAM) ~600₽/мес"
    echo "3. OS: Ubuntu 22.04"
    echo "4. Получить IP и пароль на email"
    echo ""
    exit 0
fi

echo ""
read -p "Введите IP адрес VDS: " vds_ip
read -p "Введите пароль root: " -s vds_pass
echo ""

echo "📦 Создание архива проекта..."
tar -czf /tmp/kamhub-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=core \
  --exclude=.next \
  --exclude="*.log" \
  -C /workspace .

echo "✓ Архив создан: $(du -h /tmp/kamhub-deploy.tar.gz | cut -f1)"
echo ""

echo "📤 Загрузка на VDS..."
sshpass -p "$vds_pass" scp /tmp/kamhub-deploy.tar.gz root@$vds_ip:/root/

echo "✓ Загружено"
echo ""

echo "🚀 Запуск деплоя на VDS..."
sshpass -p "$vds_pass" ssh root@$vds_ip << 'REMOTE'
cd /root
tar -xzf kamhub-deploy.tar.gz -C /var/www/kamchatour
cd /var/www/kamchatour
chmod +x deploy-timeweb.sh
./deploy-timeweb.sh
REMOTE

echo ""
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН!"
echo ""
echo "Приложение доступно: http://$vds_ip"
echo ""

rm /tmp/kamhub-deploy.tar.gz
