/* ===== Каталог: при возврате из карточки товара — на то же место, где остановились =====
   Тильда рисует каталог уже после загрузки страницы, поэтому браузер сам место не находит.
   Запоминаем, на какую карточку нажали и где она была на экране, и после возврата
   прокручиваем к ней (дожидаясь, пока каталог и карточки цветов дорисуются). */
(function () {
  if (window.__bsScrollInit) return;
  window.__bsScrollInit = true;
  if (/^\/(item|test_item)/i.test(location.pathname)) return;

  var CARD_SEL = '.t-store__card';
  var KEY = 'bsScroll:' + location.pathname;
  var MAX_AGE = 2 * 3600 * 1000;   // через 2 часа место уже не восстанавливаем

  function cleanPath(p) {
    var path = p || '';
    try { path = new URL(p, location.origin).pathname; } catch (e) {}
    try { path = decodeURIComponent(path); } catch (e) {}
    return path.toLowerCase().replace(/\/+$/, '');
  }
  function read() { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function write(st) { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function cards() { return document.querySelectorAll(CARD_SEL); }

  // ---------- запоминаем ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    var card = a && a.closest(CARD_SEL);
    if (!card) return;
    write({ y: window.pageYOffset, url: cleanPath(a.getAttribute('href')), off: card.getBoundingClientRect().top, n: cards().length, t: Date.now() });
  }, true);
  // уход со страницы другим способом — просто высота (нажатие на карточку не перетираем)
  window.addEventListener('pagehide', function () {
    if (!cards().length) return;
    var st = read();
    if (st && st.url && Date.now() - st.t < 10000) return;
    write({ y: window.pageYOffset, n: cards().length, t: Date.now() });
  });

  // ---------- возвращаем ----------
  var st = read();
  if (!st || Date.now() - st.t > MAX_AGE) return;
  var nav = '';
  try { nav = (performance.getEntriesByType('navigation')[0] || {}).type || ''; } catch (e) {}
  var ref = '';
  try { ref = cleanPath(document.referrer); } catch (e) {}
  var cameBack = nav === 'back_forward' || (st.url && ref && ref === st.url);
  if (!cameBack) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var stop = false, started = Date.now(), lastTarget = -1, stableTicks = 0, moreClicks = 0;
  function userMoved() { stop = true; }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, userMoved, { passive: true, once: true }); });

  function anchorCard() {
    if (!st.url) return null;
    var list = cards();
    for (var i = 0; i < list.length; i++) {
      if (cleanPath(list[i].getAttribute('data-product-url')) === st.url) return list[i];
    }
    return null;
  }
  function tick() {
    if (stop || Date.now() - started > 8000) return;
    var list = cards();
    // каталог показывался не целиком («Загрузить ещё») — догружаем столько же карточек
    if (list.length && st.n && list.length < st.n && moreClicks < 10) {
      var more = document.querySelector('.js-store-load-more-btn, .t-store__load-more-btn');
      if (more && more.offsetParent) { more.click(); moreClicks++; }
    }
    var target = -1, card = anchorCard();
    if (card) target = Math.round(card.getBoundingClientRect().top + window.pageYOffset - (st.off || 0));
    else if (list.length && document.documentElement.scrollHeight >= st.y + window.innerHeight) target = st.y;
    if (target >= 0) {
      if (Math.abs(window.pageYOffset - target) > 2) window.scrollTo(0, target);
      stableTicks = target === lastTarget ? stableTicks + 1 : 0;
      lastTarget = target;
      if (stableTicks >= 12) return;   // место не менялось ~1,2 с — готово
    }
    setTimeout(tick, 100);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick); else tick();
})();
