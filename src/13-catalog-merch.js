/* ===== Мерчандайзинг: порядок товаров в каталогах =====
   Для каталога задаём группы по названию товара (как в Тильде / МойСклад). Товары идут группами
   в указанном порядке, внутри группы и среди «остальных» — порядок Тильды. Карточки цветов
   (src/07) остаются рядом со своей основной карточкой. */
(function () {
  if (window.__bsMerchInit) return;
  window.__bsMerchInit = true;

  // =====================================================================
  //  ПОРЯДОК ТОВАРОВ. Ключ — адрес каталога, значение — группы по порядку.
  //  match: слова в названии товара (без учёта регистра). Всё, что не попало в группы, — в конце.
  // =====================================================================
  var MERCH = {
    '/catalog_woman_accessories': [
      { name: 'Тапочки',            match: /тапоч|мюли/i },
      { name: 'Шапки с помпоном',   match: /помпон/i },
      { name: 'Шапки-ушанки',       match: /ушанк/i },
      { name: 'Варежки',            match: /варежк/i }
    ]
  };

  var path = location.pathname.toLowerCase().replace(/\/+$/, '');
  var RULES = MERCH[path];
  if (!RULES) return;

  var CARD_SEL = '.t-store__card';
  var CACHE_KEY = 'bsTitles:v1';
  var TITLES = {};
  try { TITLES = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch (e) {}
  var DEBUG = /[?&]colordebug=1/.test(location.search);
  function log() { if (DEBUG && window.console) console.log.apply(console, ['[merch]'].concat([].slice.call(arguments))); }

  // пока не расставили — сетку не показываем (не дольше 1,5 с), чтобы карточки не прыгали
  var style = document.createElement('style');
  style.textContent = 'html.bs-merch-wait .t-store__card-list { opacity: 0 !important; }';
  (document.head || document.documentElement).appendChild(style);
  var root = document.documentElement;
  root.classList.add('bs-merch-wait');
  var shown = false;
  function show() { if (shown) return; shown = true; root.classList.remove('bs-merch-wait'); }
  setTimeout(show, 1500);

  var asked = {}, seq = 0;
  function loadTitles(uids) {
    var need = uids.filter(function (u) { return u && !asked[u]; });
    if (!need.length) return;
    need.forEach(function (u) { asked[u] = true; });
    fetch('https://store.tildaapi.com/api/getproductsbyuid/', { method: 'POST', body: JSON.stringify({ productsuid: need, c: Date.now() }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        ((j && j.products) || []).forEach(function (p) { TITLES[String(p.uid)] = p.title || ''; });
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(TITLES)); } catch (e) {}
        run(true);
      })
      .catch(function () { show(); });
  }

  function rank(uid) {
    var t = TITLES[uid];
    if (t == null) return -1;                       // название ещё не знаем
    for (var i = 0; i < RULES.length; i++) if (RULES[i].match.test(t)) return i;
    return RULES.length;
  }

  function sortList(list) {
    var kids = [].slice.call(list.children);
    var groups = [], cur = null;
    kids.forEach(function (el) {
      if (!el.matches || !el.matches(CARD_SEL)) { if (cur) cur.nodes.push(el); return; }
      var uid = el.getAttribute('data-product-gen-uid');
      if (el.classList.contains('bs-color-clone') && cur && cur.uid === uid) { cur.nodes.push(el); return; }
      if (!el.hasAttribute('data-bs-midx')) el.setAttribute('data-bs-midx', String(seq++));   // порядок Тильды
      cur = { uid: uid, nodes: [el], idx: +el.getAttribute('data-bs-midx'), rank: rank(uid) };
      groups.push(cur);
    });
    if (groups.length < 2) return true;
    if (groups.some(function (g) { return g.rank < 0; })) return false;   // ждём названия
    var sorted = groups.slice().sort(function (a, b) { return (a.rank - b.rank) || (a.idx - b.idx); });
    var order = [];
    sorted.forEach(function (g) { order = order.concat(g.nodes); });
    var same = order.length === kids.length && order.every(function (n, i) { return n === kids[i]; });
    if (!same) {
      var frag = document.createDocumentFragment();
      order.forEach(function (n) { frag.appendChild(n); });
      list.appendChild(frag);
      log('порядок обновлён', sorted.map(function (g) { return g.rank; }).join(','));
    }
    return true;
  }

  var busy = false, timer = null;
  function later() { if (busy) return; clearTimeout(timer); timer = setTimeout(function () { run(false); }, 40); }
  function run(fromData) {
    busy = true;
    try {
      var cards = [].slice.call(document.querySelectorAll(CARD_SEL));
      if (!cards.length) return;
      var lists = [];
      cards.forEach(function (c) { if (lists.indexOf(c.parentNode) === -1) lists.push(c.parentNode); });
      var unknown = cards.map(function (c) { return c.getAttribute('data-product-gen-uid'); })
        .filter(function (u, i, a) { return u && a.indexOf(u) === i && TITLES[u] == null; });
      if (unknown.length) loadTitles(unknown);
      var done = lists.every(sortList);
      if (done) show();
      // названия могли измениться в Тильде — один раз за визит обновляем их в фоне
      if (!fromData && done && !run.refreshed) {
        run.refreshed = true;
        loadTitles(cards.map(function (c) { return c.getAttribute('data-product-gen-uid'); })
          .filter(function (u, i, a) { return u && a.indexOf(u) === i; }));
      }
    } finally { setTimeout(function () { busy = false; }, 0); }
  }

  function init() {
    run(false);
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) if (muts[i].type === 'childList' && muts[i].addedNodes.length) { later(); return; }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
