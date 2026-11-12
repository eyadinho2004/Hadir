import type { CSSProperties } from 'react';

const BRACKET =
  'M70 0H201Q225 0 225 24V56Q225 80 201 80H92Q80 80 80 92V195Q80 219 56 219H24Q0 219 0 195V70Q0 0 70 0Z';

export function BrandMark({
  className,
  tone = 'navy',
  animated = false,
}: {
  className?: string;
  tone?: 'navy' | 'white';
  animated?: boolean;
}) {
  const ink = tone === 'white' ? '#FFFFFF' : '#172845';
  const green = tone === 'white' ? '#00D4AE' : '#00AF93';

  return (
    <svg
      viewBox="0 0 535 519"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ '--hadir-green': green } as CSSProperties}
    >
      <path fill={ink} d={BRACKET} />
      <path fill={ink} transform="translate(535 0) scale(-1 1)" d={BRACKET} />
      <path fill={ink} transform="translate(0 519) scale(1 -1)" d={BRACKET} />
      {animated ? (
        <>
          <rect className="hadir-beam" x="70" y="0" width="395" height="14" rx="7" />
          <polyline
            className="hadir-check"
            pathLength="100"
            points="303,407 368,472 502,325"
          />
        </>
      ) : (
        <polyline
          points="303,407 368,472 502,325"
          fill="none"
          stroke={green}
          strokeWidth="74"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
