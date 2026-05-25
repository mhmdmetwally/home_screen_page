const LOCALES = {
  en: {
    code: "en",
    dir: "ltr",
    path: "data/content.json",
    label: "English",
    switcherLabel: "Language",
    loadingEyebrow: "Loading Content",
    loadingTitle: "Preparing the academy page...",
    loadingBody: "The page reads all academy information from the selected JSON file.",
    errorEyebrow: "Content Error",
    errorTitle: "Unable to load the academy data.",
    errorNote: "If you opened the file directly in the browser, run it with a simple local server so the JSON file can be loaded.",
    unknownError: "Unknown loading error.",
    defaultPageTitle: "Academy Overview",
    defaultLogoAlt: "Academy logo",
    defaultVideoTitle: "Academy video",
    defaultVideoUnsupported: "Your browser does not support the video tag.",
    defaultStudentAlt: "Student",
    defaultLocationTitle: "Academy location",
    defaultSocialCta: "Visit"
  },
  ar: {
    code: "ar",
    dir: "rtl",
    path: "data/content.ar.json",
    label: "العربية",
    switcherLabel: "اللغة",
    loadingEyebrow: "جاري التحميل",
    loadingTitle: "يتم تجهيز صفحة الأكاديمية...",
    loadingBody: "تقرأ الصفحة جميع بيانات الأكاديمية من ملف JSON المختار.",
    errorEyebrow: "خطأ في المحتوى",
    errorTitle: "تعذر تحميل بيانات الأكاديمية.",
    errorNote: "إذا فتحت الملف مباشرة في المتصفح، شغّله عبر خادم محلي بسيط حتى يمكن تحميل ملف JSON.",
    unknownError: "حدث خطأ غير معروف أثناء التحميل.",
    defaultPageTitle: "نظرة عامة على الأكاديمية",
    defaultLogoAlt: "شعار الأكاديمية",
    defaultVideoTitle: "فيديو الأكاديمية",
    defaultVideoUnsupported: "متصفحك لا يدعم تشغيل الفيديو.",
    defaultStudentAlt: "طالب",
    defaultLocationTitle: "موقع الأكاديمية",
    defaultSocialCta: "زيارة"
  }
};

const state = {
  localeSwitcher: document.getElementById("locale-switcher"),
  hero: document.getElementById("hero"),
  content: document.getElementById("content"),
  statusPanel: document.getElementById("status-panel"),
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorMessage: document.getElementById("error-message"),
  activeLocale: getLocaleConfig(),
  sections: {
    about: document.getElementById("about-section"),
    courses: document.getElementById("courses-section"),
    pricing: document.getElementById("pricing-section"),
    media: document.getElementById("media-section"),
    testimonials: document.getElementById("testimonials-section"),
    contact: document.getElementById("contact-section"),
    offers: document.getElementById("offers-section")
  }
};

init();

async function init() {
  applyLocaleChrome();

  try {
    const response = await fetch(state.activeLocale.path, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }

    const content = await response.json();
    renderPage(content);
    showContent();
  } catch (error) {
    showError(error);
  }
}

function renderPage(content) {
  document.title = content?.site?.pageTitle || state.activeLocale.defaultPageTitle;
  document.documentElement.lang = content?.site?.language || state.activeLocale.code;
  document.documentElement.dir = content?.site?.direction || state.activeLocale.dir;

  renderHero(content.hero);
  renderAbout(content.about);
  renderCourses(content.courses);
  renderPricing(content.pricing);
  renderMedia(content.media);
  renderTestimonials(content.testimonials);
  renderContact(content.contact);
  renderOffers(content.offers);
}

function renderHero(hero = {}) {
  state.hero.innerHTML = `
    <div class="hero-card">
      <div class="hero-copy">
        <div>
          <div class="hero-brand">
            <img class="brand-logo" src="${escapeAttribute(hero.logo?.src || "")}" alt="${escapeAttribute(hero.logo?.alt || state.activeLocale.defaultLogoAlt)}">
            <div class="hero-headings">
              <h1 class="hero-title">${escapeHtml(hero.name || "")}</h1>
              <p class="hero-subtitle">${escapeHtml(hero.tagline || "")}</p>
            </div>
          </div>
        </div>

        <div class="hero-meta">
          ${renderPills(hero.highlights)}
        </div>

        <div class="hero-actions">
          ${renderAction(hero.primaryAction, "primary-button")}
          ${renderAction(hero.secondaryAction, "secondary-button")}
        </div>
      </div>

      <aside class="hero-side">
        <div class="hero-side-content">
          <p class="hero-side-label">${escapeHtml(hero.sidePanel?.label || "")}</p>
          <p class="hero-highlight">${escapeHtml(hero.sidePanel?.summary || "")}</p>
          <div class="stat-grid">
            ${(hero.sidePanel?.stats || []).map(renderStatCard).join("")}
          </div>
        </div>
      </aside>
    </div>
  `;
}

