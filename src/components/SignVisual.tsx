import { useState } from 'react';
import { signImageSrc } from '../data/signs';
import type { RoadSign } from '../data/types';

interface Props {
  sign: RoadSign;
  className?: string;
}

/** Prefer official KET PDF crops; fall back to SVG for custom/user signs. */
export function SignVisual({ sign, className = '' }: Props) {
  const src = signImageSrc(sign);
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        className={`sign-photo ${className}`.trim()}
        src={src}
        alt={`${sign.code} ${sign.name}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return <SignSvgFallback sign={sign} className={className} />;
}

/** Compact SVG fallback for user-added signs without a PDF crop. */
function SignSvgFallback({ sign, className = '' }: Props) {
  const id = sign.id;

  if (sign.shape === 'octagon' || id === 's-stop') {
    return (
      <svg className={className} viewBox="0 0 100 100" aria-hidden>
        <polygon
          points="30.5,7 69.5,7 93,30.5 93,69.5 69.5,93 30.5,93 7,69.5 7,30.5"
          fill="#c8102e"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill="#fff"
          fontFamily="Arial Black, Arial, sans-serif"
        >
          STOP
        </text>
      </svg>
    );
  }

  if (sign.shape === 'diamond' || id.startsWith('s-pagrindinis')) {
    const end = id.includes('pab');
    return (
      <svg className={className} viewBox="0 0 100 100" aria-hidden>
        <polygon
          points="50,8 92,50 50,92 8,50"
          fill={end ? '#fff' : '#f5c518'}
          stroke="#1a1a1a"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {end && (
          <>
            <line x1="28" y1="28" x2="72" y2="72" stroke="#1a1a1a" strokeWidth="4.5" />
            <line x1="36" y1="24" x2="80" y2="68" stroke="#1a1a1a" strokeWidth="4.5" />
            <line x1="20" y1="32" x2="64" y2="76" stroke="#1a1a1a" strokeWidth="4.5" />
          </>
        )}
      </svg>
    );
  }

  if (sign.shape === 'triangle') {
    if (id === 's-duoti-kelia' || sign.code === '203') {
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <polygon
            points="50,90 8,14 92,14"
            fill="#fff"
            stroke="#c8102e"
            strokeWidth="9"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg className={className} viewBox="0 0 100 100" aria-hidden>
        <polygon
          points="50,8 94,88 6,88"
          fill="#fff"
          stroke="#c8102e"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <text x="50" y="72" textAnchor="middle" fontSize="32" fontWeight="800" fill="#1a1a1a">
          !
        </text>
      </svg>
    );
  }

  if (sign.shape === 'circle-red') {
    if (id === 's-sustoti-draudziama' || sign.code === '332') {
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="#0057b8" stroke="#c8102e" strokeWidth="8" />
          <line x1="24" y1="24" x2="76" y2="76" stroke="#c8102e" strokeWidth="8" strokeLinecap="round" />
          <line x1="76" y1="24" x2="24" y2="76" stroke="#c8102e" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );
    }
    if (id === 's-stoveti-draudziama' || sign.code === '333') {
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="#0057b8" stroke="#c8102e" strokeWidth="8" />
          <line x1="24" y1="24" x2="76" y2="76" stroke="#c8102e" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg className={className} viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="#fff" stroke="#c8102e" strokeWidth="8" />
        {(id === 's-ivaziuoti-draudziama' || sign.code === '301') && (
          <rect x="18" y="42" width="64" height="16" rx="1" fill="#c8102e" />
        )}
        {(id === 's-greicio-apribojimas' || sign.code === '329') && (
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontSize="34"
            fontWeight="800"
            fill="#1a1a1a"
            fontFamily="Arial Black, Arial, sans-serif"
          >
            50
          </text>
        )}
      </svg>
    );
  }

  if (sign.shape === 'circle-blue') {
    return (
      <svg className={className} viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="#0057b8" />
        <path
          d="M42 28v44M42 28l24 16L42 58"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <rect x="10" y="20" width="80" height="60" rx="4" fill="#0057b8" />
      <text x="50" y="56" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
        {sign.code}
      </text>
    </svg>
  );
}
