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
