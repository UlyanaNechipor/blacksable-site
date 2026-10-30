#!/bin/sh
# Выпуск обновления: собрать файл, закоммитить, записать номер версии в version.txt и отправить на GitHub.
# Запуск: sh tools/release.sh "что изменилось"
set -e
cd "$(dirname "$0")/.."
python3 tools/build.py
node --check blacksable.js
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "$1" || true
git rev-parse --short=12 HEAD > version.txt
git add version.txt
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "Версия $(cat version.txt)"
git push -q origin main
echo "Выпущена версия $(cat version.txt)"
