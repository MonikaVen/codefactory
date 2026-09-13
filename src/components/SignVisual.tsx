import type { RoadSign } from '../data/types';

interface Props {
  sign: RoadSign;
  className?: string;
}

/** Accurate Vienna Convention / Lithuanian KET–style sign faces. */
export function SignVisual({ sign, className = '' }: Props) {
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
          letterSpacing="0.5"
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
    // Yield / give way — inverted triangle
    if (id === 's-duoti-kelia') {
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
        {id === 's-bendras-pavojus' && (
          <text x="50" y="72" textAnchor="middle" fontSize="36" fontWeight="800" fill="#1a1a1a">
            !
          </text>
        )}
        {id === 's-iskeistas' && (
          <path d="M22 72 L50 36 L78 72 Z" fill="#1a1a1a" />
        )}
        {id === 's-pestieji' && (
          <>
            <circle cx="44" cy="38" r="4.5" fill="#1a1a1a" />
            <path
              d="M38 46h12l-1.5 14h-3l-1 14h-4l-1-14h-3z"
              fill="#1a1a1a"
            />
            <circle cx="58" cy="44" r="3.5" fill="#1a1a1a" />
            <path d="M54 50h9l-1 10h-2.5l-.8 10h-3.2z" fill="#1a1a1a" />
          </>
        )}
        {id === 's-pereja' && (
          <>
            <rect x="26" y="44" width="7" height="26" fill="#1a1a1a" />
            <rect x="40" y="44" width="7" height="26" fill="#1a1a1a" />
            <rect x="54" y="44" width="7" height="26" fill="#1a1a1a" />
            <circle cx="68" cy="40" r="4" fill="#1a1a1a" />
            <path d="M63 47h10v14h-3.2v12h-4.2V61H63z" fill="#1a1a1a" />
          </>
        )}
        {id === 's-vaikai' && (
          <>
            <circle cx="40" cy="38" r="4" fill="#1a1a1a" />
            <circle cx="58" cy="36" r="4" fill="#1a1a1a" />
            <path d="M33 46h12l-1.5 12h-3l-1 14h-4.5zm16-2h12l-1 14h-3l-1 12h-4.5z" fill="#1a1a1a" />
          </>
        )}
        {id === 's-dviratininkai' && (
          <>
            <circle cx="34" cy="64" r="11" fill="none" stroke="#1a1a1a" strokeWidth="3.2" />
            <circle cx="66" cy="64" r="11" fill="none" stroke="#1a1a1a" strokeWidth="3.2" />
            <path
              d="M34 64 L48 40 L66 64 M48 40 V54 M42 54 H56"
              stroke="#1a1a1a"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="52" cy="36" r="3.2" fill="#1a1a1a" />
          </>
        )}
        {!['s-bendras-pavojus', 's-iskeistas', 's-pestieji', 's-pereja', 's-vaikai', 's-dviratininkai'].includes(
          id,
        ) && (
          <text x="50" y="72" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1a1a1a">
            !
          </text>
        )}
      </svg>
    );
  }

  if (sign.shape === 'circle-red') {
    // No stopping / no parking use blue disc + red rim (Vienna C18/C19)
    if (id === 's-sustoti-draudziama') {
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="#0057b8" stroke="#c8102e" strokeWidth="8" />
          <line x1="24" y1="24" x2="76" y2="76" stroke="#c8102e" strokeWidth="8" strokeLinecap="round" />
          <line x1="76" y1="24" x2="24" y2="76" stroke="#c8102e" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );
    }
    if (id === 's-stoveti-draudziama') {
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
        {id === 's-ivaziuoti-draudziama' && (
          <rect x="18" y="42" width="64" height="16" rx="1" fill="#c8102e" />
        )}
        {id === 's-eismas-draudziamas' && null}
        {id === 's-greicio-apribojimas' && (
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
        {id === 's-lenkti-draudziama' && (
          <>
            {/* Two cars side-by-side: black (left) + red (right) — Vienna 3.20 */}
            <g transform="translate(18,42)">
              <rect x="0" y="8" width="26" height="14" rx="2" fill="#1a1a1a" />
              <rect x="4" y="2" width="16" height="8" rx="1.5" fill="#1a1a1a" />
            </g>
            <g transform="translate(52,28)">
              <rect x="0" y="8" width="26" height="14" rx="2" fill="#c8102e" />
              <rect x="4" y="2" width="16" height="8" rx="1.5" fill="#c8102e" />
            </g>
          </>
        )}
        {!['s-ivaziuoti-draudziama', 's-eismas-draudziamas', 's-greicio-apribojimas', 's-lenkti-draudziama'].includes(
          id,
        ) && <line x1="22" y1="78" x2="78" y2="22" stroke="#c8102e" strokeWidth="7" strokeLinecap="round" />}
      </svg>
    );
  }

  if (sign.shape === 'circle-blue') {
    return (
      <svg className={className} viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="#0057b8" />
        {id === 's-judeti-desinen' && (
          <path
            d="M26 50h40M52 30l20 20-20 20"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {id === 's-judeti-tiesiai' && (
          <path
            d="M50 78V26M32 44l18-18 18 18"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {id === 's-apvaziuoti-desine' && (
          <path
            d="M32 74V42c0-12 10-18 20-18s18 8 18 18v8"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        {id === 's-ratus-eismas' && (
          <>
            <circle cx="50" cy="50" r="16" fill="none" stroke="#fff" strokeWidth="5" />
            <path
              d="M50 28l7 11h-14zm22 22l-11 7v-14zM50 72l-7-11h14zM28 50l11-7v14z"
              fill="#fff"
            />
          </>
        )}
        {id === 's-dviraciu-takas' && (
          <>
            <circle cx="34" cy="62" r="11" fill="none" stroke="#fff" strokeWidth="3.2" />
            <circle cx="66" cy="62" r="11" fill="none" stroke="#fff" strokeWidth="3.2" />
            <path
              d="M34 62 L48 36 L66 62 M48 36 V52 M42 52 H56"
              stroke="#fff"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="52" cy="32" r="3" fill="#fff" />
          </>
        )}
        {id === 's-pesciuju-takas' && (
          <>
            <circle cx="50" cy="30" r="6" fill="#fff" />
            <path d="M42 40h16l-2 18h-4l-1.5 20h-5.5L44 58h-4z" fill="#fff" />
          </>
        )}
        {!['s-judeti-desinen', 's-judeti-tiesiai', 's-apvaziuoti-desine', 's-ratus-eismas', 's-dviraciu-takas', 's-pesciuju-takas'].includes(
          id,
        ) && (
          <path
            d="M42 28v44M42 28l24 16L42 58"
            fill="none"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    );
  }

  // rectangle / info / supplementary
  const isSupplementary = sign.category === 'papildomi';
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <rect
        x={isSupplementary ? 18 : 10}
        y={isSupplementary ? 28 : 16}
        width={isSupplementary ? 64 : 80}
        height={isSupplementary ? 44 : 68}
        rx="3"
        fill={isSupplementary ? '#fff' : '#0057b8'}
        stroke={isSupplementary ? '#1a1a1a' : 'none'}
        strokeWidth="3"
      />
      {id === 's-automagistrale' && (
        <>
          {/* White motorway bridge / dual carriageway symbol */}
          <path
            d="M22 70 L38 28h24L78 70H66L54 40 42 70Z"
            fill="#fff"
          />
          <rect x="46" y="48" width="8" height="5" fill="#0057b8" />
        </>
      )}
      {id === 's-gyvenamoji' && (
        <>
          <rect x="24" y="32" width="28" height="26" fill="#fff" />
          <polygon points="24,32 38,20 52,32" fill="#fff" />
          <rect x="58" y="42" width="16" height="16" fill="#fff" />
          <circle cx="32" cy="70" r="5" fill="#1a1a1a" />
          <circle cx="66" cy="70" r="5" fill="#1a1a1a" />
          <circle cx="38" cy="40" r="3" fill="#0057b8" />
          <path d="M34 46h8v10h-3v8h-4v-8h-3z" fill="#0057b8" />
        </>
      )}
      {id === 's-pereja-info' && (
        <>
          <rect x="24" y="26" width="16" height="48" fill="#fff" />
          <rect x="60" y="26" width="16" height="48" fill="#fff" />
          <circle cx="50" cy="34" r="5" fill="#fff" />
          <path d="M44 42h12v18h-4v16h-5V60h-4z" fill="#fff" />
        </>
      )}
      {id === 's-stovejimo' && (
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fontSize="42"
          fontWeight="800"
          fill="#fff"
          fontFamily="Arial Black, sans-serif"
        >
          P
        </text>
      )}
      {isSupplementary && (
        <text x="50" y="56" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1a1a1a">
          {sign.code === '801' ? '100 m' : sign.code === '805' ? 'zona' : sign.code}
        </text>
      )}
    </svg>
  );
}
