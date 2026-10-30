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
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "Версия $(cat version.txt)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LSUiVCG6fM6E8ANc2sgvt8"
git push -q origin main
echo "Выпущена версия $(cat version.txt)"
