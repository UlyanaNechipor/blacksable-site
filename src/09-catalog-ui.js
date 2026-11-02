/* ===== Каталог как в интернет-магазине: название, артикул и цена в карточке + сортировка =====
   Работает на страницах каталога (/catalog…). Карточки цветов (src/07) обрабатываются так же,
   при сортировке карточки цветов остаются рядом со своей основной карточкой. */
(function () {
  if (window.__bsCatalogUiInit) return;
  window.__bsCatalogUiInit = true;
  if (!/^\/catalog/i.test(location.pathname)) return;

  var CARD_SEL = '.t-store__card';
  var LIST_SEL = '.t-store__card-list';
  var SORT_KEY = 'bsSort:' + location.pathname;
  var SORTS = [
    { id: 'default', label: 'По умолчанию' },
    { id: 'price-asc', label: 'Сначала дешевле' },
    { id: 'price-desc', label: 'Сначала дороже' },
    { id: 'name', label: 'По названию' }
  ];
  var DEBUG = /[?&]colordebug=1/.test(location.search);
  function log() { if (DEBUG && window.console) console.log.apply(console, ['[catalog-ui]'].concat([].slice.call(arguments))); }

  // ---------- оформление ----------
  var css = [
    // название Тильды (сейчас там артикул) прячем — вместо него наш блок
    '.bs-ci-on .js-store-prod-name { display: none !important; }',
    '.bs-ci { padding-bottom: 20px; font-family: var(--t-text-font, Arial); color: #1a1a1a; }',
    '.bs-ci__name { font-size: 14px; line-height: 1.35; text-transform: uppercase; font-weight: 400; }',
    '.bs-ci__sku { margin-top: 6px; font-size: 11px; line-height: 1.3; color: #8c8c8c; letter-spacing: .03em; }',
    '.bs-ci__price { margin-top: 8px; font-size: 13px; line-height: 1.3; }',
    '.bs-sort { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin: 0 0 24px;',
    '  font-family: var(--t-text-font, Arial); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #8c8c8c; }',
    '.bs-sort select { -webkit-appearance: none; appearance: none; border: 0; border-radius: 0; background: transparent',
    '  url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'9\' height=\'6\'%3E%3Cpath d=\'M.5.5l4 4 4-4\' fill=\'none\' stroke=\'%231a1a1a\'/%3E%3C/svg%3E") no-repeat right center;',
    '  padding: 4px 16px 4px 0; margin: 0; font: inherit; text-transform: uppercase; letter-spacing: .06em; color: #1a1a1a; cursor: pointer; outline: none; }',
    '@media (max-width: 640px) {',
    '  .bs-ci__name { font-size: 11px; } .bs-ci__sku { font-size: 10px; } .bs-ci__price { font-size: 11px; }',
    '  .bs-sort { margin-bottom: 16px; }',
    '}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // ---------- данные товаров (название и цена) ----------
  var PRODUCTS = {}, asked = {};
  function cleanName(t) {
    return String(t || '')
      .replace(/\s*,\s*цв\..*$/i, '')            // «…, цв. синий» — цвет видно по фото
      .replace(/\s*-\s+/g, '-')                     // «Шапка- ушанка» → «Шапка-ушанка»
      .replace(/"([^"]+)"/g, '«$1»')
      .replace(/\s+/g, ' ').trim();
  }
  function fmtPrice(n) {
    n = Math.round(parseFloat(n) || 0);
    return n > 0 ? n.toLocaleString('ru-RU') + ' р.' : '';
  }
  function loadProducts(uids) {
    var need = uids.filter(function (u) { return u && !PRODUCTS[u] && !asked[u]; });
    if (!need.length) return;
    need.forEach(function (u) { asked[u] = true; });
    for (var i = 0; i < need.length; i += 50) {
      fetch('https://store.tildaapi.com/api/getproductsbyuid/', { method: 'POST', body: JSON.stringify({ productsuid: need.slice(i, i + 50), c: Date.now() }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          ((j && j.products) || []).forEach(function (p) {
            PRODUCTS[String(p.uid)] = { name: cleanName(p.title), sku: p.sku || '', price: parseFloat(p.price) || 0 };
          });
          later();
        })
        .catch(function () {});
    }
  }

  // ---------- карточка ----------
  function cardPrice(card, p) {
    var el = card.querySelector('.js-product-price');
    var def = el && parseFloat(el.getAttribute('data-product-price-def'));
    return def || (p && p.price) || 0;
  }
  function cardSku(card, p) {
    var el = card.querySelector('.js-store-prod-sku');
    return (el && el.textContent.trim()) || (p && p.sku) || '';
  }
  function fillCard(card) {
    var p = PRODUCTS[card.getAttribute('data-product-gen-uid')];
    if (!p) return;
    var wrap = card.querySelector('.t-store__card__textwrapper');
    if (!wrap) return;
    var name = p.name, sku = cardSku(card, p), price = fmtPrice(cardPrice(card, p));
    var sig = name + '|' + sku + '|' + price;
    var box = wrap.querySelector('.bs-ci');
    if (box && box.getAttribute('data-sig') === sig) return;
    if (!box) { box = document.createElement('div'); box.className = 'bs-ci'; wrap.insertBefore(box, wrap.firstChild); }
    box.innerHTML = '';
    [['name', name], ['sku', sku], ['price', price]].forEach(function (x) {
      if (!x[1]) return;
      var d = document.createElement('div');
      d.className = 'bs-ci__' + x[0];
      d.textContent = x[1];
      if (x[0] !== 'name') d.setAttribute('translate', 'no');
      box.appendChild(d);
    });
    box.setAttribute('data-sig', sig);
    wrap.classList.add('bs-ci-on', 'no-typo');
  }

  // ---------- сортировка ----------
  var mode = 'default';
  try { mode = sessionStorage.getItem(SORT_KEY) || 'default'; } catch (e) {}
  var seq = 0, nextIdx = 0;

  function lists() {
    var out = [];
    [].slice.call(document.querySelectorAll(LIST_SEL)).forEach(function (l) {
      if (l.closest('.t-slds, .t-store__relevants-grid-cont')) return;   // слайдеры и «похожие» не трогаем
      if (l.querySelectorAll(':scope > ' + CARD_SEL).length >= 2) out.push(l);
    });
    return out;
  }
  function addBar(list) {
    var prev = list.previousElementSibling;
    if (prev && prev.classList.contains('bs-sort')) return prev;
    var bar = document.createElement('div');
    bar.className = 'bs-sort no-typo';
    var lab = document.createElement('label');
    lab.textContent = 'Сортировка';
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', 'Сортировка');
    SORTS.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.label;
      if (s.id === mode) o.selected = true;
      sel.appendChild(o);
    });
    var id = 'bs-sort-' + (++seq); sel.id = id; lab.setAttribute('for', id);
    sel.addEventListener('change', function () {
      mode = sel.value;
      try { sessionStorage.setItem(SORT_KEY, mode); } catch (e) {}
      [].slice.call(document.querySelectorAll('.bs-sort select')).forEach(function (s) { s.value = mode; });
      run();
    });
    bar.appendChild(lab); bar.appendChild(sel);
    list.parentNode.insertBefore(bar, list);
    return bar;
  }
  function alignBar(bar, list) {
    // отступы панели — как у карточек, чтобы правый край совпадал с сеткой
    var first = list.querySelector(':scope > ' + CARD_SEL);
    if (!first) return;
    var lr = list.getBoundingClientRect(), cr = first.getBoundingClientRect();
    var pad = Math.max(0, Math.round(cr.left - lr.left)) + 'px';
    if (bar.style.paddingLeft !== pad) { bar.style.paddingLeft = pad; bar.style.paddingRight = pad; }
  }

  function sortList(list) {
    var kids = [].slice.call(list.children);
    // группы: основная карточка + карточки её цветов сразу за ней
    var groups = [], cur = null;
    kids.forEach(function (el) {
      if (!el.matches || !el.matches(CARD_SEL)) { if (cur) cur.extra.push(el); return; }
      if (el.classList.contains('bs-color-clone') && cur && cur.uid === el.getAttribute('data-product-gen-uid')) { cur.nodes.push(el); return; }
      if (!el.hasAttribute('data-bs-idx')) el.setAttribute('data-bs-idx', String(nextIdx++));   // исходный порядок Тильды
      var p = PRODUCTS[el.getAttribute('data-product-gen-uid')];
      cur = { uid: el.getAttribute('data-product-gen-uid'), nodes: [el], extra: [], idx: +el.getAttribute('data-bs-idx'), price: cardPrice(el, p), name: (p && p.name) || '' };
      groups.push(cur);
    });
    if (groups.length < 2) return;
    var sorted = groups.slice().sort(function (a, b) {
      var d = 0;
      if (mode === 'price-asc') d = (a.price || 1e15) - (b.price || 1e15);
      else if (mode === 'price-desc') d = (b.price || 0) - (a.price || 0);
      else if (mode === 'name') d = a.name.localeCompare(b.name, 'ru');
      return d || a.idx - b.idx;
    });
    var order = [];
    sorted.forEach(function (g) { order = order.concat(g.nodes, g.extra); });
    var same = order.length === kids.length && order.every(function (n, i) { return n === kids[i]; });
    if (same) return;
    var frag = document.createDocumentFragment();
    order.forEach(function (n) { frag.appendChild(n); });
    list.appendChild(frag);
    log('сортировка', mode, groups.length);
  }

  // ---------- общий цикл ----------
  var timer = null, busy = false;
  function later() { if (busy) return; clearTimeout(timer); timer = setTimeout(run, 60); }
  function run() {
    busy = true;
    try {
      var all = [].slice.call(document.querySelectorAll(CARD_SEL));
      loadProducts(all.map(function (c) { return c.getAttribute('data-product-gen-uid'); }));
      all.forEach(fillCard);
      lists().forEach(function (list) {
        var bar = addBar(list);
        alignBar(bar, list);
        sortList(list);
      });
    } finally { setTimeout(function () { busy = false; }, 0); }
  }
  function init() {
    run();
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].type === 'childList' && muts[i].addedNodes.length) { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', later);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
