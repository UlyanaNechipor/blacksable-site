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
