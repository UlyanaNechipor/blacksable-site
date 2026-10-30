/* ===== Кнопка «Добавить в заказ» / «Оформить предзаказ», скрытие лишних характеристик ===== */
(function () {
  if (window.__cardLogicInit) return;
  window.__cardLogicInit = true;
  window.__keepOnlySizeInit = true; // блокирует старый скрипт «только размер», если он остался

  var DEBUG = /[?&]colordebug=1/.test(location.search);

  // ===== НАСТРОЙКИ =====
  var BTN_TEXT = 'Добавить в заказ';
  var SUBSCRIBE_TEXT = 'Оформить предзаказ';     // выбранного размера нет в наличии (другие размеры есть)
  var PREORDER_TEXT = 'Оформить предзаказ';         // нет в наличии вообще ни одного размера
  var PREORDER_WHEN_ALL_SOLD_OUT = true;            // false: везде показывать SUBSCRIBE_TEXT
  var POPUP_HASH = '#popup:myform';
  var OLD_TEXTS = ['отправить заказ', 'отправить']; // тексты, которые заменяем на BTN_TEXT
  var FIELD_SEL = 'input[name="product_preorder"], input[name="Предзаказ"]';

  var KEEP = ['размер', 'размеры', 'size'];         // видимые характеристики
  var COLOR_NAMES = ['цвет', 'цвета', 'color'];

  var FONT_DESKTOP = '14px';
  var FONT_MOBILE = '11px';
  var MOBILE_MAX_WIDTH = '640px';
  var TEXT_COLOR = '#1a1a1a';
  var BORDER = '1px solid #1a1a1a';                 // рамка кнопки подписки и предзаказа
  var RADIUS = '2px';                               // скругление кнопки подписки и предзаказа

  var CONTAINER_SEL = '.js-store-product_single, .js-product-single'; // страница одного товара (ST200 / ST210)
  var OPTION_SEL = '.js-product-edition-option, .t-product__option';
  var TITLE_SEL = '.js-product-edition-option-name, .t-product__option-title, .js-product-option-name';
  var SKIP_SEL = '.t706, .t-cart-win, .t-minicart'; // корзину и оформление заказа не трогаем

  var SOLD_CLASS_RE = /disabled|unavailable|sold-?out|out-?of-?stock|nostock/i;
  var SOLD_TEXT_RE = /нет в наличии|распродан|закончил|sold\s*out|out of stock/i;

  // ===== СТИЛИ =====
  var common =
    'opacity: 1 !important; pointer-events: auto !important; cursor: pointer;' +
    'font-family: "Avenir", "Avenir Next", sans-serif !important;' +
    'font-size: ' + FONT_DESKTOP + ' !important; font-weight: normal !important;' +
    'color: ' + TEXT_COLOR + ' !important;' +
    'background-image: none !important; box-shadow: none !important;' +
    'box-sizing: border-box !important;' +
    'border: ' + BORDER + ' !important; border-radius: ' + RADIUS + ' !important;' +
    'transition: background-color .2s ease;';

  var styleEl = document.createElement('style');
  styleEl.textContent =
    '.js-option-hidden { display: none !important; }' +
    // цвет заливки через переменную, чтобы работал ховер
    '.js-cl-subscribe { --cl-bg: #ffffff; }' +
    '.js-cl-subscribe:hover { --cl-bg: #f4f4f4; }' +
    '.js-cl-preorder { --cl-bg: transparent; }' +
    '.js-cl-preorder:hover { --cl-bg: rgba(26,26,26,.05); }' +
    'a.t-btn.js-cl-subscribe, .t-btn.js-cl-subscribe, .js-cl-subscribe {' +
      'background-color: var(--cl-bg, #ffffff) !important; ' + common +
    '}' +
    'a.t-btn.js-cl-preorder, .t-btn.js-cl-preorder, .js-cl-preorder {' +
      'background-color: var(--cl-bg, transparent) !important; ' + common +
    '}' +
    '.js-cl-subscribe *, .js-cl-preorder * { color: ' + TEXT_COLOR + ' !important; font-size: inherit !important; }' +
    '@media screen and (max-width: ' + MOBILE_MAX_WIDTH + ') {' +
      '.js-cl-subscribe, .js-cl-preorder { font-size: ' + FONT_MOBILE + ' !important; }' +
    '}';
  document.head.appendChild(styleEl);

  // ===== ВСПОМОГАТЕЛЬНОЕ =====
  function log() {
    if (DEBUG && window.console) console.log.apply(console, ['[card]'].concat([].slice.call(arguments)));
  }
  function norm(s) { return (s || '').replace(/[\s\u00a0:]+/g, ' ').trim().toLowerCase(); }
  function normText(s) { return (s || '').replace(/ё/gi, 'е').replace(/[\s\u00a0]+/g, ' ').trim().toLowerCase(); }
  function fire(el, type) {
    var ev;
    try { ev = new Event(type, { bubbles: true, cancelable: true }); }
    catch (e) { ev = document.createEvent('Event'); ev.initEvent(type, true, true); }
    el.dispatchEvent(ev);
  }
  function addClass(el, c) { if (!el.classList.contains(c)) el.classList.add(c); }
  function removeClass(el, c) { if (el.classList.contains(c)) el.classList.remove(c); }
  function setText(el, text) { if (el.textContent.trim() !== text) el.textContent = text; }

  // стили кнопки прямо на элементе (с !important), чтобы Тильда не могла их перебить
  var PAINT_PROPS = ['background-color', 'border', 'border-radius', 'color', 'background-image', 'box-shadow', 'box-sizing', 'opacity', 'pointer-events'];
  function paint(btn, mode) {
    if (!mode) {
      PAINT_PROPS.forEach(function (p) { btn.style.removeProperty(p); });
      return;
    }
    var bg = mode === 'subscribe' ? 'var(--cl-bg, #ffffff)' : 'var(--cl-bg, transparent)';
    btn.style.setProperty('background-color', bg, 'important');
    btn.style.setProperty('border', BORDER, 'important');
    btn.style.setProperty('border-radius', RADIUS, 'important');
    btn.style.setProperty('color', TEXT_COLOR, 'important');
    btn.style.setProperty('background-image', 'none', 'important');
    btn.style.setProperty('box-shadow', 'none', 'important');
    btn.style.setProperty('box-sizing', 'border-box', 'important');
    btn.style.setProperty('opacity', '1', 'important');
    btn.style.setProperty('pointer-events', 'auto', 'important');
  }

  // ===== ХАРАКТЕРИСТИКИ =====
  function optionName(opt) {
    var id = opt.getAttribute('data-edition-option-id');
    if (id) return norm(id);
    var t = opt.matches(TITLE_SEL) ? opt : opt.querySelector(TITLE_SEL);
    return t ? norm(t.textContent) : '';
  }

  function radioOut(r) {
    if (r.disabled) return true;
    var n = r;
    for (var i = 0; i < 4 && n && n.nodeType === 1; i++, n = n.parentElement) {
      if (typeof n.className === 'string' && SOLD_CLASS_RE.test(n.className)) return true;
      if (n.getAttribute && n.getAttribute('aria-disabled') === 'true') return true;
    }
    return false;
  }

  function readValues(opt) {
    var vals = [];
    var sel = opt.querySelector('select');
    if (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        var o = sel.options[i];
        vals.push({ value: o.value, text: o.textContent, disabled: o.disabled || SOLD_CLASS_RE.test(o.className || '') });
      }
    } else {
      opt.querySelectorAll('input[type="radio"]').forEach(function (r) {
        vals.push({ value: r.value, text: r.value, disabled: radioOut(r) });
      });
    }
    return vals.filter(function (v) { return v.value; });
  }

  function currentValue(opt) {
    var sel = opt.querySelector('select');
    if (sel) return sel.value;
    var r = opt.querySelector('input[type="radio"]:checked');
    return r ? r.value : '';
  }

  // точное совпадение, затем «начинается с» (Бежевый -> Бежевый (Taupe))
  function pickValue(vals, target) {
    var t = normText(target), i;
    for (i = 0; i < vals.length; i++) {
      if (normText(vals[i].value) === t || normText(vals[i].text) === t) return vals[i];
    }
    for (i = 0; i < vals.length; i++) {
      if (normText(vals[i].text).indexOf(t) === 0 || normText(vals[i].value).indexOf(t) === 0) return vals[i];
    }
    return null;
  }

  function applyValue(opt, pick) {
    var sel = opt.querySelector('select');
    if (sel) {
      for (var i = 0; i < sel.options.length; i++) sel.options[i].selected = (sel.options[i].value === pick.value);
      sel.value = pick.value;
      fire(sel, 'input');
      fire(sel, 'change');
      if (window.jQuery) { try { window.jQuery(sel).trigger('change'); } catch (e) {} }
      return;
    }
    var radios = opt.querySelectorAll('input[type="radio"]');
    for (var j = 0; j < radios.length; j++) {
      if (radios[j].value === pick.value) {
        radios[j].click();
        if (!radios[j].checked) { radios[j].checked = true; fire(radios[j], 'change'); }
        if (window.jQuery) { try { window.jQuery(radios[j]).trigger('change'); } catch (e) {} }
        return;
      }
    }
  }

  // ограничитель: скрипт и Тильда не должны бесконечно переключать значения друг за другом
  var budget = { n: 0, t: 0 };
  function setWithBudget(opt, pick) {
    var now = Date.now();
    if (now - budget.t > 3000) { budget.t = now; budget.n = 0; }
    if (++budget.n > 8) { log('слишком частые переключения, остановлено'); return; }
    log('выставлено:', optionName(opt), '=', pick.text);
    applyValue(opt, pick);
  }

  // цвет текущей страницы: из строки цветов (скрипт цвета) или из window.__pageColor
  function pageColor() {
    var cur = document.querySelector('.js-color-links .js-color-current');
    if (cur) return cur.textContent.trim();
    return window.__pageColor || '';
  }

  // видна только «Размер»; скрытые характеристики выставляются так, чтобы в корзину попала верная комбинация
  function processOptions() {
    var color = pageColor();

    document.querySelectorAll(OPTION_SEL).forEach(function (opt) {
      if (opt.closest(SKIP_SEL)) return;
      var name = optionName(opt);
      if (!name) return; // название не нашли: оставляем как есть

      var keep = KEEP.indexOf(name) > -1;
      if (keep) { removeClass(opt, 'js-option-hidden'); return; } // размеры не трогаем: кликабельны все
      addClass(opt, 'js-option-hidden');

      var vals = readValues(opt);
      if (!vals.length) return;
      var cur = currentValue(opt);
      var pick = null;

      if (COLOR_NAMES.indexOf(name) > -1) {
        if (color) pick = pickValue(vals, color);
      } else {
        var sel = vals.filter(function (v) { return v.value === cur; })[0];
        if (sel && sel.disabled) pick = vals.filter(function (v) { return !v.disabled; })[0] || null;
      }
      if (pick && pick.value !== cur) setWithBudget(opt, pick);
    });
  }

  // ===== НАЛИЧИЕ РАЗМЕРОВ (по каждому размеру отдельно) =====
  function sizeInfo(box) {
    var info = { total: 0, out: 0, selectedOut: false, size: '' };
    box.querySelectorAll(OPTION_SEL).forEach(function (opt) {
      if (opt.closest(SKIP_SEL) || KEEP.indexOf(optionName(opt)) === -1) return;
      var cur = currentValue(opt);
      if (cur) info.size = cur;
      readValues(opt).forEach(function (v) {
        info.total++;
        if (v.disabled) info.out++;
        if (v.value === cur && v.disabled) info.selectedOut = true;
      });
    });
    return info;
  }

  // есть ли у товара выбор характеристик (тогда остаток data-product-inv ненадёжен: это остаток одной вариации)
  function hasEditionOptions(box) {
    var found = false;
    box.querySelectorAll(OPTION_SEL).forEach(function (opt) {
      if (!opt.closest(SKIP_SEL)) found = true;
    });
    return found;
  }

  // ===== ПОПАП =====
  function getPopupEl() { return document.querySelector('[data-tooltip-hook="' + POPUP_HASH + '"]'); }

  function isPopupVisible() {
    var el = getPopupEl();
    if (!el) return false;
    var cs = window.getComputedStyle(el);
    return el.classList.contains('t-popup_show') ||
      (cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0);
  }

  function forceOpenPopup() {
    var el = getPopupEl();
    if (el) {
      var rec = el.closest('.r');
      var recid = rec ? rec.id.replace('rec', '') : '';
      if (recid && typeof window.t390_showPopup === 'function') {
        try { window.t390_showPopup(recid); return; } catch (e) {}
      }
    }
    var a = document.createElement('a');
    a.href = POPUP_HASH;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); }, 100);
  }

  function fillField(value) {
    if (!value) return;
    var tries = 0;
    var timer = setInterval(function () {
      var input = document.querySelector(FIELD_SEL);
      if (input) { input.value = value; clearInterval(timer); }
      else if (++tries > 15) clearInterval(timer);
    }, 200);
  }

  function nameFromHref(href) {
    if (!href || href.indexOf('#order:') !== 0) return '';
    try {
      var raw = decodeURIComponent(href.replace(/^#order:/, ''));
      var i = raw.lastIndexOf('=');
      return (i > -1 ? raw.slice(0, i) : raw).trim();
    } catch (e) { return ''; }
  }

  function productInfo(box, btn) {
    var name = nameFromHref(btn.getAttribute('href') || '');
    if (!name) {
      var t = box.querySelector('.js-product-name, .js-store-prod-name, .t-store__prod-page__title, .js-store-prod-title');
      name = t ? t.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : 'Товар';
    }
    var size = sizeInfo(box).size;
    return size ? name + ', размер: ' + size : name;
  }

  function openForm(btn) {
    var box = btn.closest(CONTAINER_SEL) || document;
    var info = productInfo(box, btn);
    if (window.location.hash === POPUP_HASH) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.location.hash = POPUP_HASH;
    fillField(info);
    setTimeout(function () { if (!isPopupVisible()) forceOpenPopup(); }, 400);
  }

  // ===== КНОПКА =====
  function findBuyBtn(box) {
    var list = box.querySelectorAll(
      '.t-store__prod-page__btn, .js-store-prod-page-buy-btn, ' +
      '[class*="btn-wrapper"] .t-btn, [class*="btns-wrapper"] .t-btn'
    );
    for (var i = 0; i < list.length; i++) {
      if (!list[i].closest(SKIP_SEL) && !list[i].closest('.js-color-links') && !list[i].closest('.js-cs-line')) return list[i];
    }
    return null;
  }

  function processButton(box) {
    if (box.closest(SKIP_SEL)) return;
    var btn = findBuyBtn(box);
    if (!btn) return;

    var textEl = btn.querySelector('.t-btnflex__text') || btn;
    var text = norm(textEl.textContent);

    // текст кнопки: если Тильда его переписала, пересчитываем признак, иначе берём запомненный
    var ours = [norm(BTN_TEXT), norm(SUBSCRIBE_TEXT), norm(PREORDER_TEXT)].indexOf(text) > -1;
    if (!ours) btn.setAttribute('data-cl-text-sold', SOLD_TEXT_RE.test(text) ? '1' : '0');
    var textSold = btn.getAttribute('data-cl-text-sold') === '1';

    var ownCls = (btn.className || '').replace(/js-cl-\w+/g, '');
    var clsSold = /disabled/i.test(ownCls);
    var boxSold = box.classList.contains('js-store-prod-sold-out');

    var info = sizeInfo(box);

    // data-product-inv у товаров с выбором размера хранит остаток одной вариации, а не всего товара:
    // учитываем его у товаров без характеристик и у товаров, где нет выбора размера (только скрытые характеристики)
    var invSold = (!hasEditionOptions(box) || info.total === 0) && parseInt(box.getAttribute('data-product-inv'), 10) === 0;

    var soldOut = info.selectedOut || boxSold || clsSold || textSold || invSold;

    if (soldOut) {
      // «предзаказ» только если недоступны все размеры (или у товара нет размеров вообще)
      var allOut = info.total > 0 ? info.out === info.total : true;
      var preorder = PREORDER_WHEN_ALL_SOLD_OUT && allOut;
      var mode = preorder ? 'preorder' : 'subscribe';
      addClass(btn, preorder ? 'js-cl-preorder' : 'js-cl-subscribe');
      removeClass(btn, preorder ? 'js-cl-subscribe' : 'js-cl-preorder');
      removeClass(btn, 't-btn_disabled');
      paint(btn, mode);
      setText(textEl, preorder ? PREORDER_TEXT : SUBSCRIBE_TEXT);
    } else if (btn.classList.contains('js-cl-subscribe') || btn.classList.contains('js-cl-preorder')) {
      removeClass(btn, 'js-cl-subscribe');
      removeClass(btn, 'js-cl-preorder');
      btn.setAttribute('data-cl-text-sold', '0');
      paint(btn, null);
      setText(textEl, BTN_TEXT);
    } else if (OLD_TEXTS.indexOf(text) > -1) {
      setText(textEl, BTN_TEXT);
    }
  }

  // ===== ОСНОВНОЙ ЦИКЛ =====
  function run() {
    try {
      processOptions();
      document.querySelectorAll(CONTAINER_SEL).forEach(processButton);
    } catch (e) { log('error', e); }
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 80);
  }

  // клик по кнопке «Подписаться» / «Предзаказ» открывает форму (capture: раньше обработчиков Тильды)
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest('.js-cl-subscribe, .js-cl-preorder');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openForm(b);
  }, true);

  // после выбора размера пересчитываем кнопку и скрытые характеристики
  function afterOptionAction(e) {
    if (!e.target.closest || !e.target.closest(OPTION_SEL)) return;
    setTimeout(run, 30);
    setTimeout(run, 250);
    setTimeout(run, 600);
  }
  document.addEventListener('change', afterOptionAction, false);
  document.addEventListener('click', afterOptionAction, false);

  function init() {
    run();

    // Тильда рисует характеристики и кнопки после загрузки данных товара
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });

    setTimeout(run, 1000);
    setTimeout(run, 3000);

    if (DEBUG) {
      setTimeout(function () {
        document.querySelectorAll(CONTAINER_SEL).forEach(function (box) {
          var i = sizeInfo(box);
          log('data-product-inv:', box.getAttribute('data-product-inv'),
              '| класс sold-out:', box.classList.contains('js-store-prod-sold-out'),
              '| размеров:', i.total, ', недоступных:', i.out, ', выбран:', i.size, i.selectedOut ? '(недоступен)' : '(доступен)');
          var b = findBuyBtn(box);
          if (b) log('кнопка:', b.className, '| текст:', b.textContent.trim(), '| style:', b.getAttribute('style'));
        });
        document.querySelectorAll(OPTION_SEL).forEach(function (opt) {
          if (opt.closest(SKIP_SEL)) return;
          log('характеристика «' + optionName(opt) + '»: выбрано «' + currentValue(opt) + '»',
            readValues(opt).map(function (v) { return v.text + (v.disabled ? ' (нет)' : ''); }));
        });
      }, 2000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
