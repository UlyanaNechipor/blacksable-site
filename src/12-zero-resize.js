/* ===== Zero-блоки: правильный размер текста после изменения ширины окна или масштаба =====
   У Тильды при изменении размера окна (масштаб браузера, поворот, растягивание окна) элементы
   с отключённым масштабированием («no-scale») внутри автолейаута теряют поправку масштаба,
   и текст становится крупнее, чем при загрузке. Возвращаем ту же поправку, что Тильда ставит
   при загрузке страницы: zoom = 1 / коэффициент масштаба артборда. */
(function () {
  if (window.__bsZeroResizeInit) return;
  window.__bsZeroResizeInit = true;

  function fix() {
    if (typeof window.t396__getCurrentScaleFactor !== 'function') return;
    if (window.tn && window.tn.isEditMode) return;
    [].slice.call(document.querySelectorAll('.t396__artboard')).forEach(function (ab) {
      if (ab.getAttribute('data-artboard-upscale') !== 'window') return;
      var rec = ab.closest('.r');
      if (!rec) return;
      var f = parseFloat(window.t396__getCurrentScaleFactor(rec.id.replace('rec', '')));
      if (!f || !isFinite(f)) return;
      var zoom = f === 1 ? '' : String(parseFloat((1 / f).toFixed(6)));
      [].slice.call(ab.querySelectorAll('.t396__elem.no-scale, .t396__group.no-scale')).forEach(function (el) {
        if (el.parentNode === ab) return;            // элементы верхнего уровня Тильда обрабатывает сама
        if (el.style.zoom !== zoom) el.style.zoom = zoom;
      });
    });
  }

  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(fix, 700); }   // после пересчёта Тильды (он идёт через 500 мс)
  document.addEventListener('zero:window-width-changed', later);
  window.addEventListener('resize', later);
})();
