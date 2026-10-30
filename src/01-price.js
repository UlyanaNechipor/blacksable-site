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
