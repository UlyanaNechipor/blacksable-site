/* ===== Наличие у магазинов-партнёров: «TSUM — 2 шт.» в списке «Можно приобрести…» на карточке ===== */
(function () {
  if (window.__bsPartnerStockInit) return;
  window.__bsPartnerStockInit = true;
  if (!/^\/(item|test_item)/i.test(location.pathname)) return;

  var DEBUG = /[?&]colordebug=1/.test(location.search);
  // файл с остатками лежит рядом со скриптом в репозитории; обновляется раз в час (как и скрипт)
  // версию (номер) сообщает строка загрузки в подвале; без неё — последняя версия ветки
  function dataFile() { return '/gh/UlyanaNechipor/blacksable-site@' + (window.__bsVersion || 'main') + '/data/partners.json'; }
  var HOSTS = ['https://cdn.jsdelivr.net', 'https://fastly.jsdelivr.net', 'https://gcore.jsdelivr.net'];
  var LIST_RE = /можно приобрести/i;          // по этой фразе находим список магазинов
  var UNIT = 'шт.';
  var SIZE_NAMES = ['размер', 'размеры', 'size'];
  var COLOR_NAMES = ['цвет', 'цвета', 'color'];
  var BOX_SEL = '.js-store-product_single, .js-product-single';
  // одинаковые магазины под разными названиями
  var ALIASES = { 'цум': 'tsum', 'tsum': 'tsum', 'длт': 'длт', 'dlt': 'длт', 'бабочка': 'babochka', 'vipavenue': 'vip avenue' };

  function log() { if (DEBUG && window.console) console.log.apply(console, ['[partners]'].concat([].slice.call(arguments))); }
  function norm(s) { return String(s == null ? '' : s).replace(/ё/gi, 'е').replace(/[\s ]+/g, ' ').trim().toLowerCase(); }
  function shopKey(s) { var n = norm(s); var k = n.replace(/\s+/g, ''); return ALIASES[k] || ALIASES[n] || n; }

  var STYLE = document.createElement('style');
  STYLE.textContent = '.bs-ps-qty { white-space: nowrap; }';
  (document.head || document.documentElement).appendChild(STYLE);

  // ---------- данные ----------
  var ROWS = null, PRODUCT = null;

  function loadRows() {
    var v = Math.floor(Date.now() / 3600000), i = 0;
    function next() {
      if (i >= HOSTS.length) { log('файл остатков не загрузился'); return; }
      fetch(HOSTS[i++] + dataFile() + '?v=' + v)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { ROWS = (j && j.items) || []; log('строк остатков:', ROWS.length, '| обновлено:', j && j.updated); render(); })
        .catch(next);
    }
    next();
  }

  function genUid() {
    var b = document.querySelector(BOX_SEL);
    var uid = b && b.getAttribute('data-product-gen-uid');
    if (uid) return uid;
    var s = document.querySelectorAll('script:not([src])');
    for (var i = 0; i < s.length; i++) { var m = s[i].textContent.match(/storeprod\s*:\s*['"](\d+)['"]/); if (m) return m[1]; }
    return '';
  }
  function loadProduct() {
    var uid = genUid();
    if (!uid) return setTimeout(loadProduct, 500);
    var shared = window.__tildaProductsData && window.__tildaProductsData[uid];
    if (shared) { useProduct(shared); return; }
    fetch('https://store.tildaapi.com/api/getproductsbyuid/', { method: 'POST', body: JSON.stringify({ productsuid: [uid], c: Date.now() }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { useProduct(j && j.products && j.products[0]); })
      .catch(function () {});
  }
  function useProduct(p) {
    if (!p) return;
    var eds = p.editions;
    if (typeof eds === 'string') { try { eds = JSON.parse(eds); } catch (e) { eds = []; } }
    var skus = [p.sku].concat((eds || []).map(function (e) { return e.sku; })).filter(Boolean).map(norm);
    var ck = eds && eds[0] && Object.keys(eds[0]).filter(function (k) { return COLOR_NAMES.indexOf(norm(k)) > -1; })[0];
    var colors = ck ? eds.map(function (e) { return norm(e[ck]); }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }) : [];
    PRODUCT = { skus: skus, colors: colors };
    log('товар:', skus.join(', '), '| цвета:', colors.join(', ') || '—');
    render();
  }

  // ---------- что выбрано на карточке ----------
  function visibleBox() {
    var list = [].slice.call(document.querySelectorAll(BOX_SEL));
    return list.filter(function (b) { return b.getClientRects().length; })[0] || list[0] || null;
  }
  function selectedSize(box) {
    if (!box) return '';
    var opts = box.querySelectorAll('.js-product-edition-option');
    for (var i = 0; i < opts.length; i++) {
      if (SIZE_NAMES.indexOf(norm(opts[i].getAttribute('data-edition-option-id'))) === -1) continue;
      var act = opts[i].querySelector('.t-product__option-item_active input');
      if (act) return act.value;
      var sel = opts[i].querySelector('select');
      return sel ? sel.value : '';
    }
    return '';
  }
  function pageColor() {
    if (window.__bsPageColor) return norm(window.__bsPageColor);           // цвет страницы из блока цветов
    return PRODUCT && PRODUCT.colors.length === 1 ? PRODUCT.colors[0] : '';  // у товара один цвет
  }

  // остатки по магазинам для этой карточки: по выбранному размеру; если в данных размера нет — общее количество модели
  function countsFor(box) {
    var size = norm(selectedSize(box)), color = pageColor(), res = {};
    ROWS.forEach(function (r) {
      if (PRODUCT.skus.indexOf(norm(r.sku)) === -1) return;
      if (r.color && color && norm(r.color) !== color && norm(r.color).indexOf(color) !== 0) return;
      if (r.size && size && norm(r.size) !== size) return;
      var k = shopKey(r.shop);
      if (!res[k]) res[k] = { name: r.shop, qty: 0 };
      res[k].qty += +r.qty || 0;
    });
    return res;
  }

  // ---------- вывод ----------
  function render() {
    if (!ROWS || !PRODUCT) return;
    var box = visibleBox();
    var counts = countsFor(box);
    [].slice.call(document.querySelectorAll('[field]')).forEach(function (field) {
      if (!LIST_RE.test(field.textContent)) return;
      var seen = {};
      [].slice.call(field.querySelectorAll('a')).forEach(function (a) {
        var k = shopKey(a.textContent);
        seen[k] = true;
        var c = counts[k];
        var tag = a.nextSibling && a.nextSibling.nodeType === 1 && a.nextSibling.classList.contains('bs-ps-qty') ? a.nextSibling : null;
        var text = c && c.qty > 0 ? ' — ' + c.qty + ' ' + UNIT : '';
        if (!text) { if (tag) tag.remove(); return; }
        if (!tag) { tag = document.createElement('span'); tag.className = 'bs-ps-qty'; a.parentNode.insertBefore(tag, a.nextSibling); }
        if (tag.textContent !== text) tag.textContent = text;
      });
      // магазины из данных, которых нет в списке на карточке — дописываем строками после последнего магазина
      var extra = field.querySelector('.bs-ps-extra');
      var html = Object.keys(counts).filter(function (k) { return !seen[k] && counts[k].qty > 0; })
        .map(function (k) { return counts[k].name + ' — ' + counts[k].qty + ' ' + UNIT; });
      if (!html.length) { if (extra) extra.remove(); return; }
      if (!extra) {
        extra = document.createElement('span'); extra.className = 'bs-ps-extra';
        var shops = [].slice.call(field.querySelectorAll('a')).filter(function (a) { return !/коллекц/i.test(a.textContent); });
        var last = shops[shops.length - 1];
        if (last) { var after = last.nextSibling && last.nextSibling.classList && last.nextSibling.classList.contains('bs-ps-qty') ? last.nextSibling : last; after.parentNode.insertBefore(extra, after.nextSibling); }
        else field.appendChild(extra);
      }
      var sig = html.join('|');
      if (extra.getAttribute('data-sig') === sig) return;
      extra.textContent = '';
      html.forEach(function (t) { extra.appendChild(document.createElement('br')); extra.appendChild(document.createTextNode(t)); });
      extra.setAttribute('data-sig', sig);
    });
  }

  // пересчёт при выборе размера (меняется отметка выбранного размера) и при перерисовке карточки Тильдой
  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(render, 120); }
  function init() {
    loadRows();
    loadProduct();
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (muts[i].type === 'childList' || (t.closest && t.closest('.js-product-edition-option'))) { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', later);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
