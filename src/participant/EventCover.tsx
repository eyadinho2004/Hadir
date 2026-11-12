import {
  CalendarIcon,
  ConferenceIcon,
  LectureIcon,
  TrainingIcon,
  WorkshopIcon,
} from '../components/Icons';

const covers: Record<string, { background: string; Icon: typeof WorkshopIcon }> = {
  ورشة: {
    background: 'linear-gradient(135deg, #0e4f41 0%, #166b57 55%, #2f8f74 100%)',
    Icon: WorkshopIcon,
  },
  محاضرة: {
    background: 'linear-gradient(135deg, #0f1c18 0%, #33413b 60%, #166b57 100%)',
    Icon: LectureIcon,
  },
  'برنامج تدريبي': {
    background: 'linear-gradient(135deg, #166b57 0%, #0e4f41 45%, #0f1c18 100%)',
    Icon: TrainingIcon,
  },
  مؤتمر: {
    background: 'linear-gradient(135deg, #0f1c18 0%, #0e4f41 50%, #c08a2e 135%)',
    Icon: ConferenceIcon,
  },
};

const fallback = {
  background: 'linear-gradient(135deg, #0e4f41 0%, #166b57 100%)',
  Icon: CalendarIcon,
};

export function EventCover({ category, className = '' }: { category: string; className?: string }) {
  const { background, Icon } = covers[category] ?? fallback;

  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundImage: background }}
    >
      <span className="absolute -end-12 -top-16 size-48 rounded-full border border-white/20" />
      <span className="absolute -start-16 -bottom-12 size-56 rounded-full border border-white/10" />
      <span
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.55) 0 1px, transparent 1px 16px)',
        }}
      />
      <span className="absolute start-5 top-4 h-1 w-12 rounded-full bg-gold/80" />
      <Icon className="absolute end-5 bottom-4 size-24 text-white/25" />
    </div>
  );
}