function renderAbout(about = {}) {
  const cards = (about.cards || []).filter(hasCardContent);
  const story = renderRichTextBlock(about.story);
  const results = renderResults(about.results);
  const hasContent = cards.length > 0 || Boolean(story) || Boolean(results);

  toggleSection(state.sections.about, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.about.innerHTML = `
    ${renderSectionHeader(about.heading, about.intro)}
    ${cards.length ? `<div class="summary-grid">${cards.map(renderInfoCard).join("")}</div>` : ""}
    ${story}
    ${results}
  `;
}

function renderCourses(courses = {}) {
  const items = (courses.items || []).filter(hasCourseContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.courses, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.courses.innerHTML = `
    ${renderSectionHeader(courses.heading, courses.intro)}
    <div class="course-grid">
      ${items.map(renderCourseCard).join("")}
    </div>
  `;
}

function renderPricing(pricing = {}) {
  const plans = (pricing.plans || []).filter(hasPriceContent);
  const hasContent = plans.length > 0;

  toggleSection(state.sections.pricing, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.pricing.innerHTML = `
    ${renderSectionHeader(pricing.heading, pricing.intro)}
    <div class="pricing-grid">
      ${plans.map(renderPriceCard).join("")}
    </div>
  `;
}

function renderMedia(media = {}) {
  const items = (media.items || []).filter(hasMediaContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.media, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.media.innerHTML = `
    ${renderSectionHeader(media.heading, media.intro)}
    <div class="media-grid">
      ${items.map(renderMediaCard).join("")}
    </div>
  `;
}

function renderTestimonials(testimonials = {}) {
  const items = (testimonials.items || []).filter(hasTestimonialContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.testimonials, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.testimonials.innerHTML = `
    ${renderSectionHeader(testimonials.heading, testimonials.intro)}
    <div class="testimonial-grid">
      ${items.map(renderTestimonialCard).join("")}
    </div>
  `;
}

function renderContact(contact = {}) {
  const details = (contact.details || []).filter(hasContactContent);
  const socialLinks = (contact.socialLinks || []).filter(hasSocialContent);
  const hasMap = Boolean(contact.location?.embedUrl);
  const hasContent = details.length > 0 || socialLinks.length > 0 || hasMap;

  toggleSection(state.sections.contact, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.contact.innerHTML = `
    ${renderSectionHeader(contact.heading, contact.intro)}
    ${details.length ? `<div class="contact-grid">${details.map(renderContactCard).join("")}</div>` : ""}
    ${renderMap(contact.location)}
    ${socialLinks.length ? `<div class="social-grid">${socialLinks.map(renderSocialLink).join("")}</div>` : ""}
  `;
}

function renderOffers(offers = {}) {
  const items = (offers.items || []).filter(hasOfferContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.offers, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.offers.innerHTML = `
    ${renderSectionHeader(offers.heading, offers.intro)}
    <div class="offer-grid">
      ${items.map(renderOfferCard).join("")}
    </div>
  `;
}

function renderSectionHeader(title = "", intro = "") {
  return `
    <div class="section-header">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(intro)}</p>
    </div>
  `;
}

function renderPills(items = []) {
  return items
    .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
    .join("");
}

function renderAction(action = {}, className = "") {
  if (!action.label || !action.href) {
    return "";
  }

  const target = action.newTab ? "_blank" : "_self";
  const rel = action.newTab ? ' rel="noreferrer noopener"' : "";
  return `<a class="${className}" href="${escapeAttribute(action.href)}" target="${target}"${rel}>${escapeHtml(action.label)}</a>`;
}

function renderStatCard(stat = {}) {
  return `
    <article class="stat-card">
      <span class="stat-value">${escapeHtml(stat.value || "")}</span>
      <span class="stat-label">${escapeHtml(stat.label || "")}</span>
    </article>
  `;
}

function renderInfoCard(card = {}) {
  return `
    <article class="info-card">
      <h3>${escapeHtml(card.title || "")}</h3>
      <p>${escapeHtml(card.text || "")}</p>
    </article>
  `;
}

function renderResults(results = {}) {
  const items = (results.items || []).filter(hasResultContent);

  if (!items.length) {
    return "";
  }

  return `
    <div class="section-header">
      <h2>${escapeHtml(results.heading || "")}</h2>
      <p>${escapeHtml(results.intro || "")}</p>
    </div>
    <div class="results-grid">
      ${items.map(renderResultCard).join("")}
    </div>
  `;
}

function renderResultCard(item = {}) {
  return `
    <article class="result-card">
      <strong>${escapeHtml(item.value || "")}</strong>
      <h3>${escapeHtml(item.title || "")}</h3>
      <p>${escapeHtml(item.text || "")}</p>
    </article>
  `;
}

function renderCourseCard(course = {}) {
  return `
    <article class="course-card">
      <h3>${escapeHtml(course.title || "")}</h3>
      <p>${escapeHtml(course.description || "")}</p>
      <div class="course-meta">
        ${renderMetaChip(course.duration)}
        ${renderMetaChip(course.level)}
        ${renderMetaChip(course.schedule)}
      </div>
      <div class="advantage-list">
        ${(course.advantages || []).map((item) => `<span class="advantage-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderMetaChip(value = "") {
  if (!value) {
    return "";
  }

  return `<span class="meta-chip">${escapeHtml(value)}</span>`;
}

function renderPriceCard(plan = {}) {
  return `
    <article class="price-card">
      <h3>${escapeHtml(plan.name || "")}</h3>
      <p>${escapeHtml(plan.description || "")}</p>
      <div class="price-value">
        <strong>${escapeHtml(plan.price || "")}</strong>
        <span>${escapeHtml(plan.billing || "")}</span>
      </div>
      <div class="price-meta">
        ${renderMetaChip(plan.audience)}
        ${renderMetaChip(plan.duration)}
      </div>
      <div class="price-feature-list">
        ${(plan.features || []).map((feature) => `<span class="feature-pill">${escapeHtml(feature)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderMediaCard(item = {}) {
  const mediaFrame = item.type === "video"
    ? renderVideo(item)
    : `<img src="${escapeAttribute(item.src || "")}" alt="${escapeAttribute(item.alt || item.title || "Academy media")}">`;

  return `
    <article class="media-card">
      <div class="media-frame">
        ${mediaFrame}
      </div>
      <div class="media-body">
        <h3>${escapeHtml(item.title || "")}</h3>
        <p class="media-caption">${escapeHtml(item.caption || "")}</p>
      </div>
    </article>
  `;
}

function renderVideo(item = {}) {
  if (item.embedUrl) {
    return `<iframe src="${escapeAttribute(item.embedUrl)}" title="${escapeAttribute(item.title || state.activeLocale.defaultVideoTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  return `<video controls preload="metadata" poster="${escapeAttribute(item.poster || "")}">
    <source src="${escapeAttribute(item.src || "")}">
    ${escapeHtml(state.activeLocale.defaultVideoUnsupported)}
  </video>`;
}

function renderTestimonialCard(item = {}) {
  return `
    <article class="testimonial-card">
      <blockquote>"${escapeHtml(item.quote || "")}"</blockquote>
      <div class="testimonial-author">
        <img class="testimonial-avatar" src="${escapeAttribute(item.avatar || "")}" alt="${escapeAttribute(item.name || state.activeLocale.defaultStudentAlt)}">
        <div>
          <strong>${escapeHtml(item.name || "")}</strong>
          <span>${escapeHtml(item.result || "")}</span>
        </div>
      </div>
    </article>
  `;
}

function renderContactCard(item = {}) {
  const value = item.href
    ? `<a href="${escapeAttribute(item.href)}" target="${item.newTab ? "_blank" : "_self"}"${item.newTab ? ' rel="noreferrer noopener"' : ""}>${escapeHtml(item.value || "")}</a>`
    : `<span>${escapeHtml(item.value || "")}</span>`;

  return `
    <article class="contact-card">
      <h3>${escapeHtml(item.label || "")}</h3>
      <p>${value}</p>
    </article>
  `;
}

function renderMap(location = {}) {
  if (!location.embedUrl) {
    return "";
  }

  return `
    <div class="map-box">
      <iframe
        src="${escapeAttribute(location.embedUrl)}"
        title="${escapeAttribute(location.title || state.activeLocale.defaultLocationTitle)}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

function renderSocialLink(link = {}) {
  const target = link.newTab ? "_blank" : "_self";
  const rel = link.newTab ? ' rel="noreferrer noopener"' : "";

  return `
    <a class="social-link" href="${escapeAttribute(link.href || "#")}" target="${target}"${rel}>
      <div>
        <strong>${escapeHtml(link.label || "")}</strong>
        <span>${escapeHtml(link.handle || "")}</span>
      </div>
      <span>${escapeHtml(link.callToAction || state.activeLocale.defaultSocialCta)}</span>
    </a>
  `;
}

function renderOfferCard(offer = {}) {
  return `
    <article class="offer-card">
      <h3>${escapeHtml(offer.title || "")}</h3>
      <p>${escapeHtml(offer.description || "")}</p>
      <div class="offer-badge-row">
        ${(offer.highlights || []).map((item) => `<span class="offer-badge">${escapeHtml(item)}</span>`).join("")}
      </div>
      <p class="offer-expiry">${escapeHtml(offer.expiry || "")}</p>
    </article>
  `;
}

function renderRichTextBlock(block = {}) {
  if (!block.title && !block.paragraphs?.length && !block.bullets?.length) {
    return "";
  }

  return `
    <div class="timeline-card rich-text">
      ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ""}
      ${(block.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      ${block.bullets?.length ? `<ul>${block.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function showContent() {
  state.statusPanel.classList.add("is-hidden");
  state.content.hidden = false;
}

function showError(error) {
  state.loadingState.hidden = true;
  state.errorState.hidden = false;
  state.errorMessage.textContent = error.message || state.activeLocale.unknownError;
}

function getLocaleConfig() {
  const params = new URLSearchParams(window.location.search);
  const requestedLocale = params.get("lang")?.toLowerCase();

  return LOCALES[requestedLocale] || LOCALES.en;
}

function applyLocaleChrome() {
  document.documentElement.lang = state.activeLocale.code;
  document.documentElement.dir = state.activeLocale.dir;
  renderLocaleSwitcher();
  renderStatusCopy();
}

function renderLocaleSwitcher() {
  if (!state.localeSwitcher) {
    return;
  }

  const links = Object.values(LOCALES)
    .map((locale) => {
      const isActive = locale.code === state.activeLocale.code;
      const href = buildLocaleHref(locale.code);
      const className = isActive ? "locale-link is-active" : "locale-link";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";

      return `<a class="${className}" href="${escapeAttribute(href)}"${ariaCurrent}>${escapeHtml(locale.label)}</a>`;
    })
    .join("");

  state.localeSwitcher.innerHTML = `
    <span class="locale-switcher-label">${escapeHtml(state.activeLocale.switcherLabel)}</span>
    <div class="locale-switcher-links">
      ${links}
    </div>
  `;
}

function buildLocaleHref(localeCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", localeCode);
  return `${url.pathname}${url.search}${url.hash}`;
}

function renderStatusCopy() {
  state.loadingState.innerHTML = `
    <span class="status-eyebrow">${escapeHtml(state.activeLocale.loadingEyebrow)}</span>
    <h1>${escapeHtml(state.activeLocale.loadingTitle)}</h1>
    <p>${escapeHtml(state.activeLocale.loadingBody)}</p>
  `;

  state.errorState.innerHTML = `
    <span class="status-eyebrow">${escapeHtml(state.activeLocale.errorEyebrow)}</span>
    <h1>${escapeHtml(state.activeLocale.errorTitle)}</h1>
    <p id="error-message"></p>
    <p class="status-note">${escapeHtml(state.activeLocale.errorNote)}</p>
  `;

  state.errorMessage = document.getElementById("error-message");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function toggleSection(element, shouldShow) {
  element.hidden = !shouldShow;

  if (!shouldShow) {
    element.innerHTML = "";
  }
}

function hasCardContent(card = {}) {
  return Boolean(card.title || card.text);
}

function hasCourseContent(course = {}) {
  return Boolean(
    course.title ||
    course.description ||
    course.duration ||
    course.level ||
    course.schedule ||
    (course.advantages || []).length
  );
}

function hasPriceContent(plan = {}) {
  return Boolean(
    plan.name ||
    plan.description ||
    plan.price ||
    plan.billing ||
    plan.audience ||
    plan.duration ||
    (plan.features || []).length
  );
}

function hasMediaContent(item = {}) {
  return Boolean(item.src || item.embedUrl || item.title || item.caption);
}

function hasTestimonialContent(item = {}) {
  return Boolean(item.quote || item.name || item.result || item.avatar);
}

function hasContactContent(item = {}) {
  return Boolean(item.label || item.value || item.href);
}

function hasSocialContent(link = {}) {
  return Boolean(link.label || link.handle || link.href);
}

function hasOfferContent(offer = {}) {
  return Boolean(
    offer.title ||
    offer.description ||
    offer.expiry ||
    (offer.highlights || []).length
  );
}

function hasResultContent(item = {}) {
  return Boolean(item.value || item.title || item.text);
}
