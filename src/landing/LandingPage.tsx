import { useEffect, useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/SiteHeader';
import { Logo } from '../components/Logo';
import {
  ArrowIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  ScanIcon,
} from '../components/Icons';
import { useI18n } from '../i18n/I18nProvider';

const SIZE = 9;

function isFinder(r: number, c: number, top: number, start: number) {
  return (
    r >= top && r < top + 3 && c >= start && c < start + 3 && !(r === top + 1 && c === start + 1)
  );
}

const CELLS = Array.from({ length: SIZE * SIZE }, (_, i) => {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  return (
    isFinder(r, c, 0, 0) ||
    isFinder(r, c, 0, SIZE - 3) ||
    isFinder(r, c, SIZE - 3, 0) ||
    (r * 5 + c * 3) % 7 < 3
  );
});

function QrGlyph() {
  return (
    <div
      className="grid aspect-square w-24 gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {CELLS.map((on, i) => (
        <span key={i} className={on ? 'rounded-[2px] bg-ink' : ''} />
      ))}
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function trackPointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'touch') return;

    const surface = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--pointer-x', `${clientX - rect.left}px`);
      surface.style.setProperty('--pointer-y', `${clientY - rect.top}px`);
    });
  }

  return (
    <section
      className="hero-surface text-sand"
      onPointerEnter={(event) => {
        event.currentTarget.dataset.pointer = 'on';
        trackPointer(event);
      }}
      onPointerMove={trackPointer}
      onPointerLeave={(event) => {
        event.currentTarget.dataset.pointer = 'off';
      }}
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-sand/25 bg-sand/10 px-3 py-1 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-5 text-balance text-4xl font-normal leading-[1.3] sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-sand/80 sm:text-lg">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn btn-primary">
              {t('hero.ctaPrimary')}
              <ArrowIcon className="size-4 rtl:rotate-180" />
            </Link>
            <a href="#how" className="btn btn-ghost">
              {t('hero.ctaSecondary')}
            </a>
          </div>
          <p className="mt-6 text-sm text-sand/70">{t('hero.note')}</p>
        </div>

        <figure className="glass rise rounded-2xl p-5" style={{ animationDelay: '120ms' }}>
          <figcaption className="text-xs text-sand/75">{t('hero.sampleLabel')}</figcaption>
          <div className="mt-4 flex items-center gap-4">
            <div className="rounded-xl bg-white p-2.5 text-ink">
              <QrGlyph />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{t('hero.sampleTitle')}</p>
              <p className="mt-1 text-sm text-sand/70">{t('hero.sampleMeta')}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                <CheckIcon className="size-3.5 text-gold" />
                {t('hero.sampleStatus')}
              </p>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: '01', title: t('how.step1.title'), body: t('how.step1.body') },
    { n: '02', title: t('how.step2.title'), body: t('how.step2.body') },
    { n: '03', title: t('how.step3.title'), body: t('how.step3.body') },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-20">
      <h2 className="max-w-2xl text-2xl font-normal sm:text-3xl">{t('how.title')}</h2>
      <p className="mt-3 max-w-2xl text-ink-soft">{t('how.lead')}</p>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.n} className="border-t border-ink/15 pt-5">
            <span className="text-sm font-semibold text-gold-deep" dir="ltr">
              {step.n}
            </span>
            <h3 className="mt-2 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Features() {
  const { t } = useI18n();
  const items = [
    { Icon: ScanIcon, title: t('features.scan.title'), body: t('features.scan.body') },
    { Icon: ClockIcon, title: t('features.clock.title'), body: t('features.clock.body') },
    { Icon: ChartIcon, title: t('features.analytics.title'), body: t('features.analytics.body') },
    { Icon: DownloadIcon, title: t('features.export.title'), body: t('features.export.body') },
  ];
  return (
    <section id="features" className="scroll-mt-20 border-y border-ink/10 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className="max-w-2xl text-2xl font-normal sm:text-3xl">{t('features.title')}</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">{t('features.lead')}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map(({ Icon, title, body }) => (
            <div key={title} className="card p-6">
              <Icon className="size-6 text-jade" />
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const { t } = useI18n();
  return (
    <section id="roles" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-20">
      <h2 className="text-2xl font-normal sm:text-3xl">{t('roles.title')}</h2>
      <p className="mt-3 max-w-2xl text-ink-soft">{t('roles.lead')}</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-medium">{t('roles.provider.title')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t('roles.provider.body')}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-medium">{t('roles.participant.title')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t('roles.participant.body')}</p>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="rounded-3xl bg-ink px-6 py-12 text-center text-sand sm:px-12">
        <h2 className="text-2xl font-normal sm:text-3xl">{t('cta.title')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sand/75">{t('cta.body')}</p>
        <Link to="/signup" className="btn btn-primary mt-8">
          {t('cta.button')}
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Logo />
        <div className="mt-6 flex flex-col gap-2 border-t border-ink/10 pt-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.note')}</p>
          <p>
            © {new Date().getFullYear()} {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-dvh">
      <a href="#main" className="skip-link">
        {t('nav.skip')}
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Features />
        <Roles />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
