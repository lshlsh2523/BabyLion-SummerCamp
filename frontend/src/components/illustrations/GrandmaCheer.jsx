import './illustrations.css';

/** P6 · 만세 부르는 할머니 + 색종이 (시안 ⑧ 이식) */
const CONFETTI = [
  { style: { top: -14, left: 6,  width: 10, height: 14, background: '#FFD93B', borderRadius: 2,    animationDuration: '1.6s', animationDelay: '0s' } },
  { style: { top: -20, left: 70, width: 9,  height: 9,  background: '#C9F14E', borderRadius: '50%', animationDuration: '1.9s', animationDelay: '0.4s' } },
  { style: { top: -12, right: 10, width: 10, height: 13, background: '#8BD543', borderRadius: 2,    animationDuration: '1.7s', animationDelay: '0.8s' } },
  { style: { top: -24, left: 36, width: 8,  height: 8,  background: '#FFB84D', borderRadius: '50%', animationDuration: '2.1s', animationDelay: '1.1s' } },
  { style: { top: -18, right: 44, width: 9,  height: 12, background: '#FFE97A', borderRadius: 2,    animationDuration: '1.8s', animationDelay: '0.6s' } },
];

export default function GrandmaCheer() {
  return (
    <div className="illust-cheer">
      <svg viewBox="0 0 130 125" width="176" height="169" role="img" aria-label="만세를 부르는 할머니">
        <ellipse cx="65" cy="119" rx="42" ry="6" fill="#EDF7DF" />
        <path d="M 35 118 Q 32 79 65 76 Q 98 79 95 118 Z" fill="#7CC544" />
        <path d="M 35 118 Q 32 79 65 76 L 65 118 Z" fill="#8BD553" />
        <circle cx="65" cy="47" r="30" fill="#FFE3C9" />
        <path d="M 37 42 Q 34 16 65 13 Q 96 16 93 42 Q 90 29 76 26 Q 62 23 50 28 Q 40 31 37 42 Z" fill="#DCDCDC" />
        <circle cx="65" cy="13" r="9" fill="#CFCFCF" /><circle cx="65" cy="13" r="4" fill="#E8E8E8" />
        <path d="M 51 46 Q 55 43 60 46" fill="none" stroke="#8A6B4F" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 70 46 Q 74 43 79 46" fill="none" stroke="#8A6B4F" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="45" cy="59" r="5" fill="#FFC1A1" /><circle cx="85" cy="59" r="5" fill="#FFC1A1" />
        <path d="M 55 62 Q 65 72 75 62 Q 72 78 60 73 Z" fill="#C9573F" />
        <path d="M 42 88 Q 22 76 20 58" fill="none" stroke="#7CC544" strokeWidth="11" strokeLinecap="round" />
        <path d="M 88 88 Q 108 76 110 58" fill="none" stroke="#7CC544" strokeWidth="11" strokeLinecap="round" />
        <circle cx="19" cy="54" r="7" fill="#FFE3C9" /><circle cx="111" cy="54" r="7" fill="#FFE3C9" />
      </svg>
      {CONFETTI.map((c, i) => (
        <div key={i} className="illust-cheer__confetti" style={c.style} aria-hidden="true" />
      ))}
    </div>
  );
}
