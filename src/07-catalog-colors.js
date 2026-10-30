/* ===== Каталог: отдельная карточка для каждого цвета товара =====
   В Тильде товар с несколькими цветами — одна карточка в каталоге. Здесь мы показываем
   рядом копии этой карточки для остальных цветов: со своим фото и ссылкой на страницу цвета.
   Список цветов берётся из GROUPS (src/04-colors.js), фото — из data/catalog-colors.json. */
(function () {
  if (window.__bsCatalogColorsInit) return;
  window.__bsCatalogColorsInit = true;
  if (/^\/(item|test_item)/i.test(location.pathname)) return;

  var DEBUG = /[?&]colordebug=1/.test(location.search);
  function dataFile() { return '/gh/UlyanaNechipor/blacksable-site@' + (window.__bsVersion || 'main') + '/data/catalog-colors.json'; }
  var HOSTS = ['https://cdn.jsdelivr.net', 'https://fastly.jsdelivr.net', 'https://gcore.jsdelivr.net'];
  var CARD_SEL = '.t-store__card';

  // =====================================================================
  //  ДРУГОЕ ФОТО КАРТОЧКИ В ОТДЕЛЬНОМ КАТАЛОГЕ
  //  catalog: адрес каталога (начало), uid: номер товара в Тильде,
  //  photo: какое по счёту фото товара показывать (1 — первое, 2 — второе…)
  // =====================================================================
  var PHOTO_RULES = [
    { catalog: '/catalog_man', uid: '138371138193', photo: 2 },   // Домашние мюли Enigma Black — фото без модели
    { catalog: '/catalog_man', uid: '594148739343', photo: 2 }    // Варежки из меха соболя Enigma Black — фото без модели
  ];

  function log() { if (DEBUG && window.console) console.log.apply(console, ['[catalog-colors]'].concat([].slice.call(arguments))); }
  function cleanPath(p) {
    var path = p || '';
    try { path = new URL(p, location.origin).pathname; } catch (e) {}
    try { path = decodeURIComponent(path); } catch (e) {}
    return path.toLowerCase().replace(/\/+$/, '');
  }

  var PAGES = null, BASE = 'https://static.tildacdn.com/', BY_PATH = null;

  // адрес страницы цвета -> { group, color }
  function indexGroups() {
    var groups = window.__bsColorGroups;
    if (!groups) return false;
    BY_PATH = {};
    groups.forEach(function (g) {
      g.colors.forEach(function (c) { BY_PATH[cleanPath(c.url)] = { group: g, color: c }; });
    });
    return true;
  }

  // фото в том же размере, в каком Тильда показывает карточки (облегчённое webp)
  function imgUrl(rel, sample) {
    rel = String(rel).replace(/^https?:\/\/static\.tildacdn\.com\//, '');
    var m = rel.match(/^([^\/]+)\/([^\/]+)$/);
    if (!m) return /^https?:/.test(rel) ? rel : BASE + rel;
    var size = '400x600';
    var s = sample && sample.match(/\/-\/resize\/(\d+x\d+)\//);
    if (s) size = s[1];
    return 'https://optim.tildacdn.com/' + m[1] + '/-/resize/' + size + '/-/format/webp/' + m[2] + (/\.webp$/i.test(m[2]) ? '' : '.webp');
  }

  function setPhoto(card, info) {
    var el = card.querySelector('.js-product-img');
    if (!el || !info || !info.img) return;
    if (card.hasAttribute('data-bs-photo') && !info.rule) return;   // фото задано правилом каталога
    var full = /^https?:/.test(info.img) ? info.img : BASE + info.img;
    if (el.getAttribute('data-original') === full) return;
    var cur = el.style.backgroundImage || '';
    el.setAttribute('data-original', full);
    el.style.backgroundImage = 'url("' + imgUrl(info.img, cur) + '")';
    el.classList.add('t-bgimg_loaded', 'loaded');
    card.setAttribute('data-product-img', full);
    // второе фото при наведении (если в каталоге включено)
    var second = card.querySelector('.t-store__card__bgimg_second');
    if (second && info.img2) {
      second.setAttribute('data-original', BASE + info.img2);
      second.style.backgroundImage = 'url("' + imgUrl(info.img2, cur) + '")';
    }
  }

  function setLink(card, url) {
    var abs = location.origin + url;
    card.setAttribute('data-product-url', abs);
    [].slice.call(card.querySelectorAll('a[href]')).forEach(function (a) { a.setAttribute('href', abs); });
  }

  // ---------- фото по правилам каталога ----------
  var here = location.pathname.toLowerCase(), GALLERY = {}, asked = {};
  var myRules = PHOTO_RULES.filter(function (r) { return here.indexOf(r.catalog.toLowerCase()) === 0; });
  function applyRules() {
    if (!myRules.length) return;
    myRules.forEach(function (r) {
      var cards = [].slice.call(document.querySelectorAll(CARD_SEL + '[data-product-gen-uid="' + r.uid + '"]'));
      if (!cards.length) return;
      var g = GALLERY[r.uid];
      if (!g) { askGallery(r.uid); return; }
      var img = g[r.photo - 1];
      if (!img) return;
      cards.forEach(function (c) { c.setAttribute('data-bs-photo', r.photo); setPhoto(c, { img: img, rule: true }); });
    });
  }
  function askGallery(uid) {
    if (asked[uid]) return;
    asked[uid] = true;
    fetch('https://store.tildaapi.com/api/getproductsbyuid/', { method: 'POST', body: JSON.stringify({ productsuid: [uid], c: Date.now() }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var p = j && j.products && j.products[0], g = p && p.gallery;
        if (typeof g === 'string') { try { g = JSON.parse(g); } catch (e) { g = []; } }
        GALLERY[uid] = (g || []).map(function (x) { return x.img; }).filter(Boolean);
        log('фото товара', uid, GALLERY[uid]);
        run();
      })
      .catch(function () {});
  }

  function process() {
    applyRules();
    if (!PAGES || !BY_PATH) return;
    // каждый список карточек обрабатываем отдельно (на странице может быть несколько каталогов)
    var lists = [];
    [].slice.call(document.querySelectorAll(CARD_SEL)).forEach(function (c) {
      if (c.parentNode && lists.indexOf(c.parentNode) === -1) lists.push(c.parentNode);
    });
    lists.forEach(function (list) {
      var cards = [].slice.call(list.children).filter(function (c) { return c.matches && c.matches(CARD_SEL); });
      var present = {};
      cards.forEach(function (c) { present[cleanPath(c.getAttribute('data-product-url'))] = c; });
      cards.forEach(function (card) {
        if (card.classList.contains('bs-color-clone')) return;
        var path = cleanPath(card.getAttribute('data-product-url'));
        var hit = BY_PATH[path];
        if (!hit) return;
        var uid = card.getAttribute('data-product-gen-uid');
        // фото самой карточки — с её страницы цвета
        setPhoto(card, PAGES[hit.color.url]);
        var after = card;
        hit.group.colors.forEach(function (c) {
          if (c.hidden) return;
          var p = cleanPath(c.url);
          if (p === path) return;
          var info = PAGES[c.url];
          // у цвета свой отдельный товар — у него и так есть своя карточка в каталоге
          if (!info || info.uid !== uid) return;
          var clone = present[p];
          if (!clone) {
            clone = card.cloneNode(true);
            clone.classList.remove('js-product');
            clone.classList.add('bs-color-clone');
            clone.removeAttribute('data-product-lid');
            clone.setAttribute('data-bs-color', c.name);
            setLink(clone, c.url);
            setPhoto(clone, info);
            present[p] = clone;
            log('карточка', c.name, c.url);
          }
          if (!clone.classList.contains('bs-color-clone')) return;   // настоящая карточка Тильды — не двигаем
          if (after.nextSibling !== clone) list.insertBefore(clone, after.nextSibling);
          after = clone;
        });
      });
    });
  }

  function loadData() {
    var v = Math.floor(Date.now() / 3600000), i = 0;
    function next() {
      if (i >= HOSTS.length) { log('файл фото не загрузился'); return; }
      fetch(HOSTS[i++] + dataFile() + '?v=' + v)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { PAGES = (j && j.pages) || {}; if (j && j.base) BASE = j.base; process(); })
        .catch(next);
    }
    next();
  }

  var timer = null, busy = false;
  function later() { if (busy) return; clearTimeout(timer); timer = setTimeout(run, 80); }
  function run() { busy = true; try { process(); } finally { setTimeout(function () { busy = false; }, 0); } }

  function init() {
    if (!indexGroups()) return;
    loadData();
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].type === 'childList' && muts[i].addedNodes.length) { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
