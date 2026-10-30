/* ===== Типограф: висячие предлоги и союзы ===== */
(function () {
  if (window.__typoInit) return;
  window.__typoInit = true;

  var NBSP = ' ';

  // слова из 1–2 букв и служебные слова: приклеиваются к следующему слову
  var SHORT = '[А-Яа-яЁёA-Za-z]{1,2}|без|для|при|под|над|про|изо|обо|ото|подо|надо|или|что|как|это|все|так|' +
    'через|перед|между|около|после|чтобы|если|либо|когда';
  var RE_SHORT = new RegExp('(^|[\\s\\u00a0(«"„“\'—–-])(' + SHORT + ') (?=[^\\s])', 'gi');
  // частицы «же», «ли», «бы» приклеиваются к предыдущему слову
  var RE_PARTICLE = /([^\s]) (же|ли|ль|бы|б)(?=$|[\s.,!?;:…»")])/gi;
  // тире (и дефис, стоящий вместо тире между пробелами) не начинает строку
  var RE_DASH = /([^\s]) ([—–]|-(?= ))/g;
  // число не отрывается от следующего слова или знака (12 см, 295 000 р., 25 %)
  var RE_NUM = /(\d) (?=[\dА-Яа-яЁёA-Za-z%₽$€№])/g;

  // где ничего не трогаем: служебные теги, поля ввода, кнопки (их текст меняют другие скрипты),
  // корзина, выбор характеристик и любой элемент, которому вы дадите класс no-typo
  var SKIP_TAGS = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|OPTION|BUTTON|CODE|PRE|SVG|IFRAME|TEMPLATE)$/;
  var SKIP_SEL = '.no-typo, [contenteditable], .t706, .t-cart-win, .t-minicart, ' +
    '.js-product-edition-option, .t-product__option, .t-btn, .t-btnflex, .t-submit, .js-cs-line';

  function fix(text) {
    var out = text, prev;
    // повторяем: «и в лес» — оба коротких слова подряд
    for (var i = 0; i < 3 && out !== prev; i++) {
      prev = out;
      out = out.replace(RE_SHORT, '$1$2' + NBSP);
    }
    return out
      .replace(RE_PARTICLE, '$1' + NBSP + '$2')
      .replace(RE_DASH, '$1' + NBSP + '$2')
      .replace(RE_NUM, '$1' + NBSP);
  }

  function skip(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (SKIP_TAGS.test(n.tagName)) return true;
    }
    return !!(el.closest && el.closest(SKIP_SEL));
  }

  function process(root) {
    if (!root) return;
    if (root.nodeType === 3) { root = root.parentElement; if (!root) return; }
    if (root.nodeType !== 1 || skip(root)) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf(' ') === -1) return NodeFilter.FILTER_REJECT;
        return skip(node.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var node, list = [];
    while ((node = walker.nextNode())) list.push(node);
    list.forEach(function (t) {
      var v = fix(t.nodeValue);
      if (v !== t.nodeValue) t.nodeValue = v;
    });
  }

  function init() {
    var all = document.getElementById('allrecords');
    if (all && all.getAttribute('data-tilda-mode') === 'edit') return; // в редакторе Тильды не работаем

    process(document.body);

    // Тильда дорисовывает каталог, карточки и попапы позже: обрабатываем только новое
    var queue = [], timer = null;
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) queue.push(m.addedNodes[i]);
      });
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = queue; queue = [];
        q.forEach(function (n) { if (n.isConnected) process(n); });
      }, 100);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
