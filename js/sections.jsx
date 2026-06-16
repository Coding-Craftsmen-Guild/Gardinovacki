/* eslint-disable */
/* All section components. Styling lives in the global stylesheet in index.html. */

const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

/* ───────────────────────────────────── helpers */
const isInternal = (url) => url && url.startsWith('/');
const hashFor = (url) => '#' + (url.endsWith('/') ? url : url + '/');
const navTo = (url) => { window.location.hash = hashFor(url); };

const cls = (...xs) => xs.filter(Boolean).join(' ');

function CTA({ cta, kind = 'primary', size }) {
  if (!cta) return null;
  const variant = cta.variant || kind;
  const handler = isInternal(cta.url)
    ? (e) => { e.preventDefault(); navTo(cta.url); }
    : undefined;
  return (
    <a
      className={cls('btn', variant === 'secondary' && 'btn--ghost', variant === 'wood' && 'btn--wood', size === 'lg' && 'btn--lg', size === 'sm' && 'btn--small')}
      href={isInternal(cta.url) ? hashFor(cta.url) : cta.url}
      onClick={handler}
    >
      <span>{cta.label}</span>
      <span className="arrow"><Icon.Arrow size={14} /></span>
    </a>
  );
}

/* ───────────────────────────────────── SectionHead — unified across sections */
function SectionHead({ pretitle, title, text, action, centered }) {
  if (!pretitle && !title && !text && !action) return null;
  return (
    <div className={cls('section-head', centered && 'section-head--centered')}>
      <div className="section-head__copy">
        {pretitle && <div className="section-head__pre">{pretitle}</div>}
        {title && <h2 className="section-head__title">{title}</h2>}
        {text && <p className="section-head__text">{text}</p>}
      </div>
      {action && <div className="section-head__action">{action}</div>}
    </div>
  );
}

/* Sensible default pretitles per heading. Data may override via props.pretitle. */
const PRETITLE_MAP = {
  'Usluge': 'Šta radim',
  'Paketi': 'Investicija',
  'Svi paketi': 'Pet opcija, jedan pristup',
  'Šta mogu da uradim za vas': 'Usluge',
  'Iz portfolija': 'Najsvežiji radovi',
  'Sve galerije venčanja': 'Arhiv',
  'Spotovi': 'Video',
  'Primeri': 'Foto sesije',
  'Venčanja': 'Venčanja',
  'Rođendani i ostalo': 'Porodice i proslave',
  'Video': 'Pokret + zvuk',
  'Šta paket uključuje': 'Sadržaj',
};
function derivePretitle(heading) {
  if (!heading) return null;
  if (PRETITLE_MAP[heading]) return PRETITLE_MAP[heading];
  if (/^Šta dobijate sa paketom/i.test(heading)) return 'Paket sažetak';
  return null;
}

