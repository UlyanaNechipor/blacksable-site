/* ===== Контроль контента Zero-блоков: на сайте показывается утверждённая версия =====
   Сотрудники правят тексты Zero-блоков и баннеры в Тильде, но на живом сайте посетители
   видят последнюю утверждённую версию (эталон из data/approved-content.json), пока правку
   не проверили. Черновик (то, что реально сейчас в Тильде) смотрится по адресу ?draft=1.
   Утверждение = обновление эталона в этом файле (делается после проверки). */
(function () {
  if (window.__bsContentGuardInit) { window.__bsContentGuardInit=false; }
  window.__bsContentGuardInit = true;

  // страницы под контролем (эталон для них лежит в data/approved-content.json)
  var GUARDED = [PATH];

  function normPath(p) { p = (p || '').toLowerCase().replace(/\/+$/, ''); return p || '/'; }
  var PATH = normPath(location.pathname);

  // режим черновика: ?draft=1 включает, ?draft=0 выключает (запоминается на вкладку)
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('draft') === '1') sessionStorage.setItem('bsDraft', '1');
    if (q.get('draft') === '0') sessionStorage.removeItem('bsDraft');
  } catch (e) {}
  var DRAFT = false; try { DRAFT = sessionStorage.getItem('bsDraft') === '1'; } catch (e) {}
  var __DATA={"note":"Утверждённые версии текстов и баннеров Zero-блоков. На живом сайте показываются именно они. Обновляется после проверки правок.","updated":"2026-11-04","pages":{"/":{"text":{"1788191293303000012":"Я&nbsp;прочел и&nbsp;ознакомился с <u>политикой конфиденциальности</u>","1743970799037":"<a style=\"color: inherit\" href=\"https://blacksable.ru/catalog_woman_collection\">Купить коллекцию Black Sable осень-зима 2026-27</a>","1788191982325000018":"&gt;","1792412116852000011":"Я&nbsp;прочел и&nbsp;ознакомился с <a href=\"https://blacksable.ru/rules\" style=\"color: rgb(140, 140, 140);\">политикой конфиденциальности</a>","176261989400859890":"Архив","1744199433928":"Инстаграм","1744199494462":"Телеграм","1744199494431":"Правовая информация","1744199493360":"Бутики","1744199493329":"Контакты","1744199492079":"Подарочный сертификат","1744199489447":"Уход за&nbsp;мехом","1771584892554000011":"Мех","1744199489409":"История","1744201714981":"<a style=\"color: inherit\" href=\"https://blacksable.ru/\">Black Sable © 2026</a>","1771585071457000015":"<a style=\"color: inherit\" href=\"https://blacksable.ru/\">Black Sable © 2026</a>","1744883993435":"<a style=\"color: inherit\" href=\"/catalog_woman_accessories\">Аксессуары</a>","1744883993423":"<a style=\"color: inherit\" href=\"/catalog_woman_collection\">Одежда</a>","1744199490981":"Аксессуары","1744199490947":"Одежда","1744199492047":"<a href=\"/kak_sdelat_zakaz\" style=\"color: rgb(26, 26, 26);\">Оформить заказ</a>","1744883993503":"<a style=\"color: inherit\" href=\"https://blacksable.ru/archive_2026\">Архив</a>","176260351893731710":"<a style=\"color: inherit\" href=\"https://www.instagram.com/blacksable.ru\">Инстаграм</a>","1744883993492":"<a style=\"color: inherit\" href=\"https://t.me/+-pMVfYCZEu5jODUy\" target=\"_blank\" rel=\"noopener\">Телеграм</a>","1744883993464":"<a style=\"color: inherit\" href=\"https://blacksable.ru/showroom\">Контакты</a>","1744883993472":"<a style=\"color: inherit\" href=\"https://blacksable.ru/adresa_butikov_partnerov\">Бутики</a>","1744883993483":"<a style=\"color: inherit\" href=\"https://blacksable.ru/rules\">Правовая информация</a>","1744883993453":"<a style=\"color: inherit\" href=\"https://blacksable.ru/podarochnaya_karta\">Подарочный сертификат</a>","1744883993444":"<a style=\"color: inherit\" href=\"https://blacksable.ru/kak_sdelat_zakaz\">Оформить заказ </a>","1744883993409":"<a style=\"color: inherit\" href=\"https://blacksable.ru/care\">Уход за&nbsp;мехом</a>","1771584140142000001":"<a style=\"color: inherit\" href=\"https://blacksable.ru/o_mexe_sobolya\">Мех</a>","1744883993516":"<a style=\"color: inherit\" href=\"https://blacksable.ru/o_brende\">История</a>","1744816170374":"Я&nbsp;прочел и&nbsp;ознакомился с <a href=\"https://blacksable.ru/rules\" style=\"color: rgb(140, 140, 140);\">политикой конфиденциальности</a>"},"img":{"1743966551417":"https://static.tildacdn.com/tild3131-3331-4634-b139-613163303066/2026_09_18_-_BS14532.jpg"}}}}; if (DRAFT) return;   // черновик или страница без контроля — не вмешиваемся

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

  function load() { APPROVED=(__DATA.pages[PATH])||null; if(!APPROVED){reveal();return;} apply(); }

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
