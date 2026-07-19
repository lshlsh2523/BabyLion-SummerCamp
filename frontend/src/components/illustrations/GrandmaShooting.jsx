const LABELS = {
  sign: '할머니가 가게 간판을 향해 휴대폰을 들고 사진을 찍는 그림',
  menuboard: '할머니가 가게 메뉴판을 찍는 그림',
  menu: '할머니가 대표 메뉴를 찍는 그림',
  interior: '할머니가 가게 안 모습을 찍는 그림',
};

/** 왼쪽 절반 · 간판+건물 (P1 1단계 · sign) */
function SignSubject() {
  return (
    <>
      <rect x="14" y="14" width="128" height="40" rx="8" fill="#7CC544" />
      <rect x="20" y="20" width="116" height="28" rx="5" fill="#FFF9E0" />
      <rect x="34" y="30" width="52" height="8" rx="4" fill="#9BC46A" />
      <rect x="94" y="30" width="28" height="8" rx="4" fill="#9BC46A" />
      <rect x="22" y="54" width="8" height="76" fill="#D9CBB4" />
      <rect x="126" y="54" width="8" height="76" fill="#D9CBB4" />
      <path d="M 14 54 L 142 54 L 136 74 L 20 74 Z" fill="#8BD553" />
      <rect x="36" y="80" width="84" height="50" rx="4" fill="#F3EBDC" />
      <rect x="46" y="90" width="30" height="40" rx="3" fill="#BCD9EF" />
      <rect x="86" y="90" width="26" height="26" rx="3" fill="#BCD9EF" />
    </>
  );
}

/** 왼쪽 절반 · 벽걸이 메뉴판 (P1 2단계 · menuboard) */
function MenuboardSubject() {
  return (
    <>
      <rect x="34" y="12" width="72" height="118" rx="10" fill="#7CC544" />
      <rect x="40" y="18" width="60" height="106" rx="6" fill="#F3EBDC" />

      <rect x="46" y="26" width="28" height="8" rx="4" fill="#9BC46A" />
      <rect x="78" y="26" width="14" height="8" rx="4" fill="#BCD9EF" />

      <rect x="46" y="44" width="28" height="8" rx="4" fill="#9BC46A" />
      <rect x="78" y="44" width="14" height="8" rx="4" fill="#BCD9EF" />

      <rect x="46" y="62" width="28" height="8" rx="4" fill="#9BC46A" />
      <rect x="78" y="62" width="14" height="8" rx="4" fill="#BCD9EF" />

      <rect x="46" y="80" width="28" height="8" rx="4" fill="#9BC46A" />
      <rect x="78" y="80" width="14" height="8" rx="4" fill="#BCD9EF" />

      <rect x="46" y="98" width="28" height="8" rx="4" fill="#9BC46A" />
      <rect x="78" y="98" width="14" height="8" rx="4" fill="#BCD9EF" />
    </>
  );
}

