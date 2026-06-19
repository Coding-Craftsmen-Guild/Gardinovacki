/* eslint-disable */
/* Page composer + router. Renders any page from SITE_DATA by walking its `sections`,
   wrapping in global header/footer/contact-form per the page's globalSections list. */

const { useState: usePageState, useEffect: usePageEffect, useMemo } = React;

const SECTION_RENDERERS = {
  'carousel-hero-banner':     (s, ctx) => <CarouselHeroBanner props={s.props} />,
  'intro-text':               (s, ctx) => <IntroText props={s.props} />,
  'cards':                    (s, ctx) => <Cards props={s.props} pageCtx={ctx.page} />,
  'service-carousel-gallery': (s, ctx) => <ServiceCarouselGallery props={s.props} onOpenLightbox={ctx.openLightbox} />,
  'standard-banner':          (s, ctx) => <StandardBanner props={s.props} />,
  'feature-banner':           (s, ctx) => <FeatureBanner props={s.props} />,
  'media-showcase':           (s, ctx) => <MediaShowcase props={s.props} />,
  'media-gallery':            (s, ctx) => <MediaGallery props={s.props} onOpenLightbox={ctx.openLightbox} />,
  'numbers':                  (s, ctx) => <Numbers props={s.props} />,
  'awards':                   (s, ctx) => <Awards props={s.props} />,
  'masonry-wall':             (s, ctx) => <MasonryWall props={s.props} />,
  // 'instagram-feed' is intentionally omitted — the IG strip now lives in the global footer.
  'instagram-feed':           () => null,
};

/* ─────────────────────────────── helpers */
function pageBySlug(path) {
  const pages = window.SITE_DATA.pages;
  // normalize: ensure trailing slash
  const norm = path.endsWith('/') ? path : path + '/';
  return pages.find((p) => p.path === norm) || pages[0];
}

function GalleryFooterNav({ current }) {
  const galleries = window.SITE_DATA.pages.filter((p) => p.template === 'T4-gallery');
  const i = galleries.findIndex((g) => g.path === current.path);
  if (i === -1) return null;
  const prev = galleries[(i - 1 + galleries.length) % galleries.length];
  const next = galleries[(i + 1) % galleries.length];
  const titleOf = (p) => {
    const sb = (p.sections || []).find((s) => s.component === 'standard-banner');
    return sb ? sb.props.title : p.path;
  };
  return (
    <section className="gallery-nav">
      <a className="gallery-nav__center" href="#/galerija/tijana-luka/" onClick={(e) => { e.preventDefault(); navTo('/galerija/tijana-luka/'); }}>
        <span className="eyebrow">Sve galerije venčanja</span>
      </a>
    </section>
  );
}

function PackageCrossSell({ current }) {
  const packages = window.SITE_DATA.pages.filter((p) => p.template === 'T6-package');
  const others = packages.filter((p) => p.path !== current.path);
  const cards = others.map((p) => {
    const banner = (p.sections || []).find((s) => s.component === 'standard-banner');
    return {
      image: banner.props.backgroundImage.src,
      alt: banner.props.backgroundImage.alt,
      title: banner.props.title,
      description: banner.props.subtitle,
      cta: { label: 'Pogledaj paket', url: p.path, variant: 'primary' },
    };
  });
  return (
    <Cards
      props={{
        pretitle: 'Drugi paketi',
        heading: 'Pogledajte i druge pakete',
        intro: 'Pet opcija — od kratkog fotografisanja do celodnevnog video paketa.',
        variant: 'packages',
        cards,
        headAction: (
          <a className="btn btn--ghost btn--small" href="#/paketi/" onClick={(e) => { e.preventDefault(); navTo('/paketi/'); }}>
            Svi paketi <Icon.Arrow size={12} />
          </a>
        ),
      }}
      pageCtx={current}
    />
  );
}

/* ─────────────────────────────── Page composer */
function PageBody({ page }) {
  const [lightbox, setLightbox] = usePageState(null);
  const ctx = {
    openLightbox: (items, index) => setLightbox({ items, index }),
    page,
  };

  const sections = (page.sections || []).map((s, idx) => {
    const renderer = SECTION_RENDERERS[s.component];
    if (!renderer) return <div key={idx} className="missing-component">Missing: {s.component}</div>;
    return <React.Fragment key={idx}>{renderer(s, ctx)}</React.Fragment>;
  });

  // Template-specific add-ons
  const extras = [];
  if (page.template === 'T4-gallery') extras.push(<GalleryFooterNav key="gnav" current={page} />);
  if (page.template === 'T6-package') extras.push(<PackageCrossSell key="cs" current={page} />);

  return (
    <main className="page-body" data-screen-label={page.template + ' ' + page.path}>
      {sections}
      {extras}
      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onSet={(idx) => setLightbox({ items: lightbox.items, index: idx })}
        />
      )}
    </main>
  );
}

/* ─────────────────────────────── App */
function App() {
  const [hash, setHash] = usePageState(window.location.hash || '#/');
  usePageEffect(() => {
    const onHash = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
    };
    window.addEventListener('hashchange', onHash);
    // ensure initial hash
    if (!window.location.hash) window.location.hash = '#/';
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const path = (hash.replace(/^#/, '') || '/');
  const page = useMemo(() => pageBySlug(path), [path]);

  const globals = window.SITE_DATA.globals;
  const useGlobals = page.globalSections || ['header', 'contact-form-section', 'footer'];
  const isKontakt = page.path === '/kontakt/';

  return (
    <div className="app">
      {useGlobals.includes('header') && <Header data={globals.header} />}
      <PageBody page={page} />
      {useGlobals.includes('contact-form-section') && (isKontakt
        ? <ContactFormSection data={globals['contact-form-section']} />
        : <ConnectSection page={page} />)}
      {useGlobals.includes('footer') && <Footer data={globals.footer} navData={globals.header} />}
    </div>
  );
}

window.App = App;
