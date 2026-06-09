/* MediaShowcase — reusable filtered masonry of media cards with infinite scroll
   and a rich lightbox (video playback, gallery sub-images, prev/next, bottom toolbar).
   Reads items from window.SITE_DATA.mediaPool. Loaded after sections.jsx so the
   shared helpers below already exist on window. */
const { CTA: SCTA, navTo: sNavTo, hashFor: sHashFor, SectionHead: SSectionHead } = window;
const Icon = window.Icon;
const { useState: uS, useEffect: uE, useRef: uR, useCallback: uCb } = React;
const scls = (...xs) => xs.filter(Boolean).join(' ');

/* ── A single autoplay-in-view video element ── */
function CardVideo({ src, poster }) {
  const ref = uR(null);
  uE(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { v.play && v.play().catch(() => {}); }
        else { v.pause && v.pause(); }
      });
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="ms-card__video"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={-1}
    />
  );
}

/* ── One masonry card ── */
function MediaCard({ item, onOpen }) {
  const isVideo = item.type === 'video';
  const isGallery = item.type === 'gallery';
  return (
    <button
      className={scls('ms-card', 'ms-card--' + (item.aspect || 'portrait'))}
      onClick={onOpen}
      aria-label={item.title || item.alt}
    >
      <div className="ms-card__media">
        {isVideo
          ? <CardVideo src={item.videoUrl} poster={item.poster || item.cover} />
          : <img src={item.cover || item.src} alt={item.alt || item.title || ''} loading="lazy" draggable="false" />
        }
        <div className="ms-card__scrim" />

        {isVideo && (
          <span className="ms-card__badge"><Icon.Film size={14} /> Video</span>
        )}
        {isGallery && (
          <span className="ms-card__badge"><Icon.Images size={14} /> {item.images ? item.images.length : ''}</span>
        )}
        {isVideo && (
          <span className="ms-card__play" aria-hidden="true"><Icon.Play size={20} /></span>
        )}

        {(item.title || item.text) && (
          <div className="ms-card__cap">
            {item.title && <span className="ms-card__cap-title">{item.title}</span>}
            {item.text && <span className="ms-card__cap-text">{item.text}</span>}
          </div>
        )}
      </div>
    </button>
  );
}

