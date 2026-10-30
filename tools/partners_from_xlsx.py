"""Перекладывает таблицу остатков у партнёров (шаблон «остатки_партнеры_*.xlsx», лист «Остатки»)
в data/partners.json. Запуск: python3 tools/partners_from_xlsx.py путь/к/файлу.xlsx"""
import json, os, sys, datetime
from openpyxl import load_workbook
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
ws = load_workbook(src, data_only=True)['Остатки']
head = [str(c.value or '').strip().lower() for c in ws[1]]
col = {name: head.index(name) for name in ['магазин', 'артикул', 'цвет', 'размер', 'количество']}
items, skipped = [], []
for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
    get = lambda k: ('' if row[col[k]] is None else str(row[col[k]]).strip())
    shop, sku, qty = get('магазин'), get('артикул'), get('количество')
    if not (shop or sku or qty): continue
    try: q = int(float(qty))
    except ValueError: skipped.append((i, 'количество: ' + qty)); continue
    if not shop or not sku: skipped.append((i, 'нет магазина или артикула')); continue
    items.append({'shop': shop, 'sku': sku, 'color': get('цвет'), 'size': get('размер'), 'qty': q})
out = {'updated': datetime.date.today().isoformat() + ' (' + os.path.basename(src) + ')', 'items': items}
json.dump(out, open(os.path.join(ROOT, 'data', 'partners.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('строк:', len(items), '| пропущено:', skipped)
