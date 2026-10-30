/*! Black Sable — скрипты сайта. Собрано из файлов в папке src/. Не редактируйте этот файл вручную. */

if (window.__bsSiteLoaded) { throw new Error("blacksable.js уже загружен"); }
window.__bsSiteLoaded = true;

try {
/* ===== Цена в заголовке карточки ===== */
(function () {
  var s = document.createElement('style');
  s.setAttribute('data-bs', '01-price');
  s.textContent = ".custom-live-title-price {\n    font-size: 14px !important;\n}\n@media screen and (max-width: 768px) {\n    .custom-live-title-price {\n        font-size: 11px !important;\n    }\n}\n[class*=\"prod-page__price\"], [class*=\"price-wrapper\"], .js-store-prod-price-box {\n    display: none !important;\n    opacity: 0 !important;\n    height: 0 !important;\n    margin: 0 !important;\n    padding: 0 !important;\n}";
  (document.head || document.documentElement).appendChild(s);
})();
(function() {
    function formatDigits(num) {
        let clean = String(num).replace(/[^0-9]/g, '');
        if (!clean) return '';
        return Number(clean).toLocaleString('ru-RU') + ' p.';
    }

    function injectAndPurgePriceAutomated() {
        const products = document.querySelectorAll('.js-store-product, .js-product, .t-store__prod-page');
        
        products.forEach(function(product) {
            const tildaPriceEl = product.querySelector('.js-store-prod-price, .js-product-price, .t-store__prod-page__price-value');
            const titleBlock = product.querySelector('.t-store__prod-page__title, .js-store-prod-title, [field="title"], h1');

            if (tildaPriceEl && titleBlock) {
                let rawPrice = tildaPriceEl.innerText.replace(/[^0-9]/g, '');
                
                if (rawPrice) {
                    // 1. ПОИСК СТРОКИ «ЦВЕТ» (ИЛИ «АРТИКУЛ») И ВНЕДРЕНИЕ ЖИВОЙ ЦЕНЫ С ОТСТУПОМ
                    // Проверяем: если мы уже внедрили нашу кастомную цену, этот блок ИГНОРИРУЕМ намертво.
                    // Больше никакого циклического переписывания innerHTML! Корзина спасена.
                    if (!titleBlock.querySelector('.custom-live-title-price') && !titleBlock.classList.contains('price-injected-done')) {
                        
                        // строку цветов, которую рисует блок цветов из футера, не учитываем: он вставит её заново сам
                        let currentHTML = titleBlock.innerHTML.replace(/<div class="js-cs-line"[\s\S]*?<\/div>/g, '');
                        
                        // ЗАЧИСТКА СТАРОГО РУЧНОГО ТЕКСТА (выполняется строго 1 раз перед вставкой новой цены)
                        let oldPriceRegex = /(<br>)?\s*Цена:\s*[0-9\s ]+р(ублей|уб\.|\.)?/gi;
                        if (oldPriceRegex.test(currentHTML)) {
                            currentHTML = currentHTML.replace(oldPriceRegex, '');
                        }

                        // место для цены: после строки «Цвет:», а если её нет — после «Артикул:» или «Наименование:»
                        let lowerHTML = currentHTML.toLowerCase();
                        let colorIndex = -1;
                        ['цвет:', 'артикул:', 'наименование:'].some(function(key) {
                            colorIndex = lowerHTML.indexOf(key);
                            return colorIndex !== -1;
                        });
                        
                        if (colorIndex !== -1) {
                            let restOfHTML = currentHTML.substring(colorIndex);
                            let brIndex = restOfHTML.indexOf('<br>');
                            let insertPosition = colorIndex + (brIndex !== -1 ? brIndex : restOfHTML.length);
                            
                            let formatted = formatDigits(rawPrice);
                            
                            // Создаем двойной перенос <br><br> для идеального отступа сверху
                            let priceHTML = '<br><br>Цена: <span class="custom-live-title-price" style="font-family:\'Avenir\', \'Avenir Next\', -apple-system, sans-serif !important; color:#1a1a1a !important; font-weight:normal !important;">' + formatted + '</span>';
                            
                            // Ровно один раз обновляем innerHTML заголовка
                            titleBlock.innerHTML = currentHTML.substring(0, insertPosition) + priceHTML + currentHTML.substring(insertPosition);
                            
                            // Вешаем техническую метку, чтобы скрипт больше никогда не перезаписывал этот тег
                            titleBlock.classList.add('price-injected-done');
                        }
                    }

                    // 2. ДИНАМИЧЕСКОЕ ОБНОВЛЕНИЕ ЦЕНЫ В КНОПКЕ ДЛЯ КОРЗИНЫ
                    const buyBtnLink = product.querySelector('a[href^="#order:"]');
                    if (buyBtnLink) {
                        let currentHref = buyBtnLink.getAttribute('href');
                        if (currentHref.includes('=')) {
                            let baseOrderUrl = currentHref.split('=');
                            buyBtnLink.setAttribute('href', baseOrderUrl[0] + '=' + rawPrice);
                        } else {
                            buyBtnLink.setAttribute('href', currentHref + '=' + rawPrice);
                        }
                    }
                }
            }

            // ЖЕСТКАЯ ЗАЧИСТКА НИЗА: Скрываем дублирующие стандартные ценники Tilda
            const allPossiblePrices = product.querySelectorAll('.t-store__prod-page__price-wrapper, .js-store-prod-price-box, .t-store__prod-page__price, .t-store__prod-page__price-wrapper--current');
            allPossiblePrices.forEach(function(el) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('margin', '0', 'important');
                el.style.setProperty('padding', '0', 'important');
            });
        });
    }

    // Спокойный интервал для контроля кнопок и скрытия нижних ценников
    setInterval(function() {
        try {
            injectAndPurgePriceAutomated();
        } catch(e) {}
    }, 80);

    // Логика изменения цифр в тексте и в ссылке кнопки при клике на размеры (42, 44, 46)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.js-store-prod-option-val, .t-product__option-item, .t-store__prod-page__option-val')) {
            setTimeout(function() {
                const livePrices = document.querySelectorAll('.custom-live-title-price');
                const tildaPriceEl = document.querySelector('.js-store-prod-price, .js-product-price, .t-store__prod-page__price-value');
                const buyBtnLink = document.querySelector('a[href^="#order:"]');
                
                if (tildaPriceEl) {
                    let newRaw = tildaPriceEl.innerText.replace(/[^0-9]/g, '');
                    if (newRaw) {
                        // Меняем только текстовое значение внутри span, не трогая структуру заголовка
                        if (livePrices.length > 0) {
                            livePrices.forEach(function(span) {
                                span.innerHTML = formatDigits(newRaw);
                            });
                        }
                        // Меняем цену в кнопке
                        if (buyBtnLink) {
                            let currentHref = buyBtnLink.getAttribute('href');
                            let baseOrderUrl = currentHref.includes('=') ? currentHref.split('=') : [currentHref];
                            buyBtnLink.setAttribute('href', baseOrderUrl[0] + '=' + newRaw);
                        }
                    }
                }
            }, 120);
        }
    });
})();
} catch (e) { if (window.console) console.warn('[blacksable] 01-price:', e); }

try {
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
      // те же селекторы, что у правила 14px выше, иначе оно перебивает мобильный размер
      'a.t-btn.js-cl-subscribe, .t-btn.js-cl-subscribe, .js-cl-subscribe,' +
      'a.t-btn.js-cl-preorder, .t-btn.js-cl-preorder, .js-cl-preorder { font-size: ' + FONT_MOBILE + ' !important; }' +
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
} catch (e) { if (window.console) console.warn('[blacksable] 02-card-logic:', e); }