/* ── Lightbox over the filtered card list ── */
function ShowcaseLightbox({ cards, index, onClose, onSet }) {
  const [sub, setSub] = uS(0);
  const card = cards[index];

  // reset sub-image when the card changes
  uE(() => { setSub(0); }, [index]);

  uE(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onSet((index - 1 + cards.length) % cards.length);
      else if (e.key === 'ArrowRight') onSet((index + 1) % cards.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, cards.length, onClose, onSet]);

  if (!card) return null;
  const galleryImgs = card.type === 'gallery' ? (card.images || []) : null;

  let mediaEl;
  if (card.type === 'video') {
    mediaEl = (
      <video className="ms-lb__media" src={card.videoUrl} poster={card.poster || card.cover} controls autoPlay playsInline />
    );
  } else if (galleryImgs && galleryImgs.length) {
    const g = galleryImgs[Math.min(sub, galleryImgs.length - 1)];
    mediaEl = <img className="ms-lb__media" src={g.src} alt={g.alt || card.title} />;
  } else {
    mediaEl = <img className="ms-lb__media" src={card.src || card.cover} alt={card.alt || card.title} />;
  }

  return (
    <div className="ms-lb" onClick={onClose}>
      <button className="ms-lb__close" aria-label="Zatvori" onClick={onClose}><Icon.Close size={22} /></button>

      <button className="ms-lb__nav ms-lb__nav--prev" aria-label="Prethodna" onClick={(e) => { e.stopPropagation(); onSet((index - 1 + cards.length) % cards.length); }}><Icon.ChevL size={30} /></button>
      <button className="ms-lb__nav ms-lb__nav--next" aria-label="Sledeća" onClick={(e) => { e.stopPropagation(); onSet((index + 1) % cards.length); }}><Icon.ChevR size={30} /></button>

      <div className="ms-lb__stage" onClick={(e) => e.stopPropagation()}>
        <div className="ms-lb__mediawrap">
          {mediaEl}

          {/* gallery sub-image arrows */}
          {galleryImgs && galleryImgs.length > 1 && (
            <React.Fragment>
              <button className="ms-lb__sub ms-lb__sub--prev" aria-label="Prethodna fotografija" onClick={() => setSub((sub - 1 + galleryImgs.length) % galleryImgs.length)}><Icon.ChevL size={20} /></button>
              <button className="ms-lb__sub ms-lb__sub--next" aria-label="Sledeća fotografija" onClick={() => setSub((sub + 1) % galleryImgs.length)}><Icon.ChevR size={20} /></button>
              <span className="ms-lb__subcount">{Math.min(sub, galleryImgs.length - 1) + 1} / {galleryImgs.length}</span>
            </React.Fragment>
          )}
        </div>

        {/* bottom toolbar */}
        <div className="ms-lb__bar">
          <button className="ms-lb__barnav" onClick={() => onSet((index - 1 + cards.length) % cards.length)}>
            <Icon.ChevL size={16} /><span>Prethodno</span>
          </button>

          <div className="ms-lb__barcopy">
            {card.title && <span className="ms-lb__bartitle">{card.title}</span>}
            {card.text && <span className="ms-lb__bartext">{card.text}</span>}
            {card.cta && (
              <a
                className="ms-lb__barcta"
                href={card.cta.url && card.cta.url.startsWith('/') ? sHashFor(card.cta.url) : (card.cta.url || '#')}
                onClick={card.cta.url && card.cta.url.startsWith('/') ? (e) => { e.preventDefault(); onClose(); sNavTo(card.cta.url); } : undefined}
              >
                <span>{card.cta.label}</span><Icon.Arrow size={13} />
              </a>
            )}
          </div>

          <button className="ms-lb__barnav ms-lb__barnav--next" onClick={() => onSet((index + 1) % cards.length)}>
            <span>Sledeće</span><Icon.ChevR size={16} />
          </button>
        </div>

        <div className="ms-lb__counter">{String(index + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</div>
      </div>
    </div>
  );
}

/* ── The section ── */
function MediaShowcase({ props }) {
  const { filterable = false, tags = [], lockedTags = null, pageSize = 9, heading, intro } = props;
  const pool = (window.SITE_DATA && window.SITE_DATA.mediaPool) || [];

  // Base set: optionally locked to specific tags (Weddings / Locations)
  const base = lockedTags && lockedTags.length
    ? pool.filter((it) => lockedTags.every((t) => (it.tags || []).includes(t)))
    : pool;

  const [activeTag, setActiveTag] = uS('Sve');
  const [count, setCount] = uS(pageSize);

  const filtered = (filterable && activeTag !== 'Sve')
    ? base.filter((it) => (it.tags || []).includes(activeTag))
    : base;

  // reset paging when filter changes
  uE(() => { setCount(pageSize); }, [activeTag, pageSize]);

  const shown = filtered.slice(0, count);
  const hasMore = count < filtered.length;

  // Infinite scroll sentinel
  const sentinelRef = uR(null);
  uE(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setCount((c) => Math.min(c + pageSize, filtered.length));
      }
    }, { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, pageSize, filtered.length]);

  const [lbIndex, setLbIndex] = uS(null);

  return (
    <section className="ms">
      {(heading || intro) && (
        <SSectionHead pretitle={props.pretitle} title={heading} text={intro} />
      )}

      {/* Ribbon strip — always visible, full-width band; values stay constrained */}
      <div className="ms-ribbon">
        <div className="ms-ribbon__inner">
          {filterable && tags.length > 0 ? (
            <div className="ms-filters" role="tablist" aria-label="Filter">
              {tags.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={activeTag === t}
                  className={scls('ms-filter', activeTag === t && 'is-active')}
                  onClick={() => setActiveTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <span className="ms-ribbon__label">{lockedTags && lockedTags.length ? lockedTags.join(' · ') : 'Svi radovi'}</span>
          )}
          <span className="ms-ribbon__count">{filtered.length} {filtered.length === 1 ? 'rad' : 'radova'}</span>
        </div>
      </div>

      <div className="ms-masonry">
        {shown.map((item, idx) => (
          <MediaCard key={item.id || idx} item={item} onOpen={() => setLbIndex(idx)} />
        ))}
      </div>

      {hasMore && (
        <div className="ms-more" ref={sentinelRef}>
          <button className="ms-more__btn" onClick={() => setCount((c) => Math.min(c + pageSize, filtered.length))}>
            Učitaj još
          </button>
        </div>
      )}

      {lbIndex !== null && (
        <ShowcaseLightbox
          cards={filtered}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onSet={setLbIndex}
        />
      )}
    </section>
  );
}

window.MediaShowcase = MediaShowcase;
