/* ===== Каталог как в интернет-магазине: цена под артикулом в карточке + сортировка =====
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
    { id: 'price-desc', label: 'Сначала дороже' }
  ];
  var DEBUG = /[?&]colordebug=1/.test(location.search);
  function log() { if (DEBUG && window.console) console.log.apply(console, ['[catalog-ui]'].concat([].slice.call(arguments))); }

  // ---------- оформление ----------
  var css = [
    // под артикулом (заголовок карточки) — строка с ценой
    '.bs-ci-on .js-store-prod-name { padding-bottom: 0 !important; }',
    '.bs-ci { padding: 6px 0 20px; font-family: var(--t-text-font, Arial); color: #1a1a1a; font-size: 13px; line-height: 1.3; }',
    // шрифт — как у пунктов меню в шапке
    '.bs-sort { display: flex; justify-content: flex-start; align-items: center; gap: 6px; margin: 0 0 24px;',
    '  font-family: Avenir, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 1.4; color: #1a1a1a; }',
    '.bs-sort select { -webkit-appearance: none; appearance: none; border: 0; border-radius: 0; background: transparent',
    '  url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'9\' height=\'6\'%3E%3Cpath d=\'M.5.5l4 4 4-4\' fill=\'none\' stroke=\'%231a1a1a\'/%3E%3C/svg%3E") no-repeat right center;',
    '  padding: 2px 16px 2px 0; margin: 0; font: inherit; color: #1a1a1a; cursor: pointer; outline: none; }',
    '@media (max-width: 640px) {',
    '  .bs-ci { font-size: 11px; }',
    '  .bs-sort { margin-bottom: 16px; font-size: 11px; }',
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
    var title = card.querySelector('.js-store-prod-name');
    if (!title) return;
    var price = fmtPrice(cardPrice(card, p));
    if (!price) return;
    var box = title.nextElementSibling && title.nextElementSibling.classList.contains('bs-ci') ? title.nextElementSibling : null;
    if (box && box.textContent === price) return;
    if (!box) { box = document.createElement('div'); box.className = 'bs-ci no-typo'; box.setAttribute('translate', 'no'); title.parentNode.insertBefore(box, title.nextSibling); }
    box.textContent = price;
    title.parentNode.classList.add('bs-ci-on');
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
    lab.textContent = 'Сортировка:';
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
      [].slice.call(document.querySelectorAll('.bs-sort select')).forEach(fitSelect);
    });
    bar.appendChild(lab); bar.appendChild(sel);
    list.parentNode.insertBefore(bar, list);
    return bar;
  }
  function alignBar(bar, list) {
    // края панели — по краям карточек, чтобы она стояла ровно над сеткой
    var cs = [].slice.call(list.querySelectorAll(':scope > ' + CARD_SEL));
    if (!cs.length) return;
    var lr = list.getBoundingClientRect(), top = cs[0].getBoundingClientRect().top, right = 0, left = Infinity;
    cs.forEach(function (c) {
      var r = (c.querySelector('.t-store__card__imgwrapper') || c).getBoundingClientRect();   // по краю фото
      if (Math.abs(r.top - top) > 2) return;
      right = Math.max(right, r.right); left = Math.min(left, r.left);
    });
    var pl = Math.max(0, Math.round(left - lr.left)) + 'px', pr = Math.max(0, Math.round(lr.right - right)) + 'px';
    if (bar.style.paddingLeft !== pl) bar.style.paddingLeft = pl;
    if (bar.style.paddingRight !== pr) bar.style.paddingRight = pr;
    fitSelect(bar.querySelector('select'));
  }
  // ширина списка — по выбранному пункту, чтобы стрелка стояла сразу после текста
  function fitSelect(sel) {
    if (!sel) return;
    var m = document.createElement('span'), cs = getComputedStyle(sel);
    m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font + ';letter-spacing:' + cs.letterSpacing;
    m.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
    document.body.appendChild(m);
    var w = Math.ceil(m.getBoundingClientRect().width) + 18 + 'px';
    m.remove();
    if (sel.style.width !== w) sel.style.width = w;
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
      // цена берётся из самой карточки; данные магазина подгружаем, только если в карточке её нет
      loadProducts(all.filter(function (c) { return !cardPrice(c); }).map(function (c) { return c.getAttribute('data-product-gen-uid'); }));
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