/* ───────────────────────────────────── LanguageSwitcher */
function LanguageSwitcher() {
  const [current, setCurrent] = useState(() => {
    try { return localStorage.getItem('gd-lang') || 'sr'; } catch (_) { return 'sr'; }
  });
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const LANGS = [
    { code: 'sr', label: 'Srpski',  short: 'SR' },
    { code: 'en', label: 'English', short: 'EN' },
  ];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (code) => {
    setCurrent(code);
    try { localStorage.setItem('gd-lang', code); } catch (_) {}
    setOpen(false);
  };

  const cur = LANGS.find((l) => l.code === current) || LANGS[0];

  return (
    <div className={cls('lang', open && 'is-open')} ref={wrapRef}>
      <button
        type="button"
        className="lang__toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lang__short">{cur.short}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M1 1 L5 5 L9 1" />
        </svg>
      </button>
      {open && (
        <ul className="lang__menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code} className={cls('lang__item', l.code === current && 'is-current')}>
              <button type="button" role="option" aria-selected={l.code === current} onClick={() => pick(l.code)}>
                <span className="lang__short">{l.short}</span>
                <span className="lang__name">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────────────────── Header */
function Header({ data }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onHash = () => { setHash(window.location.hash || '#/'); setOpen(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onHash);
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('hashchange', onHash); };
  }, []);

  const { logo, navItems, socials } = data.props;
  const currentPath = (hash.replace(/^#/, '') || '/');

  const isActive = (url) => {
    if (url === '/') return currentPath === '/' || currentPath === '/#/';
    // match path prefix for galerija (always highlights when on any gallery)
    if (url.startsWith('/galerija/')) return currentPath.startsWith('/galerija/');
    return currentPath.startsWith(url);
  };

  return (
    <header className={cls('site-header', scrolled && 'is-scrolled', open && 'is-open')}>
      <div className="site-header__inner">
        <a className="site-header__mark" href="#/" onClick={(e) => { e.preventDefault(); navTo('/'); }}>
          <span className="mark-word">Gardinovački</span>
          <span className="mark-sub">Weddings &amp; Fine Art</span>
        </a>

        <nav className="site-header__nav">
          {navItems.map((it) => (
            <a key={it.url}
               href={hashFor(it.url)}
               onClick={(e) => { e.preventDefault(); navTo(it.url); }}
               className={cls('nav-link', isActive(it.url) && 'is-active')}>
              {it.label}
            </a>
          ))}
        </nav>

        <div className="site-header__socials">
          <LanguageSwitcher />
          {socials.map((s) => {
            const I = s.platform === 'instagram' ? Icon.Instagram : s.platform === 'facebook' ? Icon.Facebook : Icon.TikTok;
            return (
              <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="social-link">
                <I size={15} />
              </a>
            );
          })}
        </div>

        <button className="site-header__burger" onClick={() => setOpen(!open)} aria-label="Meni">
          {open ? <Icon.Close size={20} /> : <Icon.Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="site-header__drawer">
          {navItems.map((it) => (
            <a key={it.url}
               href={hashFor(it.url)}
               onClick={(e) => { e.preventDefault(); navTo(it.url); }}
               className={cls('drawer-link', isActive(it.url) && 'is-active')}>
              {it.label}
            </a>
          ))}
          <div className="drawer-socials">
            <LanguageSwitcher />
            {socials.map((s) => {
              const I = s.platform === 'instagram' ? Icon.Instagram : s.platform === 'facebook' ? Icon.Facebook : Icon.TikTok;
              return <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="social-link"><I size={16} /></a>;
            })}
          </div>
        </div>
      )}
    </header>
  );
}

/* ───────────────────────────────────── Footer (with merged Instagram strip) */
function Footer({ data, navData }) {
  const { copyright, socials } = data.props;
  const navItems = (navData && navData.props.navItems) || [];
  const igUrl = (socials.find((s) => s.platform === 'instagram') || {}).url || 'https://www.instagram.com/gardinovacki_weddings/';
  const igHandle = 'gardinovacki_weddings';

  // Instagram strip — pull recent post-like images from gallery data (same source as old InstagramFeed)
  const pool = (window.SITE_DATA && window.SITE_DATA.pages || [])
    .filter((p) => p.template === 'T4-gallery')
    .flatMap((p) => {
      const mg = (p.sections || []).find((s) => s.component === 'media-gallery');
      return mg ? mg.props.items.slice(0, 2) : [];
    });
  const igPosts = pool.slice(0, 5);

  return (
    <footer className="site-footer">
      {/* ── Instagram strip ── */}
      <div className="footer-ig">
        <a className="footer-ig__label" href={igUrl} target="_blank" rel="noopener noreferrer">
          <Icon.Instagram size={14} /> <span>IG: @{igHandle}</span>
        </a>
        <div className="footer-ig__strip">
          {igPosts.map((p, idx) => (
            <a key={idx} className="footer-ig__cell" href={igUrl} target="_blank" rel="noopener noreferrer" aria-label={'Instagram — ' + (p.alt || '')}>
              <img src={p.src} alt={p.alt} loading="lazy" />
              <span className="footer-ig__overlay"><Icon.Instagram size={20} /></span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Footer body: location · mark · tagline ── */}
      <div className="site-footer__inner">
        <div className="footer-meta footer-meta--left">
          <div className="footer-label">Baziran u</div>
          <div className="footer-meta__line">Beograd, Srbija</div>
          <div className="footer-meta__coords">44.7866° N, 20.4489° E</div>
        </div>

        <a className="footer-brandmark" href="#/" onClick={(e) => { e.preventDefault(); navTo('/'); }}>
          <span className="footer-brandmark__word">Gardinovački</span>
          <span className="footer-brandmark__sub">Weddings &amp; Fine Art</span>
        </a>

        <div className="footer-meta footer-meta--right">
          <div className="footer-label">Od 2009.</div>
          <div className="footer-meta__line">Putujemo svetom</div>
          <div className="footer-meta__coords">Beležimo ljubav</div>
        </div>
      </div>

      {/* ── Nav row ── */}
      <nav className="footer-nav" aria-label="Footer">
        {navItems.map((it) => (
          <a key={it.url}
             href={hashFor(it.url)}
             onClick={(e) => { e.preventDefault(); navTo(it.url); }}
             className="footer-nav__link">
            {it.label}
          </a>
        ))}
      </nav>

      {/* ── Base bar ── */}
      <div className="site-footer__base">
        <span>{copyright} · All Rights Reserved</span>
        <div className="footer-socials">
          {socials.map((s) => {
            const I = s.platform === 'instagram' ? Icon.Instagram : s.platform === 'facebook' ? Icon.Facebook : Icon.TikTok;
            return (
              <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <I size={15} />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────────────── Connect (CTA teaser → contact page) */
function ConnectSection({ page }) {
  // Deterministic per-page variation so layout + image differ across the site
  const key = (page && page.path) || '/';
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;

  const pool = ((window.SITE_DATA && window.SITE_DATA.mediaPool) || [])
    .filter((m) => m.type === 'gallery' && m.cover)
    .map((m) => ({ src: m.cover, alt: m.alt || 'Gardinovački' }));
  const photo = pool.length ? pool[h % pool.length] : null;
  const variant = ['right', 'left', 'right-low'][h % 3];

  return (
    <section className={cls('connect', 'connect--' + variant)} data-screen-label="connect">
      <div className="connect__inner">
        <p className="connect__quote">
          Cveće će uvenuti, hrana će biti pojedena, čaše polomljene, a haljina će
          visiti prljava — sve što ostaje su uspomene i fotografije.
        </p>

        <div className="connect__ctawrap">
          <a className="connect__cta" href="#/kontakt/" onClick={(e) => { e.preventDefault(); navTo('/kontakt/'); }}>
            <span>Kontaktirajte me</span> <Icon.Arrow size={14} />
          </a>
        </div>

        <div className="connect__word" aria-hidden="true">CONNECT</div>
        <div className="connect__caption">Stvorimo uspomene zajedno</div>

        {photo && (
          <a className="connect__photo" href="#/kontakt/" onClick={(e) => { e.preventDefault(); navTo('/kontakt/'); }} aria-label="Kontakt">
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </a>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────────────────── ContactFormSection */
function ContactFormSection({ data }) {
  const { backgroundImage, heading, intro, contactDetails, form } = data.props;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="contact-section">
      <div className="contact-section__image">
        <img src={backgroundImage.src} alt={backgroundImage.alt} />
      </div>
      <div className="contact-section__form-wrap">
        <div className="contact-section__form-inner">
          <div className="eyebrow">— Kontakt</div>
          <h2 className="contact-section__heading">{heading}</h2>
          <p className="contact-section__intro">{intro}</p>

          <ul className="contact-details">
            <li><Icon.Phone size={14} /> <a href={contactDetails.phoneHref}>{contactDetails.phone}</a></li>
            <li><Icon.Mail size={14} /> <a href={contactDetails.emailHref}>{contactDetails.email}</a></li>
          </ul>

          {submitted ? (
            <div className="contact-form__thanks">
              <div className="t-quote">"Hvala — odgovaram u roku od 24 časa."</div>
              <button className="btn btn--ghost btn--small" onClick={() => setSubmitted(false)}>Pošalji još jedan upit</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              {form.fields.map((f) => {
                if (f.type === 'textarea') {
                  return (
                    <div className="field field--wide" key={f.name}>
                      <label htmlFor={f.name}>{f.label}</label>
                      <textarea id={f.name} name={f.name} placeholder={f.placeholder} required={f.required}></textarea>
                    </div>
                  );
                }
                if (f.type === 'select') {
                  return (
                    <div className="field" key={f.name}>
                      <label htmlFor={f.name}>{f.label}</label>
                      <select id={f.name} name={f.name} required={f.required} defaultValue="">
                        <option value="" disabled>Izaberite…</option>
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  );
                }
                return (
                  <div className="field" key={f.name}>
                    <label htmlFor={f.name}>{f.label}</label>
                    <input id={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required} />
                  </div>
                );
              })}
              <div className="contact-form__actions">
                <button className="btn" type="submit">
                  <span>{form.submitLabel}</span>
                  <span className="arrow"><Icon.Arrow size={14} /></span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────── CarouselHeroBanner (homepage) */
function CarouselHeroBanner({ props }) {
  const { slides, headline, intro, ctas } = props;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hero__stack">
        {slides.map((s, idx) => (
          <div key={idx} className={cls('hero__slide', idx === i && 'is-active')}>
            <img src={s.image} alt={s.alt} />
          </div>
        ))}
        <div className="hero__scrim"></div>
      </div>

      <div className="hero__content">
        <div className="hero__top">
        </div>
        <div className="hero__center">
          <h1 className="hero__headline">{headline.split(' ').map((w, j) => (
            j === headline.split(' ').length - 1
              ? <span key={j}><em className="serif-italic">{w}</em></span>
              : <span key={j}>{w} </span>
          ))}</h1>
        </div>

        <div className="hero__bottom">
          <div className="hero__counter">
            <span className="cur">{String(i + 1).padStart(2, '0')}</span>
            <span className="sep">/</span>
            <span className="tot">{String(slides.length).padStart(2, '0')}</span>
          </div>
          <div className="hero__dots">
            {slides.map((_, idx) => (
              <button key={idx} aria-label={'Slide ' + (idx + 1)} className={cls('hero__dot', idx === i && 'is-active')} onClick={() => setI(idx)} />
            ))}
          </div>
          <a className="hero__scroll" href="#next-section" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: window.innerHeight, behavior: 'smooth' }); }}>
            <span>Saznajte više</span>
            <Icon.ArrowDown size={12} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────── IntroText */
function IntroText({ props }) {
  const { heading, body, image, cta, eyebrow, variant, orbit } = props;

  // ── Orbit variant: masonry image wall behind centered white text ──
  if (variant === 'orbit') {
    const frames = (orbit || []);
    return (
      <section className="intro-orbit">
        <div className="intro-orbit__masonry" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, idx) => {
            const im = frames[idx % frames.length] || {};
            const span = (idx % 5 === 0) ? ' is-tall' : '';
            return (
              <figure key={idx} className={'intro-orbit__tile' + span}>
                <img src={im.src} alt={im.alt || ''} loading="lazy" />
              </figure>
            );
          })}
        </div>

        <div className="intro-orbit__copy">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          {heading && <h2 className="intro-orbit__heading">{heading}</h2>}
          <div className="intro-orbit__body">
            {(body || []).map((p, idx) => <p key={idx}>{p}</p>)}
          </div>
          {cta && <div className="intro-orbit__cta"><CTA cta={cta} kind="primary" /></div>}
        </div>
      </section>
    );
  }

  const hasImage = !!image;
  return (
    <section className={cls('intro', hasImage && 'intro--with-image', image && image.position === 'left' && 'intro--image-left')}>
      <div className="intro__copy">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        {heading && <h2 className="intro__heading">{heading}</h2>}
        <div className="intro__body">
          {(body || []).map((p, idx) => <p key={idx}>{p}</p>)}
        </div>
        {cta && <div className="intro__cta"><CTA cta={cta} kind="primary" /></div>}
      </div>
      {hasImage && (
        <figure className="intro__figure">
          <img src={image.src} alt={image.alt} />
        </figure>
      )}
    </section>
  );
}

/* ───────────────────────────────────── MasonryWall — bare image masonry, loads more on scroll */
function MasonryWall({ props }) {
  const { images: imagesProp, initial = 8, step = 4, max = 20 } = props || {};
  // Source images: explicit prop, else flatten the gallery pool
  const allImages = React.useMemo(() => {
    if (imagesProp && imagesProp.length) return imagesProp.slice(0, max);
    const pool = (window.SITE_DATA && window.SITE_DATA.mediaPool) || [];
    const flat = [];
    const seen = new Set();
    pool.filter((m) => m.type === 'gallery').forEach((g) => {
      (g.images || []).forEach((im) => {
        if (im && im.src && !seen.has(im.src)) { seen.add(im.src); flat.push(im); }
      });
    });
    // interleave so adjacent images aren't all from the same wedding
    return flat.slice(0, max);
  }, [imagesProp, max]);

  const [count, setCount] = useState(Math.min(initial, allImages.length));
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (count >= allImages.length) return;
    let ticking = false;
    const check = () => {
      ticking = false;
      const el = sentinelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 400) {
        setCount((c) => Math.min(c + step, allImages.length));
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // run once in case the sentinel is already near the viewport
    check();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count, step, allImages.length]);

  const shown = allImages.slice(0, count);
  return (
    <section className="mwall">
      <div className="mwall__masonry">
        {shown.map((im, idx) => (
          <figure key={im.src || idx} className="mwall__item" style={{ '--i': idx % step }}>
            <img src={im.src} alt={im.alt || ''} loading="lazy" />
          </figure>
        ))}
      </div>
      {count < allImages.length && <div ref={sentinelRef} className="mwall__sentinel" aria-hidden="true"></div>}
    </section>
  );
}
function Awards({ props }) {
  const { title, logos } = props;
  return (
    <section className="awards">
      {title && <div className="awards__title eyebrow">{title}</div>}
      <div className="awards__row">
        {(logos || []).map((l, idx) => (
          l.src
            ? <figure key={idx} className="awards__logo"><img src={l.src} alt={l.alt || ''} loading="lazy" /></figure>
            : <span key={idx} className="awards__wordmark">{l.label}</span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────── useVisibleCount — must match CSS breakpoints in .cards--carousel / .scg-carousel */
function useVisibleCount() {
  const calc = () => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w <= 700) return 1;
    if (w <= 1100) return 2;
    return 3;
  };
  const [v, setV] = useState(calc);
  useEffect(() => {
    const onR = () => setV(calc());
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  return v;
}

/* ──────────────────────────────────── useStepCarousel — one shared hook for all auto-stepped carousels */
function useStepCarousel(totalCards, enabled, intervalMs = 4800) {
  // Render the track 3x and start in the middle copy so we can swipe forward AND back.
  // i ranges roughly within [totalCards, totalCards*2]; we recenter on the edges.
  const initial = enabled ? totalCards : 0;
  const [i, setI] = useState(initial);
  const [animating, setAnimating] = useState(true);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  // Auto-tick (forward only)
  useEffect(() => {
    if (!enabled || paused || isDragging) return;
    const t = setInterval(() => {
      setAnimating(true);
      setI((v) => v + 1);
    }, intervalMs);
    return () => clearInterval(t);
  }, [enabled, paused, isDragging, intervalMs]);

  // Recenter into the middle copy after the transition lands outside the band
  useEffect(() => {
    if (!enabled || isDragging) return;
    if (i >= totalCards && i < totalCards * 2) return; // inside band
    const t = setTimeout(() => {
      setAnimating(false);
      setI((v) => {
        let n = v;
        while (n < totalCards) n += totalCards;
        while (n >= totalCards * 2) n -= totalCards;
        return n;
      });
      setTimeout(() => setAnimating(true), 50);
    }, 900);
    return () => clearTimeout(t);
  }, [i, totalCards, enabled, isDragging]);

  // ───── Pointer drag (works for mouse, touch, pen)
  const onPointerDown = (e) => {
    if (!enabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const trackEl = e.currentTarget;
    const firstCard = trackEl.firstElementChild;
    if (!firstCard) return;
    const cw = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(trackEl).gap) || 0;
    dragRef.current = {
      startX: e.clientX,
      startI: i,
      step: cw + gap,
      moved: false,
      pointerId: e.pointerId,
    };
    setIsDragging(true);
    setAnimating(false);
    try { trackEl.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 3) dragRef.current.moved = true;
    setDragX(dx);
  };
  const finishDrag = () => {
    if (!dragRef.current) return;
    const { startI, step } = dragRef.current;
    // dx>0 = drag right = want previous → decrement; dx<0 = drag left = want next
    const stepsMoved = Math.round(-dragX / step);
    dragRef.current = null;
    setDragX(0);
    setAnimating(true);
    setI(startI + stepsMoved);
    setIsDragging(false);
  };
  const onPointerUp = () => finishDrag();
  const onPointerCancel = () => finishDrag();
  // Swallow the click that fires after a real drag so the underlying card doesn't navigate
  const onClickCapture = (e) => {
    if (dragRef.current && dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // ───── Inline track style
  const baseTranslate = enabled
    ? 'calc(-1 * ' + i + ' * (var(--card-w) + var(--carousel-gap)))'
    : '0px';
  const transform = enabled
    ? 'translateX(calc(' + baseTranslate + ' + ' + dragX + 'px))'
    : undefined;

  const trackStyle = enabled
    ? {
        transform,
        transition: animating ? 'transform 0.85s cubic-bezier(.55, 0, .2, 1)' : 'none',
        touchAction: 'pan-y',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }
    : null;

  return {
    trackStyle,
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClickCapture,
  };
}

/* ─────────────────────────────────────── Cards — carousel by default; static grid when props.layout === 'grid' */
function Cards({ props, pageCtx }) {
  const { heading, intro, variant, pretitle, headAction, layout, source } = props;

  const isStories = variant === 'stories';

  // For stories we keep the RAW gallery objects so we can reuse the portfolio MediaCard design
  const storyGalleries = (source === 'galleries' && window.SITE_DATA && window.SITE_DATA.mediaPool)
    ? window.SITE_DATA.mediaPool.filter((m) => m.type === 'gallery')
    : [];

  // Build cards from the global gallery pool when source === 'galleries' (reuses the exact card design)
  const cards = isStories
    ? storyGalleries
    : (source === 'galleries' && window.SITE_DATA && window.SITE_DATA.mediaPool)
      ? window.SITE_DATA.mediaPool
          .filter((m) => m.type === 'gallery')
          .map((g) => ({ image: g.cover, alt: g.alt || g.title, title: g.title, description: g.text, cta: g.cta }))
      : props.cards;

  // Shared card renderer (grid + carousel)
  const renderGridCard = (c, idx) => {
    const handler = isInternal(c.cta && c.cta.url) ? (e) => { e.preventDefault(); navTo(c.cta.url); } : undefined;
    return (
      <a key={idx} className="card" href={c.cta ? hashFor(c.cta.url) : '#'} onClick={handler}>
        <div className="card__num">{String(idx + 1).padStart(2, '0')}</div>
        <div className="card__media">
          <img src={c.image} alt={c.alt} loading="lazy" />
        </div>
        <div className="card__body">
          <h3 className="card__title">{c.title}</h3>
          <p className="card__desc">{c.description}</p>
          {c.cta && (
            <span className="card__link">{c.cta.label} <Icon.Arrow size={12} /></span>
          )}
        </div>
      </a>
    );
  };

  // ── Original static grid (used by the Packages landing page) ──
  if (layout === 'grid') {
    return (
      <section className={cls('cards', variant === 'packages' && 'cards--packages', variant === 'services' && 'cards--services', 'cards--grid')}>
        <SectionHead
          pretitle={pretitle ?? derivePretitle(heading)}
          title={heading}
          text={intro}
          action={headAction}
        />
        <div className={cls('cards__grid', variant === 'packages' && 'cards__grid--packages')}>
          {cards.map(renderGridCard)}
        </div>
      </section>
    );
  }

  // Stepped auto-slide with manual drag/swipe
  const visible = useVisibleCount();
  const shouldAnimate = cards.length > visible;
  // Render the run thrice so the user can swipe forward AND back through one logical loop
  const items = shouldAnimate ? [...cards, ...cards, ...cards] : cards;

  // Measure the carousel container so card widths size off real px, not circular 100%
  const carouselRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  useLayoutEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Stepped auto-slide with manual drag/swipe (mouse or touch)
  const carousel = useStepCarousel(cards.length, shouldAnimate);

  // Derive sensible head action when not specified
  let action = headAction;
  if (!action && variant === 'packages' && (heading === 'Paketi' || heading === 'Svi paketi')) {
    if (pageCtx && pageCtx.path !== '/paketi/') {
      action = <CTA cta={{ label: 'Svi paketi', url: '/paketi/', variant: 'secondary' }} kind="secondary" size="sm" />;
    }
  }

  const renderCard = (c, idx) => {
    const realIdx = idx % cards.length;
    if (isStories) {
      const MC = window.MediaCard;
      const open = isInternal(c.cta && c.cta.url) ? () => navTo(c.cta.url) : undefined;
      return <MC key={idx} item={c} onOpen={open} />;
    }
    const handler = isInternal(c.cta && c.cta.url) ? (e) => { e.preventDefault(); navTo(c.cta.url); } : undefined;
    return (
      <a key={idx} className="card" href={c.cta ? hashFor(c.cta.url) : '#'} onClick={handler}>
        <div className="card__num">{String(realIdx + 1).padStart(2, '0')}</div>
        <div className="card__media">
          <img src={c.image} alt={c.alt} loading="lazy" />
        </div>
        <div className="card__body">
          <h3 className="card__title">{c.title}</h3>
          <p className="card__desc">{c.description}</p>
          {c.cta && (
            <span className="card__link">
              {c.cta.label} <Icon.Arrow size={12} />
            </span>
          )}
        </div>
      </a>
    );
  };

  return (
    <section className={cls(
      'cards',
      variant === 'packages' && 'cards--packages',
      variant === 'services' && 'cards--services',
      isStories && 'cards--stories',
      'cards--carousel'
    )}>
      <SectionHead
        pretitle={pretitle ?? derivePretitle(heading)}
        title={heading}
        text={intro}
        action={action}
        centered={isStories}
      />
      <div
        className={cls('cards-carousel', !shouldAnimate && 'cards-carousel--static')}
        ref={carouselRef}
        onMouseEnter={carousel.onMouseEnter}
        onMouseLeave={carousel.onMouseLeave}
        style={containerW ? { '--auto-count': cards.length, '--container-w': containerW + 'px' } : { '--auto-count': cards.length }}
      >
        <div
          className="cards-carousel__track"
          style={carousel.trackStyle || undefined}
          onPointerDown={carousel.onPointerDown}
          onPointerMove={carousel.onPointerMove}
          onPointerUp={carousel.onPointerUp}
          onPointerCancel={carousel.onPointerCancel}
          onClickCapture={carousel.onClickCapture}
        >
          {items.map(renderCard)}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────── ServiceCarouselGallery */
function ServiceCarouselGallery({ props, onOpenLightbox }) {
  const { heading, intro, images, cta, pretitle } = props;

  // Auto-marquee sizing (mirror Cards carousel approach)
  const carouselRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  useLayoutEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Stepped auto-slide — only if there are more slides than fit
  const visible = useVisibleCount();
  const shouldAnimate = images.length > visible;
  const carousel = useStepCarousel(images.length, shouldAnimate, 5200);

  // Find a gallery page that matches this image's alt (loose match on couple names)
  const norm = (s) => (s || '').toLowerCase().replace(/\s*[i&]\s*/gi, ' ').replace(/\s+/g, ' ').trim();
  const galleryPages = (window.SITE_DATA && window.SITE_DATA.pages || []).filter((p) => p.template === 'T4-gallery');
  const findGallery = (alt) => {
    const target = norm(alt);
    if (!target) return null;
    return galleryPages.find((p) => {
      const sb = (p.sections || []).find((s) => s.component === 'standard-banner');
      return sb && norm(sb.props.title) === target;
    });
  };

  // Render the run thrice so the user can swipe forward AND back
  const items = shouldAnimate ? [...images, ...images, ...images] : images;

  const openLB = (idx) => onOpenLightbox && onOpenLightbox(images, idx % images.length);

  return (
    <section className="scg">
      <SectionHead
        pretitle={pretitle ?? derivePretitle(heading)}
        title={heading}
        text={intro}
        action={cta ? <CTA cta={cta} kind="secondary" size="sm" /> : null}
      />
      <div
        className={cls('scg-carousel', !shouldAnimate && 'scg-carousel--static')}
        ref={carouselRef}
        onMouseEnter={carousel.onMouseEnter}
        onMouseLeave={carousel.onMouseLeave}
        style={containerW ? { '--auto-count': images.length, '--container-w': containerW + 'px' } : { '--auto-count': images.length }}
      >
        <div
          className="scg-carousel__track"
          style={carousel.trackStyle || undefined}
          onPointerDown={carousel.onPointerDown}
          onPointerMove={carousel.onPointerMove}
          onPointerUp={carousel.onPointerUp}
          onPointerCancel={carousel.onPointerCancel}
          onClickCapture={carousel.onClickCapture}
        >
          {items.map((im, idx) => {
            const realIdx = idx % images.length;
            const gallery = findGallery(im.alt);
            return (
              <figure key={idx} className="scg-slide">
                <button
                  className="scg-slide__media"
                  onClick={() => openLB(idx)}
                  aria-label={'Otvori ' + im.alt}
                >
                  <img src={im.src} alt={im.alt} loading="lazy" />
                  <span className="scg-slide__scrim" aria-hidden="true"></span>
                </button>
                <figcaption className="scg-slide__overlay">
                  <div className="scg-slide__pretitle">Galerija</div>
                  <h3 className="scg-slide__title">{im.alt}</h3>
                  {gallery ? (
                    <a
                      className="scg-slide__cta"
                      href={hashFor(gallery.path)}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navTo(gallery.path); }}
                    >
                      <span>Pogledaj celu galeriju</span>
                      <Icon.Arrow size={12} />
                    </a>
                  ) : (
                    <button
                      className="scg-slide__cta scg-slide__cta--peek"
                      onClick={(e) => { e.stopPropagation(); openLB(idx); }}
                    >
                      <span>Pogledaj fotografiju</span>
                      <Icon.Arrow size={12} />
                    </button>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────── StandardBanner */
function StandardBanner({ props }) {
  const { backgroundImage, title, subtitle, breadcrumbs } = props;
  return (
    <section className="banner">
      <div className="banner__bg">
        <img src={backgroundImage.src} alt={backgroundImage.alt} />
      </div>
      <div className="banner__content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="banner__crumbs" aria-label="Breadcrumbs">
            {breadcrumbs.map((b, idx) => {
              const last = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {b.url ? (
                    <a href={hashFor(b.url)} onClick={(e) => { e.preventDefault(); navTo(b.url); }}>{b.label}</a>
                  ) : <span className={last ? 'is-current' : ''}>{b.label}</span>}
                  {!last && <span className="crumb-sep">/</span>}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="banner__title">{title}</h1>
        {subtitle && <p className="banner__subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}

/* ───────────────────────────────────── MediaGallery */
function MediaGallery({ props, onOpenLightbox }) {
  const { heading, intro, items, layout } = props;
  const [filter, setFilter] = useState('all');

  if (layout === 'masonry') {
    // True masonry via CSS columns
    return (
      <section className="mg mg--masonry">
        <SectionHead
          pretitle={props.pretitle ?? derivePretitle(heading)}
          title={heading}
          text={intro}
        />
        <div className="mg__masonry">
          {items.map((it, idx) => (
            <button key={idx} className="mg__brick" onClick={() => onOpenLightbox(items, idx)}>
              <img src={it.src} alt={it.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  // grid layout — used on services landing pages with titles + CTAs
  return (
    <section className="mg mg--grid">
      <SectionHead
        pretitle={props.pretitle ?? derivePretitle(heading)}
        title={heading}
        text={intro}
      />
      <div className="mg__grid">
        {items.map((it, idx) => {
          if (it.type === 'video') {
            return (
              <div key={idx} className="mg__cell mg__cell--video">
                <div className="mg__media"><img src={it.src} alt={it.alt} loading="lazy" /><div className="mg__play"><Icon.Play size={18} /></div></div>
                <div className="mg__cell-body">
                  <div className="eyebrow">Video</div>
                  <h3 className="mg__cell-title">{it.title}</h3>
                  {it.description && <p className="mg__cell-desc">{it.description}</p>}
                </div>
              </div>
            );
          }
          const handler = it.cta ? (e) => { e.preventDefault(); navTo(it.cta.url); } : undefined;
          return (
            <a key={idx} className="mg__cell" href={it.cta ? hashFor(it.cta.url) : '#'} onClick={handler}>
              <div className="mg__media">
                <img src={it.src} alt={it.alt} loading="lazy" />
              </div>
              <div className="mg__cell-body">
                <div className="mg__num">{String(idx + 1).padStart(2, '0')}</div>
                <h3 className="mg__cell-title">{it.title}</h3>
                {it.cta && <span className="mg__cell-link">{it.cta.label} <Icon.Arrow size={12} /></span>}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────────────────── Numbers */
function Numbers({ props }) {
  const { heading, items, pretitle, intro } = props;
  return (
    <section className="numbers numbers--cards">
      <div className="numbers__head">
        <SectionHead
          pretitle={pretitle ?? derivePretitle(heading) ?? 'Sadržaj'}
          title={heading}
          text={intro}
        />
      </div>
      <ul className="numbers__grid">
        {items.map((it, idx) => {
          const Ico = iconForLabel(it.label);
          return (
            <li key={idx} className="numbers__card">
              <span className="numbers__badge">{it.number}</span>
              <span className="numbers__card-ico"><Ico size={26} /></span>
              <span className="numbers__label">{it.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────────────────── InstagramFeed (mock — uses recent gallery images) */
function InstagramFeed({ props }) {
  const { heading, handle, profileUrl, postCount } = props;
  const pool = (window.SITE_DATA && window.SITE_DATA.pages || [])
    .filter((p) => p.template === 'T4-gallery')
    .flatMap((p) => {
      const mg = (p.sections || []).find((s) => s.component === 'media-gallery');
      return mg ? mg.props.items.slice(0, 3) : [];
    });
  const posts = pool.slice(0, postCount || 8);
  return (
    <section className="ig">
      <SectionHead
        pretitle={<React.Fragment><Icon.Instagram size={13} /> @{handle}</React.Fragment>}
        title={heading}
        action={
          <a className="btn btn--ghost btn--small" href={profileUrl} target="_blank" rel="noopener noreferrer">
            Otvori Instagram <Icon.Arrow size={12} />
          </a>
        }
      />
      <div className="ig__grid">
        {posts.map((p, idx) => (
          <a key={idx} className="ig__cell" href={profileUrl} target="_blank" rel="noopener noreferrer">
            <img src={p.src} alt={p.alt} loading="lazy" />
            <span className="ig__overlay"><Icon.Instagram size={20} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────── PackageDetail (T6: intro + numbers merged) */
function iconForLabel(label) {
  const l = (label || '').toLowerCase();
  if (/celodnevn[oa]?.+(video|snimanj)|montaž|dugačk.+film|spot.+film/i.test(l)) return Icon.Film;
  if (/(štampan|drven.*kutij)/i.test(l)) return Icon.Box;
  if (/online galerij|studijski obrađ/i.test(l)) return Icon.Cloud;
  if (/foto knjig/i.test(l)) return Icon.Book;
  if (/sat[a]?\b|\bsata\b/i.test(l)) return Icon.Clock;
  if (/foto sesij/i.test(l)) return Icon.Heart;
  if (/fotografisanj/i.test(l)) return Icon.Camera;
  if (/spot|montaž/i.test(l)) return Icon.Film;
  return Icon.Check;
}

function PackageDetail({ intro, numbers, page }) {
  // Find this package's banner so we can pull the package name for the eyebrow
  const banner = (page.sections || []).find((s) => s.component === 'standard-banner');
  const packageName = banner ? banner.props.title : '';
  return (
    <section className="package-detail">
      <div className="package-detail__copy">
        <div className="eyebrow">— Paket {packageName}</div>
        <h2 className="package-detail__title">{intro.heading}</h2>
        {(intro.body || []).map((p, i) => (
          <p key={i} className="package-detail__lede">{p}</p>
        ))}
        <div className="package-detail__cta">
          <CTA
            cta={{ label: 'Rezerviši ovaj paket', url: '/kontakt/', variant: 'wood' }}
            kind="wood"
          />
          <a
            className="package-detail__back"
            href="#/paketi/"
            onClick={(e) => { e.preventDefault(); navTo('/paketi/'); }}
          >
            ← Svi paketi
          </a>
        </div>
      </div>

      <div className="package-detail__items">
        <div className="package-detail__items-head">
          <div className="eyebrow">— Šta uključuje</div>
          <div className="package-detail__count">
            {String(numbers.items.length).padStart(2, '0')} <span className="muted">stavki</span>
          </div>
        </div>
        <ul className="package-detail__list">
          {numbers.items.map((it, idx) => {
            const I = iconForLabel(it.label);
            return (
              <li key={idx} className="package-detail__row">
                <span className="package-detail__icon" aria-hidden="true">
                  <I size={22} />
                </span>
                <span className="package-detail__label">{it.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
/* ───────────────────────────────────── Lightbox */
function Lightbox({ items, index, onClose, onSet }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onSet((index - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') onSet((index + 1) % items.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, items.length, onClose, onSet]);

  if (!items) return null;
  const item = items[index];
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" aria-label="Zatvori" onClick={onClose}><Icon.Close size={22} /></button>
      <button className="lightbox__nav lightbox__nav--prev" aria-label="Prethodna" onClick={(e) => { e.stopPropagation(); onSet((index - 1 + items.length) % items.length); }}><Icon.ChevL size={28} /></button>
      <button className="lightbox__nav lightbox__nav--next" aria-label="Sledeća" onClick={(e) => { e.stopPropagation(); onSet((index + 1) % items.length); }}><Icon.ChevR size={28} /></button>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img src={item.src} alt={item.alt} />
        <figcaption>
          <span className="serif-italic">{item.alt}</span>
          <span className="muted"> · {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        </figcaption>
      </figure>
    </div>
  );
}

/* ───────────────────────────────────── FeatureBanner — reusable cinematic banner
   Full-bleed background image(s) with overlaid eyebrow / title / subtext that can be
   pinned to any of 5 anchor points. A single layer renders static; 2+ layers become a
   stepped, swipeable carousel with a progress rail. */
const FB_POSITIONS = ['top-left', 'top-center', 'top-right', 'center', 'bottom-left', 'bottom-center', 'bottom-right'];

function FeatureBannerOverlay({ slide }) {
  const pos = FB_POSITIONS.includes(slide.position) ? slide.position : 'bottom-left';
  return (
    <div className={cls('feature-banner__overlay', 'feature-banner__overlay--' + pos)}>
      <div className="feature-banner__copy">
        {slide.eyebrow && <div className="feature-banner__eyebrow">{slide.eyebrow}</div>}
        {slide.title && <h2 className="feature-banner__title">{slide.title}</h2>}
        {slide.subtext && <p className="feature-banner__subtext">{slide.subtext}</p>}
        {slide.cta && <div className="feature-banner__cta"><CTA cta={slide.cta} kind="primary" /></div>}
      </div>
    </div>
  );
}

function FeatureBanner({ props }) {
  const { slides = [], height = 'tall', intervalMs = 6000, autoplay = true } = props;
  const count = slides.length;
  const multi = count > 1;

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  // Autoplay, infinite loop. Pause on hover. (No manual scroll/drag.)
  useEffect(() => {
    if (!multi || !autoplay || paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % count), intervalMs);
    return () => clearTimeout(t);
  }, [i, multi, autoplay, paused, intervalMs, count]);

  const go = (n) => setI((n + count) % count);

  return (
    <section
      className={cls('feature-banner', 'feature-banner--' + height, multi && 'feature-banner--carousel')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription={multi ? 'carousel' : undefined}
    >
      <div className="feature-banner__stack">
        {slides.map((slide, idx) => (
          <div
            className={cls('feature-banner__slide', idx === i && 'is-active')}
            key={idx}
            aria-hidden={multi && idx !== i}
          >
            <div className="feature-banner__media">
              <img src={slide.image} alt={slide.alt || slide.title || ''} draggable="false" loading={idx === 0 ? 'eager' : 'lazy'} />
              <div className={cls('feature-banner__scrim', 'feature-banner__scrim--' + (FB_POSITIONS.includes(slide.position) ? slide.position : 'bottom-left'))} />
            </div>
            <FeatureBannerOverlay slide={slide} />
          </div>
        ))}
      </div>

      {multi && (
        <div className="feature-banner__progress" role="tablist" aria-label="Koraci">
          <div className="feature-banner__steps">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={cls('feature-banner__step', idx === i && 'is-active', idx < i && 'is-done')}
                aria-label={'Slajd ' + (idx + 1)}
                aria-selected={idx === i}
                role="tab"
                onClick={() => go(idx)}
              >
                <span
                  className="feature-banner__step-fill"
                  style={(idx === i && !paused && autoplay) ? { animationDuration: intervalMs + 'ms' } : undefined}
                />
              </button>
            ))}
          </div>
          <div className="feature-banner__count">
            <span className="feature-banner__count-now">{String(i + 1).padStart(2, '0')}</span>
            <span className="feature-banner__count-sep">/</span>
            <span className="feature-banner__count-total">{String(count).padStart(2, '0')}</span>
          </div>
        </div>
      )}
    </section>
  );
}

Object.assign(window, {
  Header, Footer, ContactFormSection, ConnectSection,
  CarouselHeroBanner, IntroText, Cards, ServiceCarouselGallery,
  StandardBanner, MediaGallery, Numbers, InstagramFeed,
  FeatureBanner,
  PackageDetail,
  Lightbox, CTA, navTo, hashFor,
  SectionHead, derivePretitle,
});
