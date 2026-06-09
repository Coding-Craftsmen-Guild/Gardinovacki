#!/usr/bin/env node
/*
 * Generates site/pages/**.json and site/sitemap.json
 * from the crawled data in ../data/.
 *
 * Hand-authored files (NOT touched by this script):
 *   - site/README.md
 *   - site/globals.json
 *   - site/components/*.json
 *
 * Run from anywhere: `node site/_tools/build.js`
 */

const fs = require('fs');
const path = require('path');

const SITE_ROOT  = path.resolve(__dirname, '..');
const REPO_ROOT  = path.resolve(SITE_ROOT, '..');
const DATA_ROOT  = path.join(REPO_ROOT, 'data');
const PAGES_OUT  = path.join(SITE_ROOT, 'pages');

const summary  = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'extract-summary.json'), 'utf8'));
const byUrl    = Object.fromEntries(summary.map(p => [p.url, p]));

// ----- helpers -----
function writeJson(relPath, obj) {
  const abs = path.join(SITE_ROOT, relPath);
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  return abs;
}

function pageEnvelope({ path: urlPath, template, title, description, ogImage, sections }) {
  return {
    path: urlPath,
    template,
    lang: 'sr',
    meta: {
      title,
      description,
      ogImage: ogImage || 'https://gardinovacki.com/wp-content/uploads/2020/04/Sitedemo.jpg',
      canonical: urlPath
    },
    sections,
    globalSections: ['header', 'contact-form-section', 'footer']
  };
}

// Filter & cap image arrays from data/extract-summary.json
// Excludes: logo, branding, and the photographer portrait (those aren't gallery content).
const NON_GALLERY = /Gardinovacki-logo-transparent|Svetozar-Gardinovacki/i;
function galleryImagesFor(url, cap = 15) {
  const page = byUrl[url];
  if (!page) return [];
  return page.images
    .filter(src => !NON_GALLERY.test(src))
    .slice(0, cap);
}

// Couple-name pretty-printer for portfolio slugs.
// e.g. "aleksandar-jovana" -> "Jovana & Aleksandar"  (order matches the live page titles)
// We pull from the crawled .md `title` field when available, falling back to the slug.
function coupleTitleFromUrl(url) {
  const page = byUrl[url];
  if (page && page.title) {
    const t = page.title.split('|')[0].trim();
    if (t) return t;
  }
  // fallback: slug -> title-case
  return url.split('/').filter(Boolean).pop()
    .split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' & ');
}

// Pull og:image from a page (cover photo); fall back to first non-branding image.
function coverImageFor(url) {
  const page = byUrl[url];
  if (!page) return null;
  // page.images[0] is usually the logo; find the first non-branding one
  return page.images.find(src => !NON_GALLERY.test(src)) || null;
}

// ----- shared section builders -----
function standardBanner({ title, subtitle, breadcrumbs, image, alt }) {
  return {
    component: 'standard-banner',
    props: {
      backgroundImage: { src: image, alt: alt || title },
      title,
      ...(subtitle ? { subtitle } : {}),
      breadcrumbs
    }
  };
}

function introText({ heading, body, image, cta }) {
  const props = { body };
  if (heading) props.heading = heading;
  if (image)   props.image = image;
  if (cta)     props.cta = cta;
  return { component: 'intro-text', props };
}