try {
/* ===== Мелкие правки витрины: переименование кнопок, кликабельные размеры, скрытие «нет в наличии» в каталоге ===== */
(function () {
  var s = document.createElement('style');
  s.setAttribute('data-bs', '03-store-helpers');
  s.textContent = "/* карточки с нулевым остатком: не показываем надпись «нет в наличии» */\n[data-product-inv=\"0\"] .t-store__card__text,\n[data-product-inv=\"0\"] .t-store__card__mark,\n[data-product-inv=\"0\"] [class*=\"sold\"]:not(.cs-sold-out):not(.js-cs-size-out):not(.js-store-product):not(.js-product) {\n  display: none !important;\n  opacity: 0 !important;\n  visibility: hidden !important;\n}\n\n/* на телефоне кнопки размеров тем же кеглем, что и остальной текст карточки (11px) */\n@media screen and (max-width: 640px) {\n  .js-store-product_single .t-product__option-item .t-product__option-title { font-size: 11px !important; }\n}\n\n/* размеры без наличия остаются кликабельными (по клику предлагается предзаказ) */\n.t-product__option-item_disabled,\n.js-store-prod-option-val_disabled,\n.t-product__option-item_disabled * {\n  pointer-events: auto !important;\n  cursor: pointer !important;\n}";
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
} catch (e) { if (window.console) console.warn('[blacksable] 03-store-helpers:', e); }

try {
/* ===== Цвета товаров: строка цветов, наличие по цвету и размеру, верная модификация в корзине ===== */
(function () {
  // если в самой карточке ещё стоит свой скрипт цвета (старый способ), он главнее: футер ничего не делает.
  // Удаляйте коды из карточек постепенно — после удаления карточку подхватит этот блок
  if (window.__cardColorEngineInit || window.__colorPagesInit) return;

  // =====================================================================
  //  ТОВАРЫ С ЦВЕТАМИ. Новый товар = новая группа в этом списке.
  //  name: как цвет называется в Тильде (характеристика «Цвет»), ё и е не различаются
  //  url:  адрес страницы этого цвета, без домена, начинается с /
  //  hidden: true — не показывать цвет в строке (например, страницы пока нет)
  // =====================================================================
  var GROUPS = [
    { product: 'Шапка-ушанка из кашемира BS-FHK-EB', colors: [
      { name: 'Темно-серый', url: '/item_acc_w_shapka_ushanka_iz_cashemira_dark_grey_bs_fhk_eb' },
      { name: 'Бежевый',     url: '/item_acc_w_shapka_ushanka_iz_cashemira_biege_bs_fhk_eb' },
      { name: 'Купрум',      url: '/item_acc_w_shapka_ushanka_iz_cashemira_cuprum_bs_fhk_eb' },
      { name: 'Бордо',       url: '/item_acc_w_shapka_ushanka_iz_cashemira_bordo_bs_fhk_eb' },
      { name: 'Мокко',       url: '/item_acc_w_shapka_ushanka_iz_cashemira_mocco_bs_fhk_eb' },
      { name: 'Трюфель',     url: '/item_acc_w_shapka_ushanka_iz_cashemira_truffle_bs_fhk_eb' },
      { name: 'Орех',        url: '/item_acc_w_shapka_ushanka_iz_cashemira_nut_bs_fhk_eb' }
    ]},
    { product: 'Шапка-ушанка Modern BS-MHMP-EB', colors: [
      { name: 'Бежевый', url: '/item_acc_m_beige_shapka_ushanka_modern_iz_mexa_sobolya_enigma_black_bs_mhmp_eb' },
      { name: 'Серый',   url: '/item_acc_m_grey_shapka_ushanka_modern_iz_mexa_sobolya_enigma_black_bs_mhmp_eb' },
      { name: 'Синий',   url: '/item_acc_m_blue_shapka_ushanka_modern_iz_mexa_sobolya_enigma_black_bs_mhmp_eb' },
      { name: 'Черный',  url: '/item_acc_m_black_shapka_ushanka_modern_iz_mexa_sobolya_enigma_black_bs_mhmp_eb' }
    ]},
    { product: 'Шапка-ушанка Antistorm BS-MHASP-EB', colors: [
      { name: 'Бежевый', url: '/item_acc_m_beige_shapka_ushanka_antistorm_iz_mexa_sobolya_eb_bs_mhasp_eb' },
      { name: 'Серый',   url: '/item_acc_m_grey_shapka_ushanka_antistorm_iz_mexa_sobolya_eb_bs_mhasp_eb' },
      { name: 'Синий',   url: '/item_acc_m_blue_shapka_ushanka_antistorm_iz_mexa_sobolya_eb_bs_mhasp_eb' },
      { name: 'Черный',  url: '/item_acc_m_black_shapka_ushanka_antistorm_iz_mexa_sobolya_eb_bs_mhasp_eb' }
    ]},
    { product: 'Шапка «Английская резинка»', colors: [
      { name: 'Бордо',       url: '/item_acc_w__shapka_angliyskaya_rezinka_bordo' },
      { name: 'Орех',        url: '/item_acc_w__shapka_angliyskaya_rezinka_nut' },
      { name: 'Пудра',       url: '/item_acc_w__shapka_angliyskaya_rezinka_pudra' },
      { name: 'Тёмно-синий', url: '/item_acc_w__shapka_angliyskaya_rezinka_temno_siniy' },
      { name: 'Шоколад',     url: '/item_acc_w__shapka_angliyskaya_rezinka_chocolate' }
    ]},
    { product: 'Шапка Stormy BS-FHSM', colors: [
      { name: 'Оливковый', url: '/item_acc_w_olive_shapka_stormy_s_mexom_sobolya_bs_fhsm' },
      { name: 'Титан',     url: '/item_acc_w_blue_shapka_stormy_s_mexom_sobolya_bs_fhsm' },
      { name: 'Трюфель',   url: '/item_acc_w_brown_shapka_stormy_s_mexom_sobolya_bs_fhsm' }
    ]},
    { product: 'Варежки Stormy BS-ACSSM', colors: [
      { name: 'Оливковый', url: '/item_acc_w_olive_varezhki_stormy_s_mexom_sobolya_bs_acssm' },
      { name: 'Титан',     url: '/item_acc_w_blue_varezhki_stormy_s_mexom_sobolya_bs_acssm' },
      { name: 'Трюфель',   url: '/item_acc_w_brown_varezhki_stormy_s_mexom_sobolya_bs_acssm' }
    ]},
    { product: 'Шапка «Мона» со съёмным помпоном BS-24016', colors: [
      { name: 'Антрацит',        url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016' },
      { name: 'Горький шоколад', url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016_gorky_shokolad' },
      { name: 'Каштан',          url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016_cashtan' },
      { name: 'Персиковый',      url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016_persik' },
      { name: 'Серый',           url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016_seriy' },
      { name: 'Тёмно-синий',     url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016_temno_siniy' },
      { name: 'Черный',          url: '/item_acc_w__shapka_mona_s_pomponom_bs_24016_chorny' }
    ]},
    { product: 'Шапка «Коса» со съёмным помпоном BS-24017', colors: [
      { name: 'Молочный шоколад', url: '/item_acc_w__shapka_kosa_s_pomponom_bs_24017_milk_chocolate' },
      { name: 'Перламутровый',    url: '/item_acc_w__shapka_kosa_s_pomponom_bs_24017_perl' }
    ]},
    { product: 'Шапка «Бриошь» со съёмным помпоном BS-47CC11', colors: [
      { name: 'Бежевый', url: '/item_acc_w__shapka_briosh_s_pomponom_bs_47cc11' },
      { name: 'Какао',   url: '/item_acc_w__shapka_briosh_s_pomponom_bs_47cc11_cacao' },
      { name: 'Серый',   url: '/item_acc_w__shapka_briosh_s_pomponom_bs_47cc11_grey' }
    ]},
    { product: 'Шапка с пайетками со съёмным помпоном BS-47CC15', colors: [
      { name: 'Айвори',  url: '/item_acc_w__shapka_payetki_s_pomponom_bs_47cc15' },
      { name: 'Бежевый', url: '/item_acc_w__shapka_payetki_s_pomponom_bs_47cc15_biege' },
      { name: 'Какао',   url: '/item_acc_w__shapka_payetki_s_pomponom_bs_47cc15_cacao' },
      { name: 'Мокко',   url: '/item_acc_w__shapka_payetki_s_pomponom_bs_47cc15_mocco' },
      { name: 'Черный',  url: '/item_acc_w__shapka_payetki_s_pomponom_bs_47cc15_black' }
    ]},
    { product: 'Куртка двусторонняя Rain BS-FWRN-EB', colors: [
      // каждый цвет — отдельный товар в Тильде; голубая страница намеренно не в списке
      { name: 'Титан',   url: '/item_w_reversible_jacket_rain_s_mexom_sobolya_enigma_black__grey_bs_fwrn-eb' },
      { name: 'Трюфель', url: '/item_w_reversible_jacket_rain_s_mehom_sobolya_brown_bs_fwrn-eb' }
    ]},
    // ---- модели, у которых каждый цвет — отдельный товар в Тильде ----
    { product: 'Бомбер мужской BS-MWB-EB', colors: [
      { name: 'Коричневый', url: '/item_m_brown_bomber_s_mexom_sobolya_enigma_black_bs_mwb-eb' },
      { name: 'Синий',      url: '/item_m_siniy_bomber_s_mexom_sobolya_enigma_black_bs_mwb-eb' },
      { name: 'Зеленый',    url: '/item_m_zeleniy_bomber_s_mexom_sobolya_enigma_black_bs_mwb-eb' }
    ]},
    { product: 'Бомбер мужской с капюшоном BS-MWHB-EB', colors: [
      { name: 'Бежевый', url: '/item_m_beige_bomber_s_kapyshonom_i_mexom_sobolya_enigma_black_bs_mwhb-eb' },
      { name: 'Серый',   url: '/item_m_seriy_bomber_s_kapyshonom_i_mexom_sobolya_enigma_black_bs_mwhb-eb' },
      { name: 'Синий',   url: '/item_m_siniy_bomber_s_kapyshonom_i_mexom_sobolya_enigma_black_bs_mwhb-eb' }
    ]},
    { product: 'Бомбер женский BS-FWHB-EB', colors: [
      { name: 'Кэмэл', url: '/item_w_bomber_iz_cashemire_i_mexa_sobolya_enigma_black_bs_fwhb_eb' },
      { name: 'Серый', url: '/item_w_bomber_iz_cashemire_i_mexa_sobolya_enigma_black_grey_bs_fwhb_eb' }
    ]},
    { product: 'Парка Nicole BS-FWHP', colors: [
      { name: 'Бежевый',    url: '/item_w_parka_nicole_s_mexom_sobolya_enigma_black_bs_fwhp_eb' },
      { name: 'Коричневый', url: '/item_w_parka_nicole_iz_cashemire_i_mexa_sobolya_enigma_black_bs_fwhpc_eb' }
    ]},
    { product: 'Куртка двусторонняя BS-FWDSJ', colors: [
      { name: 'Тёмно-синий', url: '/item_w_reversible_jacket_iz_cashemire_i_mexa_sobolya_enigma_black_bs_fwdsj_eb' },
      { name: 'Коричневый',  url: '/item_w_reversible_jacket_iz_cashemire_i_mexa_sobolya_eb_brown_bs_fwdsj_eb' },
      { name: 'Голубой',     url: '/item_w_reversible_jacket_iz_cashemire_i_mexa_sobolya_eb_blue_bs_fwdsj_eb' },
      { name: 'Тауп',        url: '/item_w_reversible_jacket_iz_cashemire_i_mexa_sobolya_desert_rose_bs_fwdsj_dr' }
    ]},
    { product: 'Чалма BS-FHCH', colors: [
      { name: 'Розовый',    url: '/item_acc_w_chalma_iz_mexa_sobolya_bs_fhch' },
      { name: 'Коричневый', url: '/item_acc_w_chalma_iz_mexa_dikogo_sobolya_bs_fhch' }
    ]},
    { product: 'Повязка BS-ACSP', colors: [
      { name: 'Коричневый', url: '/item_acc_w_povayzka_s_mexom_sobolya_bs_acsp' },
      { name: 'Розовый',    url: '/item_acc_w_povayzka_s_mexom_sobolya_bs_acsp_pink' }
    ]},
    { product: 'Горжетка BS-ACSS', colors: [
      { name: 'Коричневый', url: '/item_acc_w_gorzhetka_s_mexom_sobolya_bs_acss' },
      { name: 'Песочный',   url: '/item_acc_w_gorzhetka_s_mexom_dikogo_sobolya_bs_acss' }
    ]},
    { product: 'Шапка с люрексом BS-005CV', colors: [
      { name: 'Бежевый', url: '/item_acc_w__shapka_s_lurexom_bs-005cv2' },
      { name: 'Серый',   url: '/item_acc_w__shapka_s_lurexom_bs-005cv3' },
      { name: 'Черный',  url: '/item_acc_w__shapka_s_lurexom_bs-005cv1' }
    ]},
    { product: 'Домашние тапочки', colors: [
      { name: 'Коричневый', url: '/item_acc_w_domashnie_tapochki_iz_mexa_sobolya_enigma_black_bs_001m_eb' },
      { name: 'Серебряный', url: '/item_acc_w_domashnie_tapochki_iz_mexa_sobolya_silver_shine_bs_24m_eb' },
      { name: 'Розовый',    url: '/item_acc_w_domashnie_tapochki_iz_mexa_sobolya_bs_24m' }
    ]},
    { product: 'Домашние мюли', colors: [
      { name: 'Коричневый', url: '/item_acc_domashnie_muli_iz_mexa_sobolya_enigma_black_bs_001m_eb' },
      { name: 'Бежевый',    url: '/item_acc_m_domashnie_muli_iz_mexa_dikogo_sobolya_bs_001_mw' }
    ]},
    { product: 'Шапка-ушанка Star BS-FHST', colors: [
      { name: 'Букле', url: '/item_acc_w_beige_shapka_ushanka_s_mexom_sobolya_bs_fhst' },
      { name: 'Синий', url: '/item_acc_w_blue_shapka_ushanka_s_mexom_sobolya_bs_fhst' }
    ]},
    { product: 'Шапка-ушанка из кашемира Desert Rose BS-FHK-DR', colors: [
      { name: 'Золотистый',    url: '/item_acc_w_shapka_ushanka_iz_cashemira_gold_bs-fhk-dr' },
      { name: 'Перламутровый', url: '/item_acc_w_shapka_ushanka_iz_cashemira_perl_bs-fhk-dr' }
    ]},
    { product: 'Шапка-ушанка из кашемира Graphite BS-FHK-G', colors: [
      { name: 'Бежевый', url: '/item_acc_w_shapka_ushanka_iz_cashemira_biege_bs-fhk-g' },
      { name: 'Каштан',  url: '/item_acc_w_shapka_ushanka_iz_cashemira_kashtan_bs-fhk-g' },
      { name: 'Кэмэл',   url: '/item_acc_w_shapka_ushanka_iz_cashemira_camel_bs-fhk-g' }
    ]},
    { product: 'Пальто Monica BS-FWCC-EB', colors: [
      { name: 'Синий',      url: '/item_w_palto_monica_iz_cashmere_i_mexa_sobolya_enigma_black_blue_bs_fwcc-eb' },
      { name: 'Коричневый', url: '/item_w_palto_monica_iz_cashmere_i_mexa_sobolya_enigma_black_brown_bs_fwcc-eb' }
    ]}
  ];
  window.__bsColorGroups = GROUPS;   // этим же списком пользуется каталог (карточки каждого цвета)

  // находим группу, в которой есть адрес этой страницы; если её нет — это не товар с цветами
  function cleanPath(p) {
    var path = p;
    try { path = new URL(p, location.origin).pathname; } catch (e) {}
    try { path = decodeURIComponent(path); } catch (e) {}
    return path.toLowerCase().replace(/\/+$/, '');
  }
  var herePath = cleanPath(location.pathname);
  var COLORS = null;
  for (var gi = 0; gi < GROUPS.length && !COLORS; gi++) {
    for (var ci = 0; ci < GROUPS[gi].colors.length; ci++) {
      if (cleanPath(GROUPS[gi].colors[ci].url) === herePath) { COLORS = GROUPS[gi].colors; break; }
    }
  }
  // карточка без цветов: движок всё равно ведёт выбор размера и кнопку (режим «один цвет»),
  // если у товара есть выбор размера и все модификации одного цвета. Иначе он сам отключится
  var AUTO = !COLORS;
  if (AUTO) {
    if (!/^\/item/i.test(herePath)) return;
    COLORS = [];
  }

  window.__cardColorEngineInit = true;
  window.__colorPagesInit = true;
  window.__colorSelectInit = true;
  window.__colorLinksInit = true;
  window.__colorListInit = true;

  var DEBUG = /[?&]colordebug=1/.test(location.search);



  // ===== НАСТРОЙКИ =====
  var LABEL = 'Цвет';
  var DIM_SOLD_OUT_COLORS = true;   // приглушать цвета, у которых нет ни одного размера в наличии
  var COLOR_OUT_OPACITY = '0.45';
  var DIM_SIZES = true;             // приглушать размеры, которых нет в наличии
  var SIZE_OUT_OPACITY = '0.4';
  var CARRY_SIZE = true;            // переносить выбранный размер на страницу другого цвета
  var REMOVE_OLD_COLOR_TEXT = true; // убрать вручную вписанную строку «Цвет: ...» в заголовке
  var ANCHOR_RE = /артикул/i;       // после какой строки вставлять список цветов
  var POPUP_HASH = '#popup:myform';
  var FIELD_SEL = 'input[name="product_preorder"], input[name="Предзаказ"]';

  var FONT_DESKTOP = '14px';
  var FONT_MOBILE = '11px';
  var MOBILE_MAX_WIDTH = '640px';
  var TEXT_COLOR = '#1a1a1a';
  var UNDERLINE_COLOR = '#1a1a1a';
  var UNDERLINE_THICKNESS = '0.5px';
  var UNDERLINE_OFFSET = '3px';
  var MARGIN_TOP = '16px';
  var MARGIN_BOTTOM = '0px';

  var DATA_URLS = [
    'https://store.tildaapi.com/api/getproductsbyuid/',
    'https://store.tildacdn.com/api/getproductsbyuid/'
  ];

  var COLOR_NAMES = ['цвет', 'цвета', 'color'];
  var SIZE_NAMES = ['размер', 'размеры', 'size'];
  var BOX_SEL = '.js-store-product_single, .js-product-single';
  var OPTION_SEL = '.js-product-edition-option';
  var SKIP_SEL = '.t706, .t-cart-win, .t-minicart';
  var BLOCK_RE = /^(P|DIV|LI|UL|OL|H[1-6]|BLOCKQUOTE|HR)$/;

  var SIZE_KEY = 'colorPagesSize:v1';
  var SIZE_TTL = 2 * 60 * 1000;

  // ===== СТИЛИ =====
  var underline =
    'text-decoration-line: underline; text-decoration-style: solid;' +
    'text-decoration-color: ' + UNDERLINE_COLOR + ';' +
    'text-decoration-thickness: ' + UNDERLINE_THICKNESS + ';' +
    'text-underline-offset: ' + UNDERLINE_OFFSET + ';';
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '.js-cs-line { display: block; font-family: "Avenir", "Avenir Next", sans-serif; font-size: ' + FONT_DESKTOP + ';' +
      'font-weight: normal; color: ' + TEXT_COLOR + '; line-height: 1.55; margin: ' + MARGIN_TOP + ' 0 ' + MARGIN_BOTTOM + '; }' +
    '.js-cs-item { color: inherit; font: inherit; letter-spacing: inherit; cursor: pointer; text-decoration-line: none; }' +
    '.js-cs-item:hover, .js-cs-item:focus-visible { ' + underline + ' }' +
    '.js-cs-item.is-active { ' + underline + ' cursor: default; }' +
    '.js-cs-item.is-out { opacity: ' + COLOR_OUT_OPACITY + '; }' +
    (DIM_SIZES ? '.js-cs-size-out { opacity: ' + SIZE_OUT_OPACITY + ' !important; }' : '') +
    // наличие размеров ведёт этот скрипт: «серость» Тильды (из-за скрытых характеристик) снимаем, серыми остаются только размеры без наличия
    '.cs-managed .t-product__option-item_disabled:not(.js-cs-size-out) { opacity: 1 !important; }' +
    '@media screen and (max-width: ' + MOBILE_MAX_WIDTH + ') { .js-cs-line { font-size: ' + FONT_MOBILE + '; } }';
  document.head.appendChild(styleEl);

  // ===== ВСПОМОГАТЕЛЬНОЕ =====
  function log() {
    if (DEBUG && window.console) console.log.apply(console, ['[cp]'].concat([].slice.call(arguments)));
  }
  function norm(s) { return String(s == null ? '' : s).replace(/ё/gi, 'е').replace(/[\s :]+/g, ' ').trim().toLowerCase(); }
  function sameVal(a, b) { return norm(a) === norm(b); }
  function setClass(el, c, on) {
    if (el && el.classList.contains(c) !== !!on) el.classList[on ? 'add' : 'remove'](c);
  }
  function normPath(p) {
    var path = p;
    try { path = new URL(p, location.origin).pathname; } catch (e) {}
    try { path = decodeURIComponent(path); } catch (e) {}
    return path.toLowerCase().replace(/\/+$/, '');
  }
  var curPath = normPath(location.pathname);
  function pageColorName() {
    for (var i = 0; i < COLORS.length; i++) if (normPath(COLORS[i].url) === curPath) return COLORS[i].name;
    return '';
  }
  var PAGE_COLOR = pageColorName();
  window.__bsPageColor = PAGE_COLOR; // им пользуется блок остатков у партнёров

  function boxes() {
    return [].slice.call(document.querySelectorAll(BOX_SEL)).filter(function (b) { return !b.closest(SKIP_SEL); });
  }
  function optName(opt) { return opt.getAttribute('data-edition-option-id') || ''; }
  function optionsOf(box) { return [].slice.call(box.querySelectorAll(OPTION_SEL)); }
  function sizeOpt(box) {
    return optionsOf(box).filter(function (o) { return SIZE_NAMES.indexOf(norm(optName(o))) > -1; })[0] || null;
  }

  // ===== ДАННЫЕ ТОВАРА ТИЛЬДЫ (все модификации с остатками) =====
  var P = null;          // { editions, sizeKey, colorKey, names }
  var loading = false;
  var disabled = false;  // движок решил, что этой карточке он не нужен

  // ID товара: из карточки, а если Тильда её ещё не нарисовала — из настроек блока в коде страницы
  function genUid() {
    var b = boxes()[0];
    var uid = b ? (b.getAttribute('data-product-gen-uid') || '') : '';
    if (uid) return uid;
    var s = document.querySelectorAll('script:not([src])');
    for (var i = 0; i < s.length; i++) {
      var m = s[i].textContent.match(/storeprod\s*:\s*['"](\d+)['"]/);
      if (m) return m[1];
    }
    return '';
  }

  function useProduct(p, src) {
    if (P || disabled || !p) return false;
    var eds = p.editions;
    if (typeof eds === 'string') { try { eds = JSON.parse(eds); } catch (e) { return false; } }
    if (!eds || !eds.length) return false;
    var keys = Object.keys(eds[0]);
    var sizeKey = keys.filter(function (k) { return SIZE_NAMES.indexOf(norm(k)) > -1; })[0];
    var colorKey = keys.filter(function (k) { return COLOR_NAMES.indexOf(norm(k)) > -1; })[0];
    var opts = [];
    try { opts = JSON.parse(p.json_options || '[]').map(function (o) { return o.title; }); } catch (e) {}
    P = { editions: eds, sizeKey: sizeKey, colorKey: colorKey, names: opts.length ? opts : keys.filter(function (k) {
      return ['uid', 'externalid', 'sku', 'price', 'priceold', 'quantity', 'img'].indexOf(k) === -1;
    }) };
    log('данные товара (' + src + '):', eds.length, 'модификаций, характеристики:', P.names.join(', '));
    if (AUTO) {
      var colors = {};
      if (P.colorKey) eds.forEach(function (ed) { colors[norm(ed[P.colorKey])] = 1; });
      if (!P.sizeKey || eds.length < 2 || Object.keys(colors).length > 1) {
        log('карточка без цветов: движок не нужен (нет выбора размера или у товара несколько цветов без списка)');
        P = null; disabled = true;
        try { document.dispatchEvent(new Event('cs:ready')); } catch (e) {}
        return true;
      }
    }
    if (!colorEds().length) log('ВНИМАНИЕ: в данных нет цвета «' + PAGE_COLOR + '»');
    start();
    return true;
  }

  // данные, которые Тильда уже скачала для карточки (их перехватывает блок «Ускоритель» в HEAD)
  function fromShared(uid) {
    var d = window.__tildaProductsData;
    return d && uid && d[uid] ? useProduct(d[uid], 'Тильда') : false;
  }
  document.addEventListener('cs:productdata', function () { fromShared(genUid()); });

  // страница привязана к товару, которого нет в каталоге (снят со склада): кнопка — «Оформить предзаказ»
  var missingAnswers = 0;
  var missing = false;
  function markMissing() {
    if (P || missingAnswers === 0) return;   // ответа не было вовсе (сеть) — ничего не решаем
    missing = true;
    log('товара этой страницы нет в каталоге: показываем «Оформить предзаказ»');
    boxes().forEach(function (b) { setClass(b, 'js-store-prod-sold-out', true); nudgeFooter(b); });
    try { document.dispatchEvent(new Event('cs:ready')); } catch (e) {}
  }
  function loadData() {
    if (P || loading || disabled) return;
    var uid = genUid();
    if (!uid) return;
    if (fromShared(uid)) return;
    loading = true;
    var i = 0;
    function next() {
      if (P) return;
      if (i >= DATA_URLS.length) { log('данные товара не получены'); loading = false; markMissing(); return; }
      var url = DATA_URLS[i++];
      fetch(url, { method: 'POST', cache: 'no-store', body: JSON.stringify({ productsuid: [uid], c: Date.now() }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var p = j && j.products && j.products[0];
          if (!p && j && j.products) { missingAnswers++; }
          if (!P && !useProduct(p, 'запрос')) throw new Error('нет модификаций');
        })
        .catch(function (e) { log('данные не подошли (' + url + '):', e && e.message); next(); });
    }
    next();
  }

  function inStock(ed) {
    if (!ed) return false;
    var q = ed.quantity;
    if (q === '' || q === null || q === undefined) return true; // пустой остаток = без ограничения
    return parseFloat(q) > 0;
  }
  function colorMatch(ed, name) {
    if (!P.colorKey) return true;
    var c = norm(ed[P.colorKey]), n = norm(name);
    return c === n || c.indexOf(n) === 0;
  }
  function colorEds() {
    if (!P) return [];
    if (!P.colorKey || AUTO) return P.editions;
    if (!PAGE_COLOR) return [];
    var f = P.editions.filter(function (ed) { return colorMatch(ed, PAGE_COLOR); });
    if (f.length) return f;
    // у этой страницы свой товар, где цвет назван иначе (например «Песочный» на сайте и «Бежевый» в Тильде):
    // берём все его модификации. Для общего товара на много цветов так не делаем — там цвет обязан совпасть
    var distinct = {};
    P.editions.forEach(function (ed) { distinct[norm(ed[P.colorKey])] = 1; });
    return Object.keys(distinct).length <= 2 ? P.editions : [];
  }
  function edFor(size) {
    if (!P || !P.sizeKey) return colorEds()[0] || null;
    var list = colorEds().filter(function (ed) { return sameVal(ed[P.sizeKey], size); });
    return list.filter(inStock)[0] || list[0] || null;   // если модификаций размера несколько — берём ту, что в наличии
  }
  function sizeIn(size) { return inStock(edFor(size)); }
  function sizesOfColor() {
    if (!P || !P.sizeKey) return [];
    return colorEds().map(function (ed) { return String(ed[P.sizeKey]); });
  }
  // модификация, которую держит Тильда: выбранный размер, а если его нет в наличии — любой доступный размер этого цвета
  function holdEd() {
    var e = edFor(want.size);
    if (inStock(e)) return e;
    return colorEds().filter(inStock)[0] || null;
  }

  // ===== ВЫБОР РАЗМЕРА =====
  var want = { size: null };

  function takeSavedSize() {
    if (!CARRY_SIZE) return '';
    try {
      var o = JSON.parse(sessionStorage.getItem(SIZE_KEY) || 'null');
      sessionStorage.removeItem(SIZE_KEY);
      if (o && o.v && Date.now() - o.t < SIZE_TTL) return o.v;
    } catch (e) {}
    return '';
  }
  var savedSize = takeSavedSize();
  function saveSize() {
    if (!CARRY_SIZE || !want.size) return;
    try { sessionStorage.setItem(SIZE_KEY, JSON.stringify({ v: want.size, t: Date.now() })); } catch (e) {}
  }

  function initWant() {
    var sizes = sizesOfColor();
    if (!sizes.length) return;
    if (savedSize && sizes.some(function (s) { return sameVal(s, savedSize); })) { want.size = savedSize; return; }
    var firstIn = colorEds().filter(inStock)[0];
    want.size = firstIn ? String(firstIn[P.sizeKey]) : sizes[0];
  }

  // ===== РАБОТА С ХАРАКТЕРИСТИКАМИ ТИЛЬДЫ =====
  function selValue(opt) { var s = opt.querySelector('select'); return s ? s.value : ''; }

  function syncButtons(opt, value) {
    opt.querySelectorAll('.t-product__option-item').forEach(function (l) {
      var inp = l.querySelector('input');
      var on = !!inp && sameVal(inp.value, value);
      if (inp && inp.checked !== on) inp.checked = on;
      setClass(l, 't-product__option-item_active', on);
    });
  }

  // совпадает ли то, что выбрано у Тильды, с модификацией ed (skipSize: размер не сравниваем)
  function boxMatches(box, ed, skipSize) {
    return optionsOf(box).every(function (opt) {
      var n = optName(opt);
      if (skipSize && SIZE_NAMES.indexOf(norm(n)) > -1) return true;
      return !(n in ed) || sameVal(selValue(opt), ed[n]);
    });
  }

  // выставляем все характеристики разом и один раз сообщаем Тильде:
  // она находит ровно эту модификацию и не перескакивает на другую
  var internal = 0;
  function applyEdition(box, ed) {
    internal++;
    try {
      var trigger = null;
      optionsOf(box).forEach(function (opt) {
        var n = optName(opt);
        if (!(n in ed)) return;
        var s = opt.querySelector('select');
        if (s) {
          if (ed[n] === '' || ed[n] == null) {
            s.selectedIndex = -1; // у модификации эта характеристика пустая (например, без года выпуска)
          } else {
            for (var i = 0; i < s.options.length; i++) {
              if (sameVal(s.options[i].value, ed[n])) { s.options[i].disabled = false; s.value = s.options[i].value; }
            }
          }
        }
        syncButtons(opt, ed[n]);
        if (!trigger || SIZE_NAMES.indexOf(norm(n)) > -1) trigger = opt;
      });
      if (trigger) trigger.dispatchEvent(new Event('change'));
    } finally { internal--; }
    log('модификация выставлена:', P.names.map(function (n) { return ed[n]; }).join(' / '), '| остаток:', ed.quantity);
  }

  // показываем выбранный размер (и на кнопках, и в скрытом списке, откуда его читает футер),
  // даже если Тильда держит другую модификацию, потому что выбранной нет в наличии.
  // Событий не шлём: внутреннее состояние Тильды не меняется
  function showSize(box) {
    var so = sizeOpt(box);
    if (!so || !want.size) return;
    syncButtons(so, want.size);
    var s = so.querySelector('select');
    if (s && !sameVal(s.value, want.size)) {
      for (var i = 0; i < s.options.length; i++) if (sameVal(s.options[i].value, want.size)) s.value = s.options[i].value;
    }
  }

  // пометки «нет в наличии» на размерах (по ним футер меняет кнопку на «Оформить предзаказ»)
  function applyFlags(box) {
    var so = sizeOpt(box);
    if (!so) return;
    setClass(so, 'cs-managed', true);
    so.querySelectorAll('.t-product__option-item').forEach(function (l) {
      var inp = l.querySelector('input');
      if (!inp) return;
      var out = !sizeIn(inp.value);
      setClass(inp, 'cs-sold-out', out);
      setClass(l, 'cs-sold-out', out);
      setClass(l, 'js-cs-size-out', out && DIM_SIZES);
    });
    var s = so.querySelector('select');
    if (s) for (var i = 0; i < s.options.length; i++) setClass(s.options[i], 'cs-sold-out', !sizeIn(s.options[i].value));
  }

  // ===== СИНХРОНИЗАЦИЯ =====
  var budget = { n: 0, t: 0 };
  function spend() {
    var now = Date.now();
    if (now - budget.t > 4000) { budget.t = now; budget.n = 0; }
    return ++budget.n <= 10;
  }

  function reconcile(box) {
    if (!P || !box) return;
    if (!want.size) initWant();
    var ed = holdEd();
    // если выбранного размера нет в наличии, в списке размеров стоит он, а цвет и год — от доступной модификации
    var skipSize = !sizeIn(want.size);
    if (ed && !boxMatches(box, ed, skipSize)) {
      if (spend()) applyEdition(box, ed);
      else log('Тильда не принимает модификацию, повторы остановлены');
    }
    showSize(box);
    applyFlags(box);
  }
  function reconcileAll() {
    if (missing) boxes().forEach(function (b) { setClass(b, 'js-store-prod-sold-out', true); });
    window.__pageColor = ''; // скрытый цвет ведёт этот скрипт, футер его не трогает
    boxes().forEach(reconcile);
  }

  // футер пересчитывает кнопку по клику внутри характеристики: даём ему знать
  function nudgeFooter(box) {
    var so = sizeOpt(box);
    var t = so && so.querySelector('.js-product-edition-option-name');
    if (!t) return;
    internal++;
    try { t.dispatchEvent(new MouseEvent('click', { bubbles: true })); } finally { internal--; }
  }

  function chooseSize(box, value) {
    want.size = value;
    budget.n = 0;
    log('выбран размер:', value, sizeIn(value) ? '(в наличии)' : '(нет в наличии)');
    boxes().forEach(function (b) { reconcile(b); });
    nudgeFooter(box);
    [80, 300].forEach(function (ms) { setTimeout(function () { reconcileAll(); nudgeFooter(box); }, ms); });
  }

  // клик по размеру перехватываем, пока его не обработала Тильда
  document.addEventListener('click', function (e) {
    if (!P || !e.isTrusted || internal) return;
    var item = e.target.closest && e.target.closest('.t-product__option-item');
    if (!item) return;
    var opt = item.closest(OPTION_SEL);
    var box = opt && opt.closest(BOX_SEL);
    if (!box || box.closest(SKIP_SEL) || SIZE_NAMES.indexOf(norm(optName(opt))) === -1) return;
    var inp = item.querySelector('input');
    if (!inp) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    chooseSize(box, inp.value);
  }, true);

  // размер выбран через выпадающий список (если где-то он показан списком)
  document.addEventListener('change', function (e) {
    if (!P || !e.isTrusted || internal) return;
    var s = e.target;
    if (!s || s.tagName !== 'SELECT') return;
    var opt = s.closest(OPTION_SEL);
    var box = opt && opt.closest(BOX_SEL);
    if (!box || SIZE_NAMES.indexOf(norm(optName(opt))) === -1) return;
    e.stopPropagation();
    e.stopImmediatePropagation();
    chooseSize(box, s.value);
  }, true);

  // ===== ФОРМА ПРЕДЗАКАЗА =====
  function popupEl() { return document.querySelector('[data-tooltip-hook="' + POPUP_HASH + '"]'); }
  function popupVisible() {
    var el = popupEl();
    if (!el) return false;
    var cs = window.getComputedStyle(el);
    return el.classList.contains('t-popup_show') || (cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0);
  }
  function forceOpen() {
    var el = popupEl();
    if (el) {
      var rec = el.closest('.r');
      var recid = rec ? rec.id.replace('rec', '') : '';
      if (recid && typeof window.t390_showPopup === 'function') { try { window.t390_showPopup(recid); return; } catch (e) {} }
    }
    var a = document.createElement('a');
    a.href = POPUP_HASH; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); }, 100);
  }
  function fillField(value) {
    var tries = 0;
    var t = setInterval(function () {
      var input = document.querySelector(FIELD_SEL);
      if (input) { input.value = value; clearInterval(t); }
      else if (++tries > 15) clearInterval(t);
    }, 200);
  }
  function openForm(box) {
    var t = box.querySelector('.js-product-name, .js-store-prod-name');
    var name = t ? t.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : 'Товар';
    var info = name + (want.size ? ', размер: ' + want.size : '') + (PAGE_COLOR ? ', цвет: ' + PAGE_COLOR : '');
    if (location.hash === POPUP_HASH) history.replaceState(null, '', location.pathname + location.search);
    location.hash = POPUP_HASH;
    fillField(info);
    setTimeout(function () { if (!popupVisible()) forceOpen(); }, 400);
  }

  // ===== КНОПКА «ДОБАВИТЬ В ЗАКАЗ»: в корзину только верная модификация =====
  function isBuyBtn(btn, box) {
    return btn && box && !btn.closest('.js-cs-line') && !!btn.closest('[class*="btn-wrapper"], [class*="btns-wrapper"], .t-store__prod-page__btn, .js-store-prod-page-buy-btn');
  }
  var retryPass = false;
  document.addEventListener('click', function (e) {
    if (!P || retryPass) return;
    var btn = e.target.closest && e.target.closest('.t-btn, .t-btnflex, .js-store-prod-page-buy-btn');
    var box = btn && btn.closest(BOX_SEL);
    if (!isBuyBtn(btn, box) || box.closest(SKIP_SEL)) return;
    if (/js-cl-(subscribe|preorder)/.test(btn.className)) return; // кнопку предзаказа ведёт футер

    var ed = edFor(want.size);
    if (!inStock(ed)) {
      // такой комбинации нет в наличии: в корзину не кладём, открываем форму
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      openForm(box);
      return;
    }
    if (boxMatches(box, ed)) return; // всё верно, пропускаем клик к Тильде

    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    log('перед добавлением в корзину выбор не совпал, исправляем');
    budget.n = 0;
    applyEdition(box, ed);
    setTimeout(function () {
      if (boxMatches(box, ed)) {
        retryPass = true;
        try { btn.click(); } finally { retryPass = false; }
      } else {
        log('Тильда не приняла модификацию, открываем форму');
        openForm(box);
      }
    }, 200);
  }, true);

  // в форму, открытую кнопкой предзаказа из футера, дописываем цвет
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.js-cl-subscribe, .js-cl-preorder');
    if (!b || !PAGE_COLOR) return;
    [450, 900, 1600].forEach(function (ms) {
      setTimeout(function () {
        var inp = document.querySelector(FIELD_SEL);
        if (!inp || !inp.value) return;
        inp.value = inp.value.replace(/,\s*цвет:.*$/i, '') + ', цвет: ' + PAGE_COLOR;
      }, ms);
    });
  }, true);

  // ===== СТРОКА С ЦВЕТАМИ =====
  // наличие другого цвета: если он есть в товаре этой страницы — смотрим там,
  // иначе (у цвета свой товар) берём остатки товара его страницы
  var OTHER = {};          // url цвета -> true (нет в наличии) / false
  var otherAsked = {};
  var OTHER_KEY = 'csOther:v1:';
  var OTHER_TTL = 5 * 60 * 1000;
  function colorOut(c) {
    if (!P) return false;
    if (P.colorKey) {
      var eds = P.editions.filter(function (ed) { return colorMatch(ed, c.name); });
      if (eds.length) return !eds.some(inStock);
    }
    if (OTHER[c.url] !== undefined) return OTHER[c.url];
    askOther(c);
    return false;
  }
  function askOther(c) {
    if (otherAsked[c.url]) return;
    otherAsked[c.url] = true;
    try {
      var hit = JSON.parse(sessionStorage.getItem(OTHER_KEY + c.url) || 'null');
      if (hit && Date.now() - hit.t < OTHER_TTL) { OTHER[c.url] = !!hit.out; return; }
    } catch (e) {}
    fetch(c.url, { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        var ids = [], m, re = /storeprod\s*:\s*['"](\d+)['"]/g;
        while ((m = re.exec(html))) if (ids.indexOf(m[1]) === -1) ids.push(m[1]);
        if (!ids.length) return;
        function remember(out) {
          OTHER[c.url] = out;
          try { sessionStorage.setItem(OTHER_KEY + c.url, JSON.stringify({ t: Date.now(), out: out })); } catch (e) {}
          renderAll();
        }
        return fetch(DATA_URLS[0], { method: 'POST', cache: 'no-store', body: JSON.stringify({ productsuid: ids, c: Date.now() }) })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var p = j && j.products && j.products[0];
            if (!p) { if (j && j.products) remember(true); return; }   // товара цвета нет в каталоге — приглушаем
            var eds = p.editions;
            if (typeof eds === 'string') eds = JSON.parse(eds);
            if (!eds || !eds.length) return;
            var ck = Object.keys(eds[0]).filter(function (k) { return COLOR_NAMES.indexOf(norm(k)) > -1; })[0];
            var mine = ck ? eds.filter(function (ed) { var v = norm(ed[ck]), n = norm(c.name); return v === n || v.indexOf(n) === 0; }) : [];
            if (!mine.length) mine = eds;
            remember(!mine.some(inStock));
          });
      })
      .catch(function () {});
  }
  function isField(el) { return el.nodeType === 1 && (el.hasAttribute('field') || el.classList.contains('js-product-name')); }
  function inLine(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    return !!(el && el.closest && el.closest('.js-cs-line'));
  }
  function findAnchorNode(wrap) {
    var w = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while ((n = w.nextNode())) {
      if (!ANCHOR_RE.test(n.nodeValue) || inLine(n)) continue;
      var p = n;
      while (p.parentNode && p.parentNode !== wrap && !isField(p.parentNode)) p = p.parentNode;
      return p;
    }
    return null;
  }
  function placeAfterAnchor(wrap, line) {
    var node = findAnchorNode(wrap);
    if (!node) return false;
    var parent = node.parentNode, after = node;
    if (!(node.nodeType === 1 && BLOCK_RE.test(node.tagName))) {
      var last = node, found = null, s = node.nextSibling;
      while (s) {
        if (s === line) return true;   // строка цветов уже стоит сразу после строки «Артикул» — не двигаем
        if (s.nodeType === 1 && s.tagName === 'BR') { found = s; break; }
        if (s.nodeType === 1 && BLOCK_RE.test(s.tagName)) { found = last; break; }
        last = s; s = s.nextSibling;
      }
      after = found || last;
    }
    if (after.nextSibling !== line) parent.insertBefore(line, after.nextSibling);
    return true;
  }
  function removeOldColorText(wrap) {
    var w = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT, null, false);
    var n, remove = [];
    while ((n = w.nextNode())) {
      if (inLine(n)) continue;
      if (/^\s*цвет\s*:/i.test(n.nodeValue) && n.nodeValue.length < 200) remove.push(n);
    }
    // убираем всю строку: «Цвет:» и всё, что за ним до переноса строки (текст, ссылки на цвета, выделение)
    remove.forEach(function (node) {
      if (!node.parentNode) return;
      var start = node;
      while (start.parentNode && start.parentNode !== wrap && !isField(start.parentNode)) start = start.parentNode;
      if (start.nodeType === 1 && BLOCK_RE.test(start.tagName)) { start.remove(); return; }
      var cur = start;
      while (cur) {
        var next = cur.nextSibling;
        if (cur !== start) {
          if (cur.nodeType === 1 && cur.tagName === 'BR') { cur.remove(); break; }          // конец строки
          if (cur.nodeType === 1 && (BLOCK_RE.test(cur.tagName) || cur.classList.contains('js-cs-line') ||
              cur.classList.contains('custom-live-title-price'))) break;                     // дальше уже другое
          if (cur.nodeType === 3 && /цена\s*:/i.test(cur.nodeValue)) break;                  // строку цены не трогаем
        }
        cur.remove();
        cur = next;
      }
    });
  }
  function renderColors(box) {
    var shown = COLORS.filter(function (c) { return !c.hidden; }).map(function (c) {
      var cur = normPath(c.url) === curPath;
      return { c: c, cur: cur, out: !cur && DIM_SOLD_OUT_COLORS && colorOut(c) };
    });
    var lines = box.querySelectorAll('.js-cs-line');
    var line = lines[0];
    for (var k = 1; k < lines.length; k++) lines[k].remove();
    if (shown.length < 2) { if (line) line.remove(); return; }
    if (!line) { line = document.createElement('div'); line.className = 'js-cs-line'; }

    var sig = shown.map(function (s) { return s.c.name + '|' + s.c.url + '|' + s.cur + '|' + s.out; }).join('~');
    if (line.getAttribute('data-sig') !== sig) {
      line.textContent = '';
      line.setAttribute('role', 'group');
      line.appendChild(document.createTextNode(LABEL + ': '));
      shown.forEach(function (s, i) {
        var el;
        if (s.cur) { el = document.createElement('span'); el.setAttribute('aria-current', 'page'); }
        else { el = document.createElement('a'); el.href = s.c.url; }
        el.className = 'js-cs-item' + (s.cur ? ' is-active' : '') + (s.out ? ' is-out' : '');
        el.textContent = s.c.name;
        line.appendChild(el);
        if (i < shown.length - 1) line.appendChild(document.createTextNode(', '));
      });
      line.setAttribute('data-sig', sig);
    }
    var wrap = box.querySelector('[class*="title-wrapper"]');
    var placed = wrap && placeAfterAnchor(wrap, line);
    if (!placed) {
      var so = sizeOpt(box);
      if (so && so.parentNode) { if (so.previousElementSibling !== line) so.parentNode.insertBefore(line, so); }
      else if (wrap) { if (line.parentNode !== wrap) wrap.appendChild(line); }
      else return;
    }
    if (wrap && REMOVE_OLD_COLOR_TEXT) removeOldColorText(wrap);
    tidySpacing(line);
  }

  // ровные отступы: над строкой цветов и под ней — ровно одна пустая строка, как между остальными строками заголовка.
  // Переносы строк вокруг строки цветов убираем, а отступ задаём сами — по высоте строки текста заголовка
  function isBr(n) { return !!n && n.nodeType === 1 && n.tagName === 'BR'; }
  function isBlank(n) { return !!n && n.nodeType === 3 && !n.nodeValue.replace(/[\s ]/g, ''); }
  var STARTED_AT = Date.now();
  function tidySpacing(line) {
    var field = line.parentNode;
    if (!field || !(isField(field) || (field.closest && field.closest('[field]')))) return;
    // скрипт цены вставляет «Цена: …», ориентируясь на переносы строк — сначала даём ему отработать
    var box = field.closest(BOX_SEL);
    var waitsPrice = box && box.querySelector('.js-store-prod-price, .js-product-price') &&
      !field.querySelector('.custom-live-title-price') && Date.now() - STARTED_AT < 3000;
    if (waitsPrice) {
      if (!line.__tidyWait) {
        line.__tidyWait = setTimeout(function () { line.__tidyWait = null; if (line.isConnected) tidySpacing(line); }, 150);
      }
      return;
    }
    var p = line.previousSibling;
    while (p && (isBr(p) || isBlank(p))) { var pp = p.previousSibling; p.remove(); p = pp; }
    var n = line.nextSibling;
    while (n && (isBr(n) || isBlank(n))) { var nn = n.nextSibling; n.remove(); n = nn; }
    var cs = window.getComputedStyle(field);
    var lh = parseFloat(cs.lineHeight);
    if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.55;
    var gap = Math.round(lh * 100) / 100 + 'px';
    var st = line.style;
    if (st.marginTop !== gap) st.marginTop = gap;
    if (st.marginBottom !== (n ? gap : '0px')) st.marginBottom = n ? gap : '0px';
    if (st.fontSize !== cs.fontSize) st.fontSize = cs.fontSize;       // как у остального текста заголовка
    if (st.lineHeight !== cs.lineHeight) st.lineHeight = cs.lineHeight;
  }
  function renderAll() { boxes().forEach(function (b) { try { renderColors(b); } catch (e) { log('error render', e); } }); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.js-cs-item');
    if (a) saveSize();
  }, true);

  // ===== ЗАПУСК =====
  // сигнал «карточка готова»: блок «Ускоритель» в HEAD снимает скрытие кнопки и размеров
  var readySent = false;
  function signalReady() {
    if (readySent || !P) return;
    var ok = boxes().some(function (b) { return !!sizeOpt(b); });
    if (!ok) return;
    readySent = true;
    // футер (кнопка «Добавить в заказ» / «Оформить предзаказ») пересчитывается через ~30 мс после сигнала
    setTimeout(function () {
      try { document.dispatchEvent(new Event('cs:ready')); } catch (e) {}
      log('карточка готова');
    }, 120);
  }
  function syncNow() {
    renderAll();
    reconcileAll();
    if (P && !readySent && boxes().some(function (b) { return !!sizeOpt(b); })) {
      boxes().forEach(nudgeFooter);
      signalReady();
    }
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    // пока карточка не готова, реагируем без задержки
    timer = setTimeout(syncNow, readySent ? 80 : 0);
  }
  function start() {
    initWant();
    log('цвет страницы:', PAGE_COLOR || '(адрес не из списка COLORS)', '| размер:', want.size,
      '| наличие:', sizesOfColor().map(function (s) { return s + (sizeIn(s) ? '' : ' (нет)'); }).join(', '));
    syncNow();
    [300, 1000, 2500].forEach(function (ms) { setTimeout(function () { reconcileAll(); boxes().forEach(nudgeFooter); }, ms); });
  }
  function init() {
    renderAll();
    loadData();
    new MutationObserver(function () { if (!P) loadData(); schedule(); })
      .observe(document.body, { childList: true, subtree: true });
    [500, 1500, 4000].forEach(function (ms) { setTimeout(function () { renderAll(); loadData(); }, ms); });
  }
  // запрос остатков отправляем сразу, не дожидаясь отрисовки страницы
  loadData();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
} catch (e) { if (window.console) console.warn('[blacksable] 04-colors:', e); }

try {
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
} catch (e) { if (window.console) console.warn('[blacksable] 05-typograph:', e); }

try {
/* ===== Наличие у магазинов-партнёров: «TSUM — 2 шт.» в списке «Можно приобрести…» на карточке ===== */
(function () {
  if (window.__bsPartnerStockInit) return;
  window.__bsPartnerStockInit = true;
  if (!/^\/(item|test_item)/i.test(location.pathname)) return;

  var DEBUG = /[?&]colordebug=1/.test(location.search);
  // файл с остатками лежит рядом со скриптом в репозитории; обновляется раз в час (как и скрипт)
  // версию (номер) сообщает строка загрузки в подвале; без неё — последняя версия ветки
  function dataFile() { return '/gh/UlyanaNechipor/blacksable-site@' + (window.__bsVersion || 'main') + '/data/partners.json'; }
  var HOSTS = ['https://cdn.jsdelivr.net', 'https://fastly.jsdelivr.net', 'https://gcore.jsdelivr.net'];
  var LIST_RE = /можно приобрести/i;          // по этой фразе находим список магазинов
  var UNIT = 'шт.';
  var SIZE_NAMES = ['размер', 'размеры', 'size'];
  var COLOR_NAMES = ['цвет', 'цвета', 'color'];
  var BOX_SEL = '.js-store-product_single, .js-product-single';
  // одинаковые магазины под разными названиями
  var ALIASES = { 'цум': 'tsum', 'tsum': 'tsum', 'длт': 'длт', 'dlt': 'длт', 'бабочка': 'babochka', 'vipavenue': 'vip avenue' };

  function log() { if (DEBUG && window.console) console.log.apply(console, ['[partners]'].concat([].slice.call(arguments))); }
  function norm(s) { return String(s == null ? '' : s).replace(/ё/gi, 'е').replace(/[\s ]+/g, ' ').trim().toLowerCase(); }
  function shopKey(s) { var n = norm(s); var k = n.replace(/\s+/g, ''); return ALIASES[k] || ALIASES[n] || n; }

  var STYLE = document.createElement('style');
  STYLE.textContent = '.bs-ps-qty { white-space: nowrap; }';
  (document.head || document.documentElement).appendChild(STYLE);

  // ---------- данные ----------
  var ROWS = null, PRODUCT = null;

  function loadRows() {
    var v = Math.floor(Date.now() / 3600000), i = 0;
    function next() {
      if (i >= HOSTS.length) { log('файл остатков не загрузился'); return; }
      fetch(HOSTS[i++] + dataFile() + '?v=' + v)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { ROWS = (j && j.items) || []; log('строк остатков:', ROWS.length, '| обновлено:', j && j.updated); render(); })
        .catch(next);
    }
    next();
  }

  function genUid() {
    var b = document.querySelector(BOX_SEL);
    var uid = b && b.getAttribute('data-product-gen-uid');
    if (uid) return uid;
    var s = document.querySelectorAll('script:not([src])');
    for (var i = 0; i < s.length; i++) { var m = s[i].textContent.match(/storeprod\s*:\s*['"](\d+)['"]/); if (m) return m[1]; }
    return '';
  }
  function loadProduct() {
    var uid = genUid();
    if (!uid) return setTimeout(loadProduct, 500);
    var shared = window.__tildaProductsData && window.__tildaProductsData[uid];
    if (shared) { useProduct(shared); return; }
    fetch('https://store.tildaapi.com/api/getproductsbyuid/', { method: 'POST', body: JSON.stringify({ productsuid: [uid], c: Date.now() }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { useProduct(j && j.products && j.products[0]); })
      .catch(function () {});
  }
  function useProduct(p) {
    if (!p) return;
    var eds = p.editions;
    if (typeof eds === 'string') { try { eds = JSON.parse(eds); } catch (e) { eds = []; } }
    var skus = [p.sku].concat((eds || []).map(function (e) { return e.sku; })).filter(Boolean).map(norm);
    var ck = eds && eds[0] && Object.keys(eds[0]).filter(function (k) { return COLOR_NAMES.indexOf(norm(k)) > -1; })[0];
    var colors = ck ? eds.map(function (e) { return norm(e[ck]); }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }) : [];
    PRODUCT = { skus: skus, colors: colors };
    log('товар:', skus.join(', '), '| цвета:', colors.join(', ') || '—');
    render();
  }

  // ---------- что выбрано на карточке ----------
  function visibleBox() {
    var list = [].slice.call(document.querySelectorAll(BOX_SEL));
    return list.filter(function (b) { return b.getClientRects().length; })[0] || list[0] || null;
  }
  function selectedSize(box) {
    if (!box) return '';
    var opts = box.querySelectorAll('.js-product-edition-option');
    for (var i = 0; i < opts.length; i++) {
      if (SIZE_NAMES.indexOf(norm(opts[i].getAttribute('data-edition-option-id'))) === -1) continue;
      var act = opts[i].querySelector('.t-product__option-item_active input');
      if (act) return act.value;
      var sel = opts[i].querySelector('select');
      return sel ? sel.value : '';
    }
    return '';
  }
  function pageColor() {
    if (window.__bsPageColor) return norm(window.__bsPageColor);           // цвет страницы из блока цветов
    return PRODUCT && PRODUCT.colors.length === 1 ? PRODUCT.colors[0] : '';  // у товара один цвет
  }

  // остатки по магазинам для этой карточки: по выбранному размеру; если в данных размера нет — общее количество модели
  function countsFor(box) {
    var size = norm(selectedSize(box)), color = pageColor(), res = {};
    ROWS.forEach(function (r) {
      if (PRODUCT.skus.indexOf(norm(r.sku)) === -1) return;
      if (r.color && color && norm(r.color) !== color && norm(r.color).indexOf(color) !== 0) return;
      if (r.size && size && norm(r.size) !== size) return;
      var k = shopKey(r.shop);
      if (!res[k]) res[k] = { name: r.shop, qty: 0 };
      res[k].qty += +r.qty || 0;
    });
    return res;
  }

  // ---------- вывод ----------
  function render() {
    if (!ROWS || !PRODUCT) return;
    var box = visibleBox();
    var counts = countsFor(box);
    [].slice.call(document.querySelectorAll('[field]')).forEach(function (field) {
      if (!LIST_RE.test(field.textContent)) return;
      var seen = {};
      [].slice.call(field.querySelectorAll('a')).forEach(function (a) {
        var k = shopKey(a.textContent);
        seen[k] = true;
        var c = counts[k];
        var tag = a.nextSibling && a.nextSibling.nodeType === 1 && a.nextSibling.classList.contains('bs-ps-qty') ? a.nextSibling : null;
        var text = c && c.qty > 0 ? ' — ' + c.qty + ' ' + UNIT : '';
        if (!text) { if (tag) tag.remove(); return; }
        if (!tag) { tag = document.createElement('span'); tag.className = 'bs-ps-qty'; a.parentNode.insertBefore(tag, a.nextSibling); }
        if (tag.textContent !== text) tag.textContent = text;
      });
      // магазины из данных, которых нет в списке на карточке — дописываем строками после последнего магазина
      var extra = field.querySelector('.bs-ps-extra');
      var html = Object.keys(counts).filter(function (k) { return !seen[k] && counts[k].qty > 0; })
        .map(function (k) { return counts[k].name + ' — ' + counts[k].qty + ' ' + UNIT; });
      if (!html.length) { if (extra) extra.remove(); return; }
      if (!extra) {
        extra = document.createElement('span'); extra.className = 'bs-ps-extra';
        var shops = [].slice.call(field.querySelectorAll('a')).filter(function (a) { return !/коллекц/i.test(a.textContent); });
        var last = shops[shops.length - 1];
        if (last) { var after = last.nextSibling && last.nextSibling.classList && last.nextSibling.classList.contains('bs-ps-qty') ? last.nextSibling : last; after.parentNode.insertBefore(extra, after.nextSibling); }
        else field.appendChild(extra);
      }
      var sig = html.join('|');
      if (extra.getAttribute('data-sig') === sig) return;
      extra.textContent = '';
      html.forEach(function (t) { extra.appendChild(document.createElement('br')); extra.appendChild(document.createTextNode(t)); });
      extra.setAttribute('data-sig', sig);
    });
  }

  // пересчёт при выборе размера (меняется отметка выбранного размера) и при перерисовке карточки Тильдой
  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(render, 120); }
  function init() {
    loadRows();
    loadProduct();
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (muts[i].type === 'childList' || (t.closest && t.closest('.js-product-edition-option'))) { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', later);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
} catch (e) { if (window.console) console.warn('[blacksable] 06-partner-stock:', e); }

try {
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
} catch (e) { if (window.console) console.warn('[blacksable] 07-catalog-colors:', e); }
