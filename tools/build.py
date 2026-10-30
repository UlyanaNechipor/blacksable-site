"""Собирает blacksable.js из файлов src/*.js (по порядку имён). Запуск: python3 tools/build.py"""
import glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = ['/*! Black Sable — скрипты сайта. Собрано из файлов в папке src/. Не редактируйте этот файл вручную. */',
       'if (window.__bsSiteLoaded) { throw new Error("blacksable.js уже загружен"); }\nwindow.__bsSiteLoaded = true;']
for path in sorted(glob.glob(os.path.join(ROOT, 'src', '*.js'))):
    name = os.path.splitext(os.path.basename(path))[0]
    body = open(path, encoding='utf8').read().rstrip() + '\n'
    out.append('try {\n' + body + "} catch (e) { if (window.console) console.warn('[blacksable] " + name + ":', e); }")
open(os.path.join(ROOT, 'blacksable.js'), 'w', encoding='utf8').write('\n\n'.join(out) + '\n')
print('blacksable.js:', os.path.getsize(os.path.join(ROOT, 'blacksable.js')), 'байт')