/** 왼쪽 절반 · 김이 나는 뚝배기 진열대 (P1 3단계 · menu) */
function MenuSubject() {
  return (
    <>
      <rect x="20" y="98" width="112" height="9" rx="4" fill="#D9CBB4" />
      <rect x="30" y="107" width="8" height="20" rx="2" fill="#D9CBB4" />
      <rect x="114" y="107" width="8" height="20" rx="2" fill="#D9CBB4" />

      <path d="M 30 98 Q 30 78 46 78 Q 62 78 62 98 Z" fill="#F3EBDC" />
      <rect x="28" y="94" width="36" height="6" rx="3" fill="#D9CBB4" />

      <path d="M 68 98 Q 68 70 96 70 Q 124 70 124 98 Z" fill="#F3EBDC" />
      <rect x="66" y="94" width="60" height="7" rx="3.5" fill="#D9CBB4" />

      <path d="M 40 78 Q 35 64 42 52" fill="none" stroke="#D9CBB4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 52 78 Q 48 62 54 48" fill="none" stroke="#D9CBB4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 88 70 Q 82 54 90 40" fill="none" stroke="#D9CBB4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 104 70 Q 100 54 106 40" fill="none" stroke="#D9CBB4" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

/** 왼쪽 절반 · 테이블·의자·벽면 메뉴판 (P1 4단계 · interior) */
function InteriorSubject() {
  return (
    <>
      <rect x="14" y="14" width="128" height="36" rx="8" fill="#7CC544" />
      <rect x="20" y="20" width="116" height="24" rx="5" fill="#F3EBDC" />
      <rect x="30" y="28" width="40" height="7" rx="3.5" fill="#BCD9EF" />
      <rect x="78" y="28" width="46" height="7" rx="3.5" fill="#BCD9EF" />

      <rect x="20" y="68" width="18" height="16" rx="4" fill="#F3EBDC" />
      <rect x="20" y="86" width="18" height="7" rx="3" fill="#F3EBDC" />
      <rect x="23" y="93" width="4" height="20" fill="#D9CBB4" />
      <rect x="33" y="93" width="4" height="20" fill="#D9CBB4" />

      <rect x="118" y="68" width="18" height="16" rx="4" fill="#F3EBDC" />
      <rect x="118" y="86" width="18" height="7" rx="3" fill="#F3EBDC" />
      <rect x="121" y="93" width="4" height="20" fill="#D9CBB4" />
      <rect x="131" y="93" width="4" height="20" fill="#D9CBB4" />

      <rect x="46" y="92" width="64" height="8" rx="4" fill="#D9CBB4" />
      <rect x="52" y="100" width="6" height="24" fill="#D9CBB4" />
      <rect x="98" y="100" width="6" height="24" fill="#D9CBB4" />
    </>
  );
}

const SUBJECTS = { sign: SignSubject, menuboard: MenuboardSubject, menu: MenuSubject, interior: InteriorSubject };

/** P1 · 단계별 피사체(간판/메뉴판/메뉴/내부)를 향해 휴대폰을 들고 사진을 찍는 할머니 */
export default function GrandmaShooting({ variant = 'sign', ...props }) {
  const Subject = SUBJECTS[variant] ?? SUBJECTS.sign;
  return (
    <svg viewBox="0 0 240 150" width="100%" role="img"
         aria-label={LABELS[variant] ?? LABELS.sign} {...props}>
      <Subject />

      <ellipse cx="196" cy="141" rx="34" ry="6" fill="#EDF7DF" />
      <path d="M 172 140 Q 170 102 196 100 Q 222 102 220 140 Z" fill="#7CC544" />
      <path d="M 172 140 Q 170 102 196 100 L 196 140 Z" fill="#8BD553" />
      <circle cx="196" cy="78" r="24" fill="#FFE3C9" />
      <path d="M 173 74 Q 171 54 196 52 Q 221 54 219 74 Q 217 64 206 62 Q 194 60 184 64 Q 175 66 173 74 Z" fill="#DCDCDC" />
      <circle cx="196" cy="50" r="8" fill="#CFCFCF" />
      <circle cx="187" cy="78" r="7" fill="none" stroke="#8A6B4F" strokeWidth="2.4" />
      <circle cx="205" cy="78" r="7" fill="none" stroke="#8A6B4F" strokeWidth="2.4" />
      <path d="M 194 78 Q 196 76 198 78" fill="none" stroke="#8A6B4F" strokeWidth="2.4" />
      <circle cx="187" cy="78" r="1.8" fill="#5B4632" /><circle cx="205" cy="78" r="1.8" fill="#5B4632" />
      <circle cx="180" cy="89" r="4" fill="#FFC1A1" /><circle cx="212" cy="89" r="4" fill="#FFC1A1" />
      <path d="M 191 92 Q 196 96 201 92" fill="none" stroke="#C9573F" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 178 108 Q 162 106 154 96" fill="none" stroke="#7CC544" strokeWidth="9" strokeLinecap="round" />
      <path d="M 214 108 Q 172 112 156 100" fill="none" stroke="#8BD553" strokeWidth="9" strokeLinecap="round" />
      <rect x="140" y="76" width="17" height="30" rx="4" fill="#3E3E3E" />
      <rect x="143" y="80" width="11" height="19" rx="2" fill="#FFF9C4" />
      <rect x="145" y="83" width="7" height="6" rx="1" fill="#7CC544" />
      <circle cx="150" cy="74" r="4" fill="#FFE3C9" /><circle cx="146" cy="108" r="4" fill="#FFE3C9" />
      <path d="M 134 70 L 124 60" stroke="#FFD93B" strokeWidth="3" strokeLinecap="round" />
      <path d="M 132 84 L 120 84" stroke="#FFD93B" strokeWidth="3" strokeLinecap="round" />
      <path d="M 134 96 L 124 104" stroke="#FFD93B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