// ----- T1: HOMEPAGE -----
function buildHome() {
  // hero slideshow images sourced from the live homepage crawl
  const heroImages = byUrl['https://gardinovacki.com/']
    ? byUrl['https://gardinovacki.com/'].images.filter(src =>
        /IMG_4880|IMG_7368|IMG_9655|sanjaigor|IMG_4820/.test(src))
    : [];

  const sections = [
    {
      component: 'carousel-hero-banner',
      props: {
        slides: [
          { image: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_4880-scaled.jpg',     alt: 'Mladenci u prirodi' },
          { image: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_7368_1-1-scaled.jpg', alt: 'Detalj sa venčanja' },
          { image: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_9655_1_1-scaled.jpg', alt: 'Portret mladenaca' },
          { image: 'https://gardinovacki.com/wp-content/uploads/2020/04/sanjaigor.jpg',           alt: 'Sanja i Igor' },
          { image: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_4820-scaled.jpg',     alt: 'Mladenci u portretu' }
        ],
        headline: 'Fotografije koje pričaju priče',
        intro: 'Venčanja i fine-art fotografija iz Srbije — sačuvajmo najlepše trenutke vašeg najvažnijeg dana.',
        ctas: [
          { label: 'Istraži usluge', url: '/usluge/', variant: 'primary'   },
          { label: 'Istraži pakete', url: '/paketi/', variant: 'secondary' }
        ]
      }
    },
    introText({
      heading: 'Ćao, dobrodošli na moj sajt!',
      body: [
        'Kao fine-art fotograf, trudim se da pomognem ljudima da sačuvaju uspomene na svoje posebne trenutke, bilo to venčanje, veridba ili porodični trenuci sa voljenima.',
        'Hajde da napravimo fotografije koje će pričati priče i ispuniti vaše srce emocijama u predstojećim godinama…'
      ],
      image: {
        src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Svetozar-Gardinovacki.jpg',
        alt: 'Svetozar Gardinovački',
        position: 'right'
      },
      cta: { label: 'Pročitaj više', url: '/o-meni/', variant: 'primary' }
    }),
    {
      component: 'cards',
      props: {
        heading: 'Usluge',
        variant: 'services',
        cards: [
          {
            image: 'https://gardinovacki.com/wp-content/uploads/2020/05/gold-paket-web.jpg',
            alt: 'Venčanja',
            title: 'Venčanja',
            description: 'Fotografije koje hvataju emociju, ne pozu — od priprema do prvog plesa.',
            cta: { label: 'Istraži', url: '/usluge/vencanja/', variant: 'primary' }
          },
          {
            image: 'https://gardinovacki.com/wp-content/uploads/2020/04/Vida13-scaled.jpg',
            alt: 'Rođendani i ostalo',
            title: 'Rođendani i ostalo',
            description: 'Porodice, krštenja, slave i intimne proslave — sva važna okupljanja.',
            cta: { label: 'Istraži', url: '/usluge/rodjendani-i-ostalo/', variant: 'primary' }
          },
          {
            image: 'https://gardinovacki.com/wp-content/uploads/2021/02/IMG_7049-scaled.jpg',
            alt: 'Video',
            title: 'Video',
            description: 'Filmovi i kratki spotovi koji ožive vaš dan.',
            cta: { label: 'Istraži', url: '/usluge/video/', variant: 'primary' }
          }
        ]
      }
    },
    {
      component: 'cards',
      props: {
        heading: 'Paketi',
        intro: 'Izaberite paket koji najbolje odgovara vašem događaju.',
        variant: 'packages',
        cards: PACKAGES.map(p => ({
          image: p.coverImage,
          alt: `Paket ${p.title}`,
          title: p.title,
          description: p.summary,
          cta: { label: 'Pogledaj paket', url: `/paketi/${p.slug}/`, variant: 'primary' }
        }))
      }
    },
    {
      component: 'instagram-feed',
      props: {
        heading: 'Poslednje sa instagrama',
        handle: 'gardinovacki_weddings',
        postCount: 8,
        layout: 'masonry',
        profileUrl: 'https://www.instagram.com/gardinovacki_weddings/'
      }
    }
  ];

  return pageEnvelope({
    path: '/',
    template: 'T1-homepage',
    title: 'Gardinovački — Venčanja i fine art fotografija',
    description: 'Fotograf venčanja i fine art fotografije iz Srbije. Sačuvajte najlepše trenutke vašeg najvažnijeg dana.',
    sections
  });
}

// ----- T2: SERVICES LANDING -----
function buildServicesLanding() {
  return pageEnvelope({
    path: '/usluge/',
    template: 'T2-services-landing',
    title: 'Usluge — Gardinovački',
    description: 'Venčanja, rođendani i ostali događaji, video — pregled svih fotografskih usluga.',
    sections: [
      standardBanner({
        title: 'Usluge',
        subtitle: 'Šta sve mogu da uradim za vaš dan',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Usluge',  url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_0716_1-COVER-1024x683.jpg',
        alt: 'Detalj sa venčanja'
      }),
      introText({
        heading: 'Svaka priča zaslužuje da bude ispričana',
        body: [
          'Od kamernih porodičnih okupljanja do velikih višednevnih venčanja — pristup je uvek isti: hvatam emociju, ne pozu.',
          'Ispod su tri glavne usluge. Svaka ima posebnu stranicu sa primerima i detaljima.'
        ]
      }),
      {
        component: 'service-carousel-gallery',
        props: {
          heading: 'Venčanja',
          intro: 'Najsvežiji radovi iz portfolija venčanja.',
          images: [
            { src: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_8863-COVER_1-1024x683.jpg', alt: 'Tijana i Luka' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_1832-COVER_1-1024x683.jpg', alt: 'Jovana i Aleksandar' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_8809-COVER-1024x683.jpg',   alt: 'Anica i Miroslav' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2021/02/cover-1024x683.jpg',            alt: 'Kristina i Zoran' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Sanja-Bojan55-1024x597.jpg',    alt: 'Sanja i Bojan' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Mirjana-Ivan41-1024x683.jpg',   alt: 'Mirjana i Ivan' }
          ],
          cta: { label: 'Saznaj više o venčanjima', url: '/usluge/vencanja/', variant: 'primary' }
        }
      },
      {
        component: 'service-carousel-gallery',
        props: {
          heading: 'Rođendani i ostalo',
          intro: 'Krštenja, rođendani, slave i intimne porodične proslave.',
          images: [
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Vida34-1024x683.jpg',    alt: 'Vida' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Uros26-1024x683.jpg',    alt: 'Uroš' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Una14-1024x683.jpg',     alt: 'Una' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Mateja26-1024x683.jpg',  alt: 'Mateja' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Dunja19-1024x683.jpg',   alt: 'Dunja' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/05/Spi-Georg11-1024x683.jpg', alt: 'Spi & Georg' }
          ],
          cta: { label: 'Saznaj više o rođendanima', url: '/usluge/rodjendani-i-ostalo/', variant: 'primary' }
        }
      },
      {
        component: 'service-carousel-gallery',
        props: {
          heading: 'Video',
          intro: 'Filmovi i kratki spotovi sa vaših događaja.',
          images: [
            { src: 'https://gardinovacki.com/wp-content/uploads/2021/02/IMG_7049-scaled.jpg', alt: 'Sa snimanja' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_4880-scaled.jpg', alt: 'Mladenci u prirodi' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_4820-scaled.jpg', alt: 'Mladenci u portretu' }
          ],
          cta: { label: 'Saznaj više o videu', url: '/usluge/video/', variant: 'primary' }
        }
      }
    ]
  });
}

// ----- T3: SERVICE -----
function buildServiceVencanja() {
  return pageEnvelope({
    path: '/usluge/vencanja/',
    template: 'T3-service',
    title: 'Venčanja — Gardinovački',
    description: 'Fotografisanje venčanja: od priprema do prvog plesa, fotografije koje hvataju emociju.',
    sections: [
      standardBanner({
        title: 'Venčanja',
        subtitle: 'Vaš najvažniji dan, ispričan kroz fotografije',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Usluge',  url: '/usluge/' },
          { label: 'Venčanja', url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_8863-COVER_1-1024x683.jpg',
        alt: 'Mladenci u portretu'
      }),
      introText({
        heading: 'Pristup',
        body: [
          'Venčanja pratim od ranih jutarnjih priprema do poslednje pesme uveče. Cilj je da fotografije izgledaju prirodno — bez prinudnih poza i bez ponavljanja iste slike u 30 varijacija.',
          'Radimo zajedno: pre venčanja se vidimo da prođemo plan dana, da se upoznamo i da znate da ću tu biti — ne kao stranac sa kamerom, već kao deo tima koji vam je tog dana potreban.'
        ]
      }),
      {
        component: 'service-carousel-gallery',
        props: {
          heading: 'Iz portfolija',
          intro: 'Nekoliko nedavnih venčanja.',
          images: [
            { src: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_8863-COVER_1-1024x683.jpg', alt: 'Tijana i Luka' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_1832-COVER_1-1024x683.jpg', alt: 'Jovana i Aleksandar' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_8809-COVER-1024x683.jpg',   alt: 'Anica i Miroslav' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2021/02/cover-1024x683.jpg',            alt: 'Kristina i Zoran' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Mirjana-Ivan41-1024x683.jpg',   alt: 'Mirjana i Ivan' },
            { src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Sanja-Matija37-1024x683.jpg',   alt: 'Sanja i Matija' }
          ],
          cta: { label: 'Pogledaj galerije venčanja', url: '/galerija/tijana-luka/', variant: 'primary' }
        }
      },
      {
        component: 'media-gallery',
        props: {
          heading: 'Sve galerije venčanja',
          layout: 'grid',
          items: WEDDING_GALLERIES.map(g => ({
            type: 'image',
            src: g.cover,
            alt: g.title,
            title: g.title,
            cta: { label: 'Pogledaj galeriju', url: `/galerija/${g.slug}/` }
          }))
        }
      }
    ]
  });
}

function buildServiceRodjendani() {
  return pageEnvelope({
    path: '/usluge/rodjendani-i-ostalo/',
    template: 'T3-service',
    title: 'Rođendani i ostalo — Gardinovački',
    description: 'Krštenja, rođendani, slave i intimne porodične proslave.',
    sections: [
      standardBanner({
        title: 'Rođendani i ostalo',
        subtitle: 'Sve što se ne uklapa pod "venčanje" — i zaslužuje da se zapamti',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Usluge',  url: '/usluge/' },
          { label: 'Rođendani i ostalo', url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2020/04/Vida34-1024x683.jpg',
        alt: 'Sa rođendanske proslave'
      }),
      introText({
        heading: 'Porodična okupljanja zaslužuju isti pristup',
        body: [
          'Krštenja, prvi rođendani, slave, godišnjice — kratko su, brzo prolaze, a kasnije se ne ponavljaju. Fotografije pomažu da se ne zaborave detalji i emocija.',
          'Stil je isti kao i kod venčanja: bez režije, sa fokusom na ljudima.'
        ]
      }),
      {
        component: 'media-gallery',
        props: {
          heading: 'Iz portfolija',
          layout: 'grid',
          items: BIRTHDAY_GALLERIES.map(g => ({
            type: 'image',
            src: g.cover,
            alt: g.title,
            title: g.title,
            cta: { label: 'Pogledaj galeriju', url: `/galerija/${g.slug}/` }
          }))
        }
      }
    ]
  });
}

function buildServiceVideo() {
  return pageEnvelope({
    path: '/usluge/video/',
    template: 'T3-service',
    title: 'Video — Gardinovački',
    description: 'Filmovi i kratki spotovi sa venčanja i porodičnih događaja.',
    sections: [
      standardBanner({
        title: 'Video',
        subtitle: 'Pokret + zvuk = uspomena drugačijeg kalibra',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Usluge',  url: '/usluge/' },
          { label: 'Video', url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2021/02/IMG_7049-scaled.jpg',
        alt: 'Sa snimanja'
      }),
      introText({
        heading: 'Video kao dopuna fotografiji',
        body: [
          'Kratki spot (3–5 min) za društvene mreže, ili dugačak film (15–25 min) koji prati ceo dan — bilo da je u pitanju venčanje ili druga proslava.',
          'Stil je isti kao i kod fotografija: bez prinudnih kadrova, sa fokusom na prirodne trenutke.'
        ]
      }),
      {
        component: 'media-gallery',
        props: {
          heading: 'Spotovi',
          intro: 'Primere možete pogledati po dogovoru — link na pun spot šaljem na zahtev.',
          layout: 'grid',
          items: [
            {
              type: 'video',
              src: 'https://gardinovacki.com/wp-content/uploads/2021/02/IMG_7049-scaled.jpg',
              videoUrl: '',
              alt: 'Demo spot (placeholder)',
              title: 'Demo spot',
              description: 'Placeholder — aktuelni spotovi se šalju na zahtev. Statički crawl nije uhvatio embed video.'
            }
          ]
        }
      }
    ]
  });
}

// ----- T4: GALLERY -----
function buildGallery(slug) {
  const url = `https://gardinovacki.com/portfolio/${slug}/`;
  const page = byUrl[url];
  if (!page) throw new Error(`No data for portfolio slug: ${slug}`);
  const title = coupleTitleFromUrl(url);
  const cover = coverImageFor(url);
  const images = galleryImagesFor(url, 15);

  return pageEnvelope({
    path: `/galerija/${slug}/`,
    template: 'T4-gallery',
    title: `${title} — Galerija`,
    description: `Fotografije iz galerije ${title}.`,
    ogImage: cover,
    sections: [
      standardBanner({
        title,
        breadcrumbs: [
          { label: 'Početna',  url: '/' },
          { label: 'Galerija', url: '/galerija/tijana-luka/' },
          { label: title, url: '' }
        ],
        image: cover,
        alt: title
      }),
      {
        component: 'media-gallery',
        props: {
          layout: 'masonry',
          items: images.map((src, i) => ({
            type: 'image',
            src,
            alt: `${title} — ${i + 1}`
          }))
        }
      }
    ]
  });
}

// ----- T5: PACKAGES LANDING -----
function buildPackagesLanding() {
  return pageEnvelope({
    path: '/paketi/',
    template: 'T5-packages-landing',
    title: 'Paketi — Gardinovački',
    description: 'Pet paketa fotografisanja i video snimanja: Family, Platinum, Gold, Silver i Mini.',
    sections: [
      standardBanner({
        title: 'Paketi',
        subtitle: 'Pet opcija, jedan pristup',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Paketi',  url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2022/08/family-paket-1024x682.jpg',
        alt: 'Paket Family'
      }),
      introText({
        heading: 'Izaberite paket koji vam odgovara',
        body: [
          'Paketi se razlikuju po obimu fotografisanja, isporukama (online galerija, štampane fotografije, foto knjige) i tome da li je uključen video. Niže je pregled — za detaljan plan kliknite na paket.'
        ]
      }),
      {
        component: 'cards',
        props: {
          heading: 'Svi paketi',
          variant: 'packages',
          cards: PACKAGES.map(p => ({
            image: p.coverImage,
            alt: `Paket ${p.title}`,
            title: p.title,
            description: p.summary,
            cta: { label: 'Pogledaj paket', url: `/paketi/${p.slug}/`, variant: 'primary' }
          }))
        }
      }
    ]
  });
}

// ----- T6: PACKAGE -----
function buildPackage(p) {
  return pageEnvelope({
    path: `/paketi/${p.slug}/`,
    template: 'T6-package',
    title: `Paket ${p.title} — Gardinovački`,
    description: p.summary,
    ogImage: p.coverImage,
    sections: [
      standardBanner({
        title: p.title,
        subtitle: p.tagline,
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Paketi',  url: '/paketi/' },
          { label: p.title, url: '' }
        ],
        image: p.coverImage,
        alt: `Paket ${p.title}`
      }),
      introText({
        heading: `Šta dobijate sa paketom ${p.title}`,
        body: [ p.summary ]
      }),
      {
        component: 'service-carousel-gallery',
        props: {
          heading: 'Primeri',
          intro: 'Nekoliko fotografija u stilu paketa.',
          images: p.sampleImages,
          cta: { label: 'Pogledaj sve galerije', url: '/usluge/vencanja/', variant: 'primary' }
        }
      },
      {
        component: 'numbers',
        props: {
          heading: 'Šta paket uključuje',
          items: p.features.map((label, i) => ({
            number: String(i + 1).padStart(2, '0'),
            label
          }))
        }
      }
    ]
  });
}

// ----- T7: ABOUT -----
function buildAbout() {
  return pageEnvelope({
    path: '/o-meni/',
    template: 'T7-about-me',
    title: 'O meni — Gardinovački',
    description: 'Ćao, ja sam Svetozar — fotograf venčanja i fine art fotografije iz Srbije.',
    ogImage: 'https://gardinovacki.com/wp-content/uploads/2020/04/Svetozar-Gardinovacki.jpg',
    sections: [
      standardBanner({
        title: 'O meni',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'O meni',  url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2020/04/Svetozar-Gardinovacki.jpg',
        alt: 'Svetozar Gardinovački'
      }),
      introText({
        heading: 'Svetozar Gardinovački',
        body: [
          'Ćao, ja sam Svetozar, a vi ste verovatno došli na ovaj sajt kako biste videli moje fotografije. Ali hajde, kad ste već ovde, da čujete moju priču.',
          'Fotografijom se bavim više godina, od svojih studentskih dana, ali i dalje sam ubeđen da se fotografija ne može nikada naučiti i savladati u potpunosti, te da svakog dana, gde god i šta god fotografisao, zapravo učim još jednu dragocenu lekciju.',
          'Jedna od omiljenih rečenica koju sam čuo na početku svoje karijere fotografa glasi: „Za sve u životu postoji druga šansa, osim za prvi put". Kao fotograf, u ovoj rečenici sam pronašao neizmernu motivaciju da konstantno tražim najbolji ugao iz kojeg se vidi taj „prvi put" — bio to prvi poljubac, prvi osmeh, prvi zagrljaj.',
          'Svojom kamerom se trudim da važne i neponovljive trenutke sa vama u glavnoj ulozi zabeležim na način na koji će taj trenutak dobiti neku novu, unikatnu dimenziju. Zahvaljujući sjajnom timu ljudi koji me okružuju, u mogućnosti smo da zadovoljimo skoro sve potrebe naših klijenata — bilo da su u pitanju intimna venčanja sa nekoliko vama najbližih ljudi, pa sve do masovnih višednevnih proslava na različitim lokacijama.',
          'Toliko o meni. Ostatak priče će vam moje fotografije ispričati, a ja bih voleo da čujem nešto i od vas.'
        ],
        image: {
          src: 'https://gardinovacki.com/wp-content/uploads/2020/04/Svetozar-Gardinovacki.jpg',
          alt: 'Svetozar Gardinovački',
          position: 'right'
        },
        cta: { label: 'Javite mi se', url: '/kontakt/', variant: 'primary' }
      }),
      {
        component: 'cards',
        props: {
          heading: 'Šta mogu da uradim za vas',
          variant: 'services',
          cards: [
            {
              image: 'https://gardinovacki.com/wp-content/uploads/2020/05/gold-paket-web.jpg',
              alt: 'Venčanja',
              title: 'Venčanja',
              description: 'Od priprema do prvog plesa.',
              cta: { label: 'Istraži', url: '/usluge/vencanja/', variant: 'primary' }
            },
            {
              image: 'https://gardinovacki.com/wp-content/uploads/2020/04/Vida13-scaled.jpg',
              alt: 'Rođendani i ostalo',
              title: 'Rođendani i ostalo',
              description: 'Krštenja, slave, intimne porodične proslave.',
              cta: { label: 'Istraži', url: '/usluge/rodjendani-i-ostalo/', variant: 'primary' }
            },
            {
              image: 'https://gardinovacki.com/wp-content/uploads/2021/02/IMG_7049-scaled.jpg',
              alt: 'Video',
              title: 'Video',
              description: 'Filmovi i kratki spotovi.',
              cta: { label: 'Istraži', url: '/usluge/video/', variant: 'primary' }
            }
          ]
        }
      }
    ]
  });
}

// ----- T8: CONTACT -----
function buildContact() {
  // Contact page is essentially just the standard banner — the actual form
  // lives in globalSections (contact-form-section is shared bottom CTA).
  return pageEnvelope({
    path: '/kontakt/',
    template: 'T8-contact',
    title: 'Kontakt — Gardinovački',
    description: 'Slobodno me pozovite ili pošaljite poruku — biće mi drago da čujem vašu priču.',
    sections: [
      standardBanner({
        title: 'Kontakt',
        subtitle: 'Pišite mi, čujemo se ubrzo',
        breadcrumbs: [
          { label: 'Početna', url: '/' },
          { label: 'Kontakt', url: '' }
        ],
        image: 'https://gardinovacki.com/wp-content/uploads/2020/04/IMG_4820-scaled.jpg',
        alt: 'Mladenci u portretu'
      }),
      introText({
        heading: 'Slobodno me pozovite',
        body: [
          'Telefon: 060 5500858',
          'Email: gardinovacki@hotmail.com',
          'Formu za upit nalazite niže — popunite što više možete (datum, lokacija, paket koji vas zanima) i odgovaram u roku od 24 časa.'
        ]
      })
    ]
  });
}

// ----- PACKAGES data (sourced from data/pages/sr/paketi.md) -----
const PACKAGES = [
  {
    slug: 'family',
    title: 'Family',
    tagline: 'Najveći paket — fotografije + video + tri foto knjige',
    coverImage: 'https://gardinovacki.com/wp-content/uploads/2022/08/family-paket-1024x682.jpg',
    summary: 'Celodnevno fotografisanje i video snimanje, foto sesija drugog dana, 3×100 štampanih fotografija u drvenoj kutiji, online galerija, tri foto knjige, montaža spota i dugačkog filma.',
    features: [
      'Celodnevno fotografisanje i video snimanje',
      'Foto sesija istog ili drugog dana',
      '3 × 100 štampanih fotografija u drvenoj kutiji',
      'Online galerija sa studijski obrađenim fotografijama',
      'Izrada 3 foto knjige',
      'Montaža spota i dugačkog filma'
    ],
    sampleImages: [
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1929-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1877-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1938-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1948-1024x683.jpg', alt: 'Foto sesija' }
    ]
  },
  {
    slug: 'platinum',
    title: 'Platinum',
    tagline: 'Fotografije + video + foto knjiga',
    coverImage: 'https://gardinovacki.com/wp-content/uploads/2020/05/platinum-paket-web-1024x683.jpg',
    summary: 'Celodnevno fotografisanje i video snimanje, foto sesija, 100 štampanih fotografija u drvenoj kutiji, online galerija, foto knjiga, montaža spota i dugačkog filma.',
    features: [
      'Celodnevno fotografisanje i video snimanje',
      'Foto sesija istog ili drugog dana',
      '100 štampanih fotografija u drvenoj kutiji',
      'Online galerija sa studijski obrađenim fotografijama',
      'Izrada foto knjige',
      'Montaža spota i dugačkog filma'
    ],
    sampleImages: [
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9826_1-Large-1024x683.jpeg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9819_1-Large-1024x683.jpeg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9820_1-Large-1024x683.jpeg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9825_1-Large-1024x683.jpeg', alt: 'Foto sesija' }
    ]
  },
  {
    slug: 'gold',
    title: 'Gold',
    tagline: 'Celodnevne fotografije + foto knjiga',
    coverImage: 'https://gardinovacki.com/wp-content/uploads/2020/05/gold-paket-web-1024x683.jpg',
    summary: 'Celodnevno fotografisanje, foto sesija, 100 štampanih fotografija u drvenoj kutiji, online galerija, foto knjiga.',
    features: [
      'Celodnevno fotografisanje',
      'Foto sesija istog ili drugog dana',
      '100 štampanih fotografija u drvenoj kutiji',
      'Online galerija sa studijski obrađenim fotografijama',
      'Izrada foto knjige'
    ],
    sampleImages: [
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1935-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1921-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1880-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1936-1024x683.jpg', alt: 'Foto sesija' }
    ]
  },
  {
    slug: 'silver',
    title: 'Silver',
    tagline: 'Celodnevne fotografije + foto sesija',
    coverImage: 'https://gardinovacki.com/wp-content/uploads/2020/05/silver-paket-web-1024x683.jpg',
    summary: 'Celodnevno fotografisanje, foto sesija istog dana, 100 štampanih fotografija u drvenoj kutiji, online galerija.',
    features: [
      'Celodnevno fotografisanje',
      'Foto sesija istog dana',
      '100 štampanih fotografija u drvenoj kutiji',
      'Online galerija sa studijski obrađenim fotografijama'
    ],
    sampleImages: [
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1881-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1932-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1926-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1884-1024x683.jpg', alt: 'Foto sesija' }
    ]
  },
  {
    slug: 'mini',
    title: 'Mini',
    tagline: 'Kratko fotografisanje + online galerija',
    coverImage: 'https://gardinovacki.com/wp-content/uploads/2022/08/mini-paket-1024x682.jpg',
    summary: 'Fotografisanje do 3 sata, online galerija sa studijski obrađenim fotografijama.',
    features: [
      'Fotografisanje do 3 sata',
      'Online galerija sa studijski obrađenim fotografijama'
    ],
    sampleImages: [
      { src: 'https://gardinovacki.com/wp-content/uploads/2020/06/IMG_1886-1024x683.jpg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9816_1-Large-1024x683.jpeg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9829_1-Large-1024x683.jpeg', alt: 'Foto sesija' },
      { src: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_9817_1-Large-1024x683.jpeg', alt: 'Foto sesija' }
    ]
  }
];

// ----- Gallery slugs (10 selected for the rebuild) -----
const GALLERY_SLUGS = [
  'tijana-luka',
  'aleksandar-jovana',
  'anica-miroslav',
  'kristina-zoran',
  'milica-srdan',
  'slavica-dejan',
  'sanja-bojan',
  'mirjana-ivan',
  'nevena-miroslav',
  'marina-veljko'
];

// Wedding/birthday cover photos for the service-page media galleries.
// Sourced from the live service pages (events-vencanja.md / events-rodjendani-i-ostalo.md).
const WEDDING_GALLERIES = [
  { slug: 'tijana-luka',       title: 'Tijana & Luka',         cover: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_8863-COVER_1-1024x683.jpg' },
  { slug: 'aleksandar-jovana', title: 'Jovana & Aleksandar',   cover: 'https://gardinovacki.com/wp-content/uploads/2023/02/IMG_1832-COVER_1-1024x683.jpg' },
  { slug: 'anica-miroslav',    title: 'Anica & Miroslav',      cover: 'https://gardinovacki.com/wp-content/uploads/2023/01/IMG_8809-COVER-1024x683.jpg' },
  { slug: 'kristina-zoran',    title: 'Kristina & Zoran',      cover: 'https://gardinovacki.com/wp-content/uploads/2021/02/cover-1024x683.jpg' },
  { slug: 'milica-srdan',      title: 'Milica & Srđan',        cover: 'https://gardinovacki.com/wp-content/uploads/2021/02/cover-1-1024x683.jpg' },
  { slug: 'slavica-dejan',     title: 'Slavica & Dejan',       cover: 'https://gardinovacki.com/wp-content/uploads/2021/02/cover-2-1024x683.jpg' },
  { slug: 'sanja-bojan',       title: 'Sanja & Bojan',         cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Sanja-Bojan55-1024x597.jpg' },
  { slug: 'mirjana-ivan',      title: 'Mirjana & Ivan',        cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Mirjana-Ivan41-1024x683.jpg' },
  { slug: 'nevena-miroslav',   title: 'Nevena & Miroslav',     cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Nevena-Miroslav38-1024x683.jpg' },
  { slug: 'marina-veljko',     title: 'Marina & Veljko',       cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Marina-Veljko12-1024x683.jpg' }
];

const BIRTHDAY_GALLERIES = [
  // Note: these slugs exist in the crawled portfolio data but are NOT among our 10 chosen
  // galleries. The "view gallery" CTA still links to /galerija/<slug>/ — those pages would
  // need to be added in the next round if the link is clicked.
  { slug: 'spi-georg', title: 'Spi & Georg', cover: 'https://gardinovacki.com/wp-content/uploads/2020/05/Spi-Georg11-1024x683.jpg' },
  { slug: 'kriss',     title: 'Kriss',       cover: 'https://gardinovacki.com/wp-content/uploads/2020/05/Kriss9-1024x683.jpg' },
  { slug: 'vojin',     title: 'Vojin',       cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Vojin3-1024x683.jpg' },
  { slug: 'vida',      title: 'Vida',        cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Vida34-1024x683.jpg' },
  { slug: 'uros',      title: 'Uroš',        cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Uros26-1024x683.jpg' },
  { slug: 'una',       title: 'Una',         cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Una14-1024x683.jpg' },
  { slug: 'mateja',    title: 'Mateja',      cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Mateja26-1024x683.jpg' },
  { slug: 'dunja',     title: 'Dunja',       cover: 'https://gardinovacki.com/wp-content/uploads/2020/04/Dunja19-1024x683.jpg' }
];

// ----- Run -----
const written = [];

function emit(relPath, json) {
  writeJson(relPath, json);
  written.push({ path: json.path, template: json.template, file: relPath });
  console.log(`  ${relPath}`);
}

console.log('Generating site/pages/**...');
emit('pages/home.json',                       buildHome());
emit('pages/usluge.json',                     buildServicesLanding());
emit('pages/usluge/vencanja.json',            buildServiceVencanja());
emit('pages/usluge/rodjendani-i-ostalo.json', buildServiceRodjendani());
emit('pages/usluge/video.json',               buildServiceVideo());

for (const slug of GALLERY_SLUGS) {
  emit(`pages/galerija/${slug}.json`, buildGallery(slug));
}

emit('pages/paketi.json', buildPackagesLanding());
for (const p of PACKAGES) emit(`pages/paketi/${p.slug}.json`, buildPackage(p));

emit('pages/o-meni.json',  buildAbout());
emit('pages/kontakt.json', buildContact());

// ----- sitemap.json -----
const sitemap = {
  generated: new Date().toISOString(),
  lang: 'sr',
  totalPages: written.length,
  byTemplate: written.reduce((acc, p) => { acc[p.template] = (acc[p.template] || 0) + 1; return acc; }, {}),
  pages: written
};
writeJson('sitemap.json', sitemap);
console.log(`  sitemap.json`);

console.log(`\nWrote ${written.length} page files + sitemap.json`);
