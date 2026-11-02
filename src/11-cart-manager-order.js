/* ===== Корзина: заказ дороже 1 000 000 ₽ — без онлайн-оплаты, через менеджера =====
   Нужно поле «Способ оплаты» в корзине и способ без онлайн-оплаты (наличными в шоу-руме).
   Сумма больше лимита → выбираем оплату не онлайн, онлайн-оплату прячем, в заказ пишем пометку
   для менеджера, после отправки — страница успеха (или сообщение в корзине, если страницы нет). */
(function () {
  if (window.__bsCartManagerInit) return;
  window.__bsCartManagerInit = true;

  var LIMIT = 1000000;
  var SUCCESS_URL = '';   // адрес страницы успеха, например '/zakaz_prinyat'; пусто — сообщение в корзине
  var SUCCESS_TEXT = 'Спасибо! Заказ оформлен. Менеджер свяжется с вами в ближайшее время, чтобы согласовать оплату и доставку.';
  var NOTE_NAME = 'Оплата';
  var ONLINE_RE = /kassa|yookassa|yakassa|cloudpay|tinkoff|sber|robokassa|online|онлайн|карт/i;

  function cartSum() {
    var c = window.tcart;
    if (!c) return 0;
    return parseFloat(c.amount) || parseFloat(c.prodamount_withdyndiscount) || parseFloat(c.prodamount) || 0;
  }
  function fmt(n) { return Math.round(n).toLocaleString('ru-RU') + ' р.'; }

  function payRadios(form) {
    return [].slice.call(form.querySelectorAll('input[type="radio"]')).filter(function (i) {
      return /pay/i.test(i.name) || (i.closest('.t-input-group') && /_pm\b|paym/i.test(i.closest('.t-input-group').className));
    });
  }
  function isOnline(input) {
    var label = input.closest('label');
    return ONLINE_RE.test(input.value) || ONLINE_RE.test(label ? label.textContent : '');
  }

  var overOnSubmit = false;

  function update() {
    var over = cartSum() > LIMIT;
    [].slice.call(document.querySelectorAll('.t706 form')).forEach(function (form) {
      var radios = payRadios(form);
      var offline = radios.filter(function (i) { return !isOnline(i); });
      var note = form.querySelector('input[type="hidden"][data-bs-note]');
      radios.forEach(function (i) {
        var row = i.closest('label') || i.parentNode;
        if (isOnline(i)) { i.disabled = over; if (row) row.style.display = over ? 'none' : ''; }
      });
      if (over && offline.length) {
        if (!offline.some(function (i) { return i.checked; })) { offline[0].checked = true; offline[0].dispatchEvent(new Event('change', { bubbles: true })); }
        if (!note) {
          note = document.createElement('input');
          note.type = 'hidden'; note.name = NOTE_NAME; note.setAttribute('data-bs-note', '1');
          form.appendChild(note);
        }
        note.value = 'Сумма выше лимита онлайн-оплаты (' + fmt(cartSum()) + ') — оформить через менеджера';
      } else if (note) {
        note.remove();
      }
    });
  }

  // запоминаем, что отправили заказ дороже лимита без онлайн-оплаты
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.closest || !form.closest('.t706')) return;
    update();
    var radios = payRadios(form);
    var picked = radios.filter(function (i) { return i.checked; })[0];
    overOnSubmit = cartSum() > LIMIT && !!picked && !isOnline(picked);
  }, true);

  // после успешной отправки — страница успеха или наше сообщение
  function afterSuccess(form) {
    if (!overOnSubmit) return;
    overOnSubmit = false;
    if (SUCCESS_URL) { location.href = SUCCESS_URL; return; }
    var box = form && form.querySelector('.t-form__successbox');
    if (box) { box.textContent = SUCCESS_TEXT; box.style.display = 'block'; }
  }
  document.addEventListener('tildaform:aftersuccess', function (e) {
    var form = e.target && e.target.closest ? e.target.closest('form') : null;
    if (form && form.closest('.t706')) afterSuccess(form);
  });
  // запасной путь: Тильда показала своё сообщение об успехе в корзине
  new MutationObserver(function () {
    if (!overOnSubmit) return;
    var box = document.querySelector('.t706 .t-form__successbox');
    if (box && box.style.display !== 'none' && box.textContent.trim()) afterSuccess(box.closest('form'));
  }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['style'], childList: true });

  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(update, 80); }
  function init() {
    update();
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target, el = t.nodeType === 1 ? t : t.parentNode;
        if (el && el.closest && el.closest('.t706') && el.tagName !== 'INPUT') { later(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
