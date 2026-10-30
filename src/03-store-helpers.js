/* ===== Мелкие правки витрины: переименование кнопок, кликабельные размеры, скрытие «нет в наличии» в каталоге ===== */
(function () {
  var s = document.createElement('style');
  s.setAttribute('data-bs', '03-store-helpers');
  s.textContent = "/* карточки с нулевым остатком: не показываем надпись «нет в наличии» */\n[data-product-inv=\"0\"] .t-store__card__text,\n[data-product-inv=\"0\"] .t-store__card__mark,\n[data-product-inv=\"0\"] [class*=\"sold\"]:not(.cs-sold-out):not(.js-cs-size-out):not(.js-store-product):not(.js-product) {\n  display: none !important;\n  opacity: 0 !important;\n  visibility: hidden !important;\n}\n\n/* размеры без наличия остаются кликабельными (по клику предлагается предзаказ) */\n.t-product__option-item_disabled,\n.js-store-prod-option-val_disabled,\n.t-product__option-item_disabled * {\n  pointer-events: auto !important;\n  cursor: pointer !important;\n}";
  (document.head || document.documentElement).appendChild(s);
})();
(function () {
  if (window.__storeHelpersInit) return;
  window.__storeHelpersInit = true;

  // кнопки «Добавить в корзину» / «Отправить заказ» / «Отправить» во всём магазине называем «Добавить в заказ»
  // (корзину и оформление заказа не трогаем)
  var NEW_TEXT = 'Добавить в заказ';
  var OLD_TEXTS = ['добавить в корзину', 'в корзину', 'отправить заказ', 'отправить'];
  var SKIP_SEL = '.t706, .t-cart-win, .t-products-nav, .t-minicart';

  // текст кнопки: внутри .t-btnflex__text, а у старых кнопок — прямо в ссылке
  function textHolder(btn) {
    var span = btn.querySelector('.t-btnflex__text, .t-btn__text, .js-store-prod-popup-buy-btn-txt');
    if (span) return span;
    for (var n = btn.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim()) return n;
    }
    return null;
  }

  function rename() {
    document.querySelectorAll('.t-btnflex__text, .t-btn, .t-btnflex, .t-store__prod-popup__btn, .js-store-prod-page-buy-btn, a[href^="#order"]').forEach(function (el) {
      if (el.closest(SKIP_SEL)) return;
      var h = el.classList && el.classList.contains('t-btnflex__text') ? el : textHolder(el);
      if (!h) return;
      var txt = (h.nodeType === 3 ? h.nodeValue : h.textContent).replace(/ /g, ' ').trim().toLowerCase();
      if (OLD_TEXTS.indexOf(txt) === -1) return;
      if (h.nodeType === 3) h.nodeValue = NEW_TEXT; else h.textContent = NEW_TEXT;
    });
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(rename, 60);
  }

  function init() {
    rename();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ===== Исправление старых ссылок: технический домен Тильды, сломанные адреса /http/, удалённый каталог ===== */
(function () {
  if (window.__bsLinkFixInit) return;
  window.__bsLinkFixInit = true;

  var OLD_HOST = /(^|\.)tilda\.ws$|^(www\.)?blacksable\.ru$/i;   // ссылки, которые ведут на сайт (в т. ч. через технический домен)

  // старый адрес -> новый (без домена)
  var PATHS = {
    '/page66667483.html': '/o_brende',
    '/page70679605.html': '/kak_sdelat_zakaz'
  };
  // ссылка по подписи (подвал): куда она должна вести на самом деле
  var BY_TEXT = {
    'аксессуары': '/catalog_woman_accessories',
    'одежда': '/catalog_woman_collection'
  };
  // «Вся коллекция» ведёт на удалённый каталог — ведём в каталог того же раздела, что и товар
  function collectionFor(path) {
    var p = location.pathname.toLowerCase();
    if (/^\/item_acc_m_/.test(p)) return '/catalog_man_accessories';
    if (/^\/item_acc_/.test(p)) return '/catalog_woman_accessories';
    if (/^\/item_m_/.test(p)) return '/catalog_man_collection';
    return '/catalog_woman_collection';
  }
  var OLD_CATALOGS = { '/catalog_women': 1, '/catalog_men': 1, '/catalog_accessories_women': 1, '/catalog_accessories_men': 1 };

  function fix(a) {
    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(raw)) return;
    var u;
    try { u = new URL(raw, location.href); } catch (e) { return; }
    if (!OLD_HOST.test(u.hostname)) return;
    var path = u.pathname;
    var fixedPath = path.replace(/^\/http\/blacksableru\/?/i, '/');               // адрес, вставленный целиком в поле адреса страницы
    if (fixedPath !== path && !/^\/item_/i.test(fixedPath)) fixedPath = '/item_' + fixedPath.replace(/^\/(item_)?/i, '');
    var low = fixedPath.toLowerCase().replace(/\/+$/, '');
    var text = a.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    if (PATHS[low]) fixedPath = (BY_TEXT[text] && low === '/page66667483.html') ? BY_TEXT[text] : PATHS[low];
    else if (OLD_CATALOGS[low]) fixedPath = collectionFor(low);
    var want = fixedPath + u.search + u.hash;
    var sameSite = u.hostname.toLowerCase() === location.hostname.toLowerCase();
    if (sameSite && want === u.pathname + u.search + u.hash) return;               // ссылка и так правильная
    a.setAttribute('href', want);
    if (a.getAttribute('target') === '_blank' && /tilda\.ws$/i.test(u.hostname)) a.removeAttribute('target');
  }
  function run() { document.querySelectorAll('a[href]').forEach(fix); }

  var timer = null;
  function init() {
    run();
    new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(run, 150); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
