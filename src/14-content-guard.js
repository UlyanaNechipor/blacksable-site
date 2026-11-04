/* ===== Контроль контента Zero-блоков: на сайте показывается утверждённая версия =====
   Сотрудники правят тексты Zero-блоков и баннеры в Тильде, но на живом сайте посетители
   видят последнюю утверждённую версию (эталон из data/approved-content.json), пока правку
   не проверили. Черновик (то, что реально сейчас в Тильде) смотрится по адресу ?draft=1.
   Утверждение = обновление эталона в этом файле (делается после проверки). */
(function () {
  if (window.__bsContentGuardInit) return;
  window.__bsContentGuardInit = true;

  // страницы под контролем (эталон для них лежит в data/approved-content.json)
  var GUARDED = ['/', '/rules', '/showroom', '/kak_sdelat_zakaz', '/archive_2026',
    '/care', '/o_mexe_sobolya', '/o_brende', '/podarochnaya_karta', '/adresa_butikov_partnerov'];

  function normPath(p) { p = (p || '').toLowerCase().replace(/\/+$/, ''); return p || '/'; }
  var PATH = normPath(location.pathname);

  // режим черновика: ?draft=1 включает, ?draft=0 выключает (запоминается на вкладку)
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('draft') === '1') sessionStorage.setItem('bsDraft', '1');
    if (q.get('draft') === '0') sessionStorage.removeItem('bsDraft');
  } catch (e) {}
  var DRAFT = false; try { DRAFT = sessionStorage.getItem('bsDraft') === '1'; } catch (e) {}
  if (DRAFT || GUARDED.indexOf(PATH) === -1) return;   // черновик или страница без контроля — не вмешиваемся

  var DEBUG = /[?&]cgdebug=1/.test(location.search);
  function log() { if (DEBUG && window.console) console.log.apply(console, ['[content-guard]'].concat([].slice.call(arguments))); }
  function dataFile() { return '/gh/UlyanaNechipor/blacksable-site@' + (window.__bsVersion || 'main') + '/data/approved-content.json'; }
  var HOSTS = ['https://cdn.jsdelivr.net', 'https://fastly.jsdelivr.net', 'https://gcore.jsdelivr.net'];

  // прячем тексты и картинки Zero-блоков, пока не подставим эталон (не дольше 1,8 с)
  var style = document.createElement('style');
  style.textContent = 'html.bs-cg-wait .t396 .tn-elem[data-elem-type="text"],' +
    'html.bs-cg-wait .t396 .tn-elem[data-elem-type="image"] { visibility: hidden !important; }';
  (document.head || document.documentElement).appendChild(style);
  var root = document.documentElement;
  root.classList.add('bs-cg-wait');
  var shown = false;
  function reveal() { if (shown) return; shown = true; root.classList.remove('bs-cg-wait'); }
  setTimeout(reveal, 1800);

  var APPROVED = null;

  function setText(id, html) {
    [].slice.call(document.querySelectorAll('.t396 .tn-elem[data-elem-id="' + id + '"][data-elem-type="text"]')).forEach(function (el) {
      var atom = el.querySelector('.tn-atom'); if (!atom) return;
      if (atom.innerHTML !== html) atom.innerHTML = html;
    });
  }
  function setImg(id, src) {
    [].slice.call(document.querySelectorAll('.t396 .tn-elem[data-elem-id="' + id + '"][data-elem-type="image"]')).forEach(function (el) {
      var atom = el.querySelector('.tn-atom');
      var im = atom && atom.tagName === 'IMG' ? atom : el.querySelector('img');
      if (im) {
        if (im.getAttribute('data-original') !== src) im.setAttribute('data-original', src);
        if (im.getAttribute('src') !== src) im.setAttribute('src', src);
        im.removeAttribute('srcset');
      } else if (atom) {
        var want = 'url("' + src + '")';
        if (atom.style.backgroundImage !== want) atom.style.backgroundImage = want;
      }
    });
  }

  var busy = false, timer = null;
  function later() { if (busy) return; clearTimeout(timer); timer = setTimeout(apply, 60); }
  function apply() {
    if (!APPROVED) return;
    busy = true;
    try {
      if (APPROVED.text) Object.keys(APPROVED.text).forEach(function (id) { setText(id, APPROVED.text[id]); });
      if (APPROVED.img) Object.keys(APPROVED.img).forEach(function (id) { setImg(id, APPROVED.img[id]); });
      reveal();
    } finally { setTimeout(function () { busy = false; }, 0); }
  }

  function load() {
    var v = Math.floor(Date.now() / 300000), i = 0;   // обновление эталона подхватывается за ~5 мин
    (function next() {
      if (i >= HOSTS.length) { log('эталон не загрузился'); reveal(); return; }
      fetch(HOSTS[i++] + dataFile() + '?v=' + v)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) {
          APPROVED = (j && j.pages && j.pages[PATH]) || null;
          if (!APPROVED) { reveal(); return; }
          apply();
        })
        .catch(next);
    })();
  }

  function init() {
    load();
    // Тильда перерисовывает Zero-блоки при масштабе/скролле — подставляем эталон заново
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target, el = t.nodeType === 1 ? t : t.parentNode;
        if (el && el.closest && el.closest('.t396')) { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
