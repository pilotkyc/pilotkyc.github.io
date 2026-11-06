/* PilotKYC landing: language toggle (EN default, RU), theme toggle, config injection, mobile menu.
 * English text lives in the HTML; this file only stores the Russian dictionary.
 */
(function () {
  "use strict";

  var CFG = window.PILOTKYC || {};
  var LS_LANG = "pk.lang";
  var LS_THEME = "pk.theme";

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  var RU = {
    "skip": "Перейти к содержимому",
    "nav.how": "Как это работает",
    "nav.modes": "Режимы",
    "nav.security": "Безопасность",
    "nav.dev": "Разработчикам",
    "nav.pricing": "Цены",
    "nav.faq": "Вопросы",
    "nav.docs": "Документация",
    "nav.login": "Войти",

    "hero.eyebrow": "API проверки личности",
    "hero.title": "Проверяйте реальных людей за минуты, а не за дни",
    "hero.lead": "PilotKYC проверяет документы, сопоставляет лица и распознаёт подделки для бирж, P2P-мерчантов, финтеха и маркетплейсов. Отправьте пользователю ссылку или вызовите API. Получите подписанный ответ, которому можно доверять.",
    "cta.docs": "Читать документацию",
    "cta.keys": "Получить API-ключи",
    "hero.chip1": "Бесплатные sandbox-ключи",
    "hero.chip2": "7 языков на странице проверки",
    "hero.chip3": "Вебхуки с подписью HMAC-SHA256",

    "how.eyebrow": "Как это работает",
    "how.title": "Три шага от регистрации до решения",
    "how.s1.t": "Создайте сессию",
    "how.s1.p": "Ваш сервер вызывает один метод с режимом проверки и вашим идентификатором. В ответ вы получаете уникальную ссылку.",
    "how.s2.t": "Пользователь проходит проверку",
    "how.s2.p": "Он открывает ссылку на телефоне, фотографирует документ и, в режиме с селфи, делает живое селфи. Ничего устанавливать не нужно, фронтенд писать не нужно.",
    "how.s3.t": "Получите подписанное решение",
    "how.s3.p": "Приходит вебхук: approved, declined или review, машиночитаемые причины и оценки от 0 до 1. Либо опрашивайте сессию, когда удобно.",

    "modes.eyebrow": "Режимы проверки",
    "modes.title": "Выберите нужный уровень уверенности",
    "modes.sub": "Два режима, один API. Поддерживаются паспорт, ID-карта и водительское удостоверение.",
    "modes.doc.t": "Проверка документа",
    "modes.doc.price": "0.04 USDT / проверка",
    "modes.doc.p": "Одно фото документа. Быстро, без лишнего трения, подходит как первый барьер.",
    "modes.doc.l1": "Извлечение данных: имя, дата рождения, номер документа, гражданство, срок действия",
    "modes.doc.l2": "Проверка контрольных сумм MRZ для паспортов и ID-карт с MRZ",
    "modes.doc.l3": "Признаки подделки: фото экрана, распечатки, правки документа",
    "modes.doc.l4": "Сверка с именем, которое вы ожидаете (по желанию)",
    "modes.sd.t": "Селфи + документ",
    "modes.sd.price": "0.08 USDT / проверка",
    "modes.sd.p": "Всё из проверки документа, плюс доказательство, что телефон держит тот же человек, что и на документе.",
    "modes.sd.l1": "Сопоставление лица на документе с живым селфи",
    "modes.sd.l2": "Пассивная проверка живости: защита от распечатанных фото и показа с экрана",
    "modes.sd.l3": "Пользователю не нужно поворачивать голову или снимать видео",
    "modes.sd.l4": "Включает все сигналы проверки документа",
    "modes.note": "Результат за секунды для документов с MRZ. Остальные документы, которые читает ИИ, обычно обрабатываются за 10–30 секунд с автоматическим резервированием канала. PilotKYC читает лицевую сторону или страницу с данными документа.",

    "int.eyebrow": "Интеграция",
    "int.title": "Два способа подключения. Используйте любой или оба.",
    "int.hosted.t": "Ссылка на готовую страницу проверки",
    "int.hosted.p": "Без работы на фронтенде. Создайте сессию, отправьте ссылку, дождитесь подписанного вебхука.",
    "int.hosted.l1": "Мобильная страница на английском, русском, тайском, вьетнамском, португальском, испанском и китайском",
    "int.hosted.l2": "Возврат пользователя в ваше приложение после проверки",
    "int.hosted.l3": "Статусы: created, in_progress, processing, approved, declined, review, expired, canceled",
    "int.direct.t": "Прямой API",
    "int.direct.p": "Уже есть свои экраны съёмки? Загрузите изображения и получите ответ в том же запросе.",
    "int.direct.l1": "Один multipart-запрос, синхронный результат",
    "int.direct.l2": "JPEG, PNG, WebP или HEIC, до 10 МБ каждый",
    "int.direct.l3": "Тот же объект результата, что и в сценарии со ссылкой",

    "sec.eyebrow": "Безопасность и приватность",
    "sec.title": "Приватность заложена в конструкцию, а не добавлена сверху",
    "sec.sub": "Лучший способ защитить персональные данные — не хранить их. PilotKYC хранит минимум и как можно меньше времени.",
    "sec.f1.t": "Изображения удаляются сразу после проверки",
    "sec.f1.p": "Фото обрабатываются и удаляются, как только проверка завершена. В базу данных они не записываются никогда.",
    "sec.f2.t": "Короткое хранение, удаление по запросу",
    "sec.f2.p": "Извлечённые персональные данные хранятся не более 30 дней по умолчанию, и вы можете стереть их через API в любой момент.",
    "sec.f3.t": "Подписанные вебхуки",
    "sec.f3.p": "Каждый вебхук содержит подпись HMAC-SHA256 с меткой времени, чтобы вы могли отклонять подделки и повторы.",
    "sec.f4.t": "Ключи хранятся в виде хэшей",
    "sec.f4.p": "API-ключи хранятся только в виде хэшей. Открытый ключ показывается один раз при создании. Ключи — только для серверной стороны.",
    "sec.f5.t": "Безопасный режим при сбоях",
    "sec.f5.p": "Если распознавание сбоит или не укладывается во время, результат — review с кодом причины. Техническая ошибка никогда не превращается в одобрение.",
    "sec.f6.t": "Ничего не утекает в браузер",
    "sec.f6.p": "Страница проверки никогда не показывает браузеру решение, оценки и извлечённые данные. Итог узнаёт только ваш сервер.",

    "dev.eyebrow": "Опыт разработчика",
    "dev.title": "Подключается за один вечер",
    "dev.sub": "Небольшой предсказуемый REST API с деталями, важными в продакшене.",
    "dev.c1.t": "Проверяемые вебхуки",
    "dev.c1.p": "Проверяйте подпись по исходному телу запроса, с допуском 5 минут и сравнением за постоянное время. Неудачные доставки повторяются до 8 раз.",
    "dev.c2.t": "Идемпотентность из коробки",
    "dev.c2.p": "Передавайте Idempotency-Key при создании сессий и проверок. Повторы в течение 24 часов вернут исходный ответ вместо дубликатов.",
    "dev.c3.t": "Бесплатная детерминированная песочница",
    "dev.c3.p": "Используйте ключ pk_test_ и выбирайте исход ключевым словом в ожидаемом имени. Распознавание не запускается, изображения не сохраняются.",
    "dev.link": "Начать с быстрого старта",
    "dev.link2": "Спецификация OpenAPI",

    "uc.eyebrow": "Сценарии",
    "uc.title": "Везде, где нужно знать, кто на другой стороне",
    "uc.u1.t": "Криптобиржи",
    "uc.u1.p": "Принимайте пользователей с проверкой документа и лица до торговли и вывода.",
    "uc.u2.t": "P2P-мерчанты",
    "uc.u2.p": "Убедитесь, что контрагент — тот, кто указан в ордере, прежде чем отпускать средства.",
    "uc.u3.t": "Финтех и кошельки",
    "uc.u3.p": "Добавьте шаг проверки при открытии счёта и повышении лимитов.",
    "uc.u4.t": "Маркетплейсы",
    "uc.u4.p": "Укрепите доверие между покупателями и продавцами, проверяя, кто они.",

    "why.eyebrow": "Почему PilotKYC",
    "why.title": "PilotKYC и типичные KYC-провайдеры",
    "why.sub": "Что мы делаем иначе намеренно.",
    "why.th1": "Область",
    "why.th2": "С PilotKYC",
    "why.r1.a": "Фото ваших пользователей",
    "why.r1.b": "Обрабатываются и удаляются сразу после проверки, в базе данных не хранятся.",
    "why.r2.a": "Персональные данные",
    "why.r2.b": "Короткий срок хранения по умолчанию и удаление одним вызовом API.",
    "why.r3.a": "Начало работы",
    "why.r3.b": "Бесплатные sandbox-ключи с предсказуемыми исходами: можно проверить каждую ветку до запуска.",
    "why.r4.a": "Трудозатраты на интеграцию",
    "why.r4.b": "Ссылка на готовую страницу не требует работы на фронтенде. Прямой API — когда нужен полный контроль.",
    "why.r5.a": "Решения",
    "why.r5.b": "Машиночитаемые причины и оценки от 0 до 1, а не «чёрный ящик» да или нет.",
    "why.r6.a": "Цена",
    "why.r6.b": "Прозрачный тариф по режимам: 0.04 USDT за документ, 0.08 USDT за селфи + документ, оплата по факту.",

    "pr.eyebrow": "Цены",
    "pr.title": "Прозрачная тарифная сетка по режимам",
    "pr.sub": "Платите только за выбранный уровень проверки. Без абонентской платы, без минимальных платежей — единый предоплаченный баланс в USDT для обоих режимов.",
    "price.free": "Бесплатно",
    "pr.sb.t": "Sandbox",
    "pr.sb.p": "Разрабатывайте и тестируйте интеграцию.",
    "pr.sb.l1": "Ключи pk_test_, без списаний",
    "pr.sb.l2": "Детерминированные исходы",
    "pr.sb.l3": "Изображения не сохраняются",
    "pr.sb.cta": "Попробовать sandbox",
    "pr.doc.t": "Проверка документа",
    "pr.doc.p": "Быстрая проверка документа, извлечение данных, контрольные суммы MRZ и детекция подделок с единого баланса USDT.",
    "pr.doc.l1": "OCR паспорта, ID-карты и прав + проверка MRZ",
    "pr.doc.l2": "Проверка подлинности документа и сверка ожидаемого имени",
    "pr.doc.l3": "Автоматический возврат, если сбой на нашей стороне",
    "pr.doc.l4": "Предоплаченный баланс, пополнение от 10 USDT через OxaPay",
    "pr.sd.t": "Селфи + документ",
    "pr.sd.p": "Полная биометрическая верификация: всё из проверки документа плюс сверка лица и пассивная проверка живости.",
    "pr.sd.l1": "Все сигналы и OCR из режима «Проверка документа»",
    "pr.sd.l2": "Биометрическая сверка лица (документ и селфи)",
    "pr.sd.l3": "Пассивная проверка живости (защита от экранов и распечаток)",
    "pr.sd.l4": "Ссылка на страницу проверки, прямой API и подписанные вебхуки",
    "pr.pr.t": "Продакшен",
    "pr.pr.unit": "USDT за проверку",
    "pr.pr.p": "Настоящее распознавание с предоплаченного баланса в USDT. Пополнение криптовалютой через OxaPay. Списание только тогда, когда решение получено.",
    "pr.pr.l1": "Предоплаченный баланс, пополнение от 10 USDT",
    "pr.pr.l2": "Тариф зависит от выбранного режима",
    "pr.pr.l3": "Автоматический возврат, если сбой на нашей стороне",
    "pr.pr.l4": "Ссылка на страницу проверки, прямой API и подписанные вебхуки",
    "pr.vo.t": "Большие объёмы",
    "pr.vo.price": "Обсудим",
    "pr.vo.p": "Индивидуальные тарифы для больших объёмов проверок документа и биометрии.",
    "pr.vo.l1": "Скидки от объёма на оба режима",
    "pr.vo.l2": "Индивидуальные лимиты RPS и выделенная пропускная способность",
    "pr.vo.l3": "Прямой канал с инженерами и SLA",
    "pr.vo.cta": "Связаться с нами",

    "faq.eyebrow": "Вопросы",
    "faq.title": "Частые вопросы",
    "faq.q1": "Какие документы поддерживаются?",
    "faq.a1": "Паспорта, национальные ID-карты и водительские удостоверения. PilotKYC читает лицевую сторону или страницу с данными документа.",
    "faq.q2": "Как быстро приходит результат?",
    "faq.a2": "Секунды для документов с MRZ. Остальные документы (их читает ИИ) обычно обрабатываются за 10–30 секунд с автоматическим резервированием канала. Вы получите вебхук, как только решение будет готово, либо можете опрашивать сессию.",
    "faq.q3": "Вы храните фото моих пользователей?",
    "faq.a3": "Нет. Изображения обрабатываются и удаляются сразу после проверки и никогда не записываются в базу данных. Извлечённые персональные данные хранятся не более 30 дней по умолчанию и могут быть стёрты через API в любой момент.",
    "faq.q4": "Что значит review?",
    "faq.a4": "Явных причин для отказа не найдено, но хотя бы один сигнал недостаточно уверенный для автоматического одобрения. Решаете вы: отправить человеку на проверку или попросить пользователя повторить. Коды причин подскажут, почему так вышло.",
    "faq.q5": "Можно попробовать бесплатно?",
    "faq.a5": "Да. Sandbox-ключи бесплатны и возвращают предсказуемые исходы, так что можно собрать и проверить весь сценарий, включая вебхуки.",
    "faq.q6": "Вы делаете AML или проверку по санкционным спискам?",
    "faq.a6": "В версии 1 — нет. PilotKYC проверяет документ и, по желанию, лицо. AML и санкционные проверки, подтверждение адреса и KYB есть в планах, без обещанных сроков.",
    "faq.q7": "Как получить API-ключи?",
    "faq.a7": "Зарегистрируйтесь в личном кабинете, подтвердите почту и создайте API-ключи сами: sandbox-ключи бесплатны, боевые работают с вашего предоплаченного баланса.",
    "faq.a7l": "Зарегистрироваться",
    "faq.q8": "Как оплатить?",
    "faq.a8": "Пополните предоплаченный баланс в USDT в личном кабинете криптовалютой через OxaPay (от 10 до 5000 USDT за одно пополнение). Проверка документа стоит 0,04 USDT, а проверка «Селфи + документ» — 0,08 USDT. Сумма списывается только тогда, когда решение получено; если сбой на стороне нашего движка, оплата возвращается автоматически. Платите точную сумму, указанную в счёте; если вы заплатили другую сумму, напишите в поддержку.",

    "final.title": "Готовы проверить первого пользователя?",
    "final.p": "Зарегистрируйтесь, создайте sandbox-ключ, создайте сессию и увидите подписанный вебхук уже через несколько минут.",
    "final.cta1": "Открыть быстрый старт",

    "footer.tag": "API проверки личности для бирж, P2P-мерчантов, финтеха и маркетплейсов.",
    "footer.api": "Справочник API",
    "footer.openapi": "OpenAPI",
    "footer.changelog": "История изменений",
    "footer.contact": "Контакты"
  };

  var META = {
    en: {
      title: "PilotKYC — Identity verification API for exchanges, P2P and fintech",
      desc: "Identity verification API: document check with data extraction, selfie face match and passive liveness. Hosted link or direct API, signed webhooks, free sandbox, images deleted right after the check."
    },
    ru: {
      title: "PilotKYC — API проверки личности для бирж, P2P и финтеха",
      desc: "API проверки личности: проверка документа с извлечением данных, сопоставление лица с селфи и пассивная проверка живости. Ссылка на страницу проверки или прямой API, подписанные вебхуки, бесплатный sandbox, изображения удаляются сразу после проверки."
    }
  };

  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  // Remember the English originals so that toggling back needs no dictionary.
  var EN = {};
  $$("[data-i18n]").forEach(function (el) {
    var k = el.getAttribute("data-i18n");
    if (!(k in EN)) EN[k] = el.textContent;
  });

  function formatAmount(amount) {
    var cur = (CFG.pricing && typeof CFG.pricing.currency === "string") ? CFG.pricing.currency : "$";
    return cur + Number(amount).toFixed(2);
  }

  function applyConfig() {
    var base = CFG.baseUrl;
    if (base) $$("[data-base-url]").forEach(function (el) { el.textContent = base; });
    if (CFG.contactUrl) $$("[data-contact]").forEach(function (el) { el.setAttribute("href", CFG.contactUrl); });
    if (CFG.signupUrl) $$("[data-signup]").forEach(function (el) { el.setAttribute("href", CFG.signupUrl); });
    if (CFG.loginUrl) $$("[data-login]").forEach(function (el) { el.setAttribute("href", CFG.loginUrl); });
    var p = CFG.pricing || {};
    var prod = $$('[data-price="production"]')[0];
    if (prod && p.production && typeof p.production.amount === "number") prod.textContent = formatAmount(p.production.amount);
    var docPrice = $$('[data-price="document"]')[0];
    if (docPrice && p.document && typeof p.document.amount === "number") docPrice.textContent = formatAmount(p.document.amount);
    var sdPrice = $$('[data-price="selfie_document"]')[0];
    if (sdPrice && p.selfie_document && typeof p.selfie_document.amount === "number") sdPrice.textContent = formatAmount(p.selfie_document.amount);
  }

  var currentLang = "en";

  function applyLang(lang) {
    currentLang = lang === "ru" ? "ru" : "en";
    $$("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = currentLang === "ru" && RU[k] ? RU[k] : EN[k];
      if (typeof v === "string") el.textContent = v;
    });
    var free = $$('[data-price="sandbox"]')[0];
    if (free) free.textContent = currentLang === "ru" ? RU["price.free"] : "Free";
    document.documentElement.setAttribute("lang", currentLang);
    document.title = META[currentLang].title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", META[currentLang].desc);
    $$(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === currentLang ? "true" : "false");
    });
  }

  function detectLang() {
    var stored = lsGet(LS_LANG);
    if (stored === "ru" || stored === "en") return stored;
    return "en";
  }

  /* ---------- theme ---------- */
  function effectiveTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", effectiveTheme() === "dark" ? "#0a0f1f" : "#ffffff");
  }

  function init() {
    applyConfig();
    applyLang(detectLang());

    var storedTheme = lsGet(LS_THEME);
    applyTheme(storedTheme === "light" || storedTheme === "dark" ? storedTheme : "");
    var themeBtn = document.getElementById("theme-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var next = effectiveTheme() === "dark" ? "light" : "dark";
        lsSet(LS_THEME, next);
        applyTheme(next);
      });
    }

    $$(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var lang = b.getAttribute("data-lang");
        lsSet(LS_LANG, lang);
        applyLang(lang);
      });
    });

    var menuBtn = document.getElementById("menu-btn");
    var nav = document.getElementById("nav");
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("open")) {
          nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus();
        }
      });
    }

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
