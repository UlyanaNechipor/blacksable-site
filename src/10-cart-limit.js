/* ===== Корзина: подпись о лимите онлайн-оплаты, когда сумма заказа больше 1 000 000 ₽ ===== */
(function () {
  if (window.__bsCartLimitInit) return;
  window.__bsCartLimitInit = true;

  var LIMIT = 1000000;
  var TEXT = 'Лимит на покупку онлайн 1 000 000 рублей. Покупки свыше лимита оформляются индивидуально с менеджером.';

  var style = document.createElement('style');
  style.textContent =
    '.bs-cart-limit { margin-top: 12px; font-family: var(--t-text-font, Arial); font-size: 13px; line-height: 1.4; color: #1a1a1a; }\n' +
    '@media (max-width: 640px) { .bs-cart-limit { font-size: 11px; } }';
  (document.head || document.documentElement).appendChild(style);

  // сумма, которую покупатель будет платить (со скидками и доставкой, если они есть)
  function cartSum() {
    var c = window.tcart;
    if (!c) return 0;
    return parseFloat(c.amount) || parseFloat(c.prodamount_withdyndiscount) || parseFloat(c.prodamount) || 0;
  }

  function update() {
    var forms = document.querySelectorAll('.t706 form');
    var over = cartSum() > LIMIT;
    [].slice.call(forms).forEach(function (form) {
      var submit = form.querySelector('.t-form__submit');
      if (!submit) return;
      var note = form.querySelector('.bs-cart-limit');
      if (!over) { if (note) note.remove(); return; }
      if (!note) {
        note = document.createElement('div');
        note.className = 'bs-cart-limit no-typo';
        note.textContent = TEXT;
        submit.parentNode.insertBefore(note, submit.nextSibling);
      }
    });
  }

  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(update, 80); }

  function init() {
    update();
    // корзина пересчитывается при добавлении, удалении и смене количества — следим за суммой в корзине
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        var el = t.nodeType === 1 ? t : t.parentNode;
        if (el && el.closest && el.closest('.t706') && !(el.closest('.bs-cart-limit'))) { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
