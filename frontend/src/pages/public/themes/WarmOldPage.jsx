import { useState } from 'react';
import { mediaUrl } from '../../../api/client';
import bg from '../../../assets/themes/warm_old/warm-old-bg.jpg';
import './WarmOldPage.css';

/**
 * PUB · warm_old — 디자이너 export 배경(Figma Frame, 텍스트·사진 제거본) 위에
 * 데이터 텍스트/사진을 절대좌표로 얹는 오버레이 방식.
 *
 * 좌표계: 배경 이미지 804×1688(2x) 픽셀 기준.
 *   ⚠ 원본 export(804×1748)에서 상단 여백 60px(y 48~108)을 스플라이스로 제거한 상태.
 *     배경을 재-export하면 splice를 다시 적용하거나 아래 SLOTS 전체 y+60 할 것.
 * SLOTS의 [x, y, w, h]를 %와 cqw로 환산해 어떤 폭에서도 배경과 같은 비율로 스케일.
 * 위치가 어긋나면 SLOTS 숫자만 조정하면 됨. `?debug` 쿼리로 슬롯 외곽선 표시.
 *
 * [스키마 매핑 — 팀 협의 전 임시]
 * - title "헤드카피, 가게명"을 마지막 쉼표로 분리 (splitTitle)
 * - contact/address: 스키마에 없어 비면 괘선이 빈 줄로 노출됨 → 수집 여부 팀 논의
 * - 즐겨찾기: 로컬 상태만 토글 (저장 API 없음 → 백엔드 협의 필요)
 */
const W = 804, H = 1688;

const SLOTS = {
  back:     [28, 30, 84, 84],
  fav:      [692, 30, 84, 84],
  hero:     [206, 132, 548, 386],
  name:     [30, 535, 430, 105],
  category: [30, 662, 430, 58],
  contact:  [30, 740, 430, 62],
  address:  [30, 826, 440, 56],
  note:     [486, 662, 250, 258],   // 메모지 안쪽 (찢어진 가장자리 여백 확보, 우상단 클립 회피)
  stamp:    [132, 848, 152, 152],
  headline: [40, 1012, 724, 72],
  vMenu:    [36, 1198, 200, 56],    // 대표메뉴 카드 중심(x≈136)에 맞춤
  vPrice:   [290, 1198, 170, 56],
  vTime:    [533, 1194, 216, 50],   // 영업시간 카드 중심(x≈640)에 맞춤
  vClosed:  [533, 1244, 216, 34],
  // 알약(해시태그) 외곽선 픽셀 검출값: y 1362~1427(원본) → 스플라이스 후 -60
  tags:     [[95, 1302, 172, 65], [305, 1302, 166, 65], [515, 1302, 199, 65]],
  gallery:  [[30, 1384, 177, 184], [219, 1384, 177, 184], [408, 1384, 177, 184], [597, 1384, 177, 184]],
  // CTA 버튼 픽셀 검출값: y 1648~1727(원본) → -60
  cta:      [34, 1588, 740, 80],
};

const box = ([x, y, w, h]) => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});
/** 2x px → 컨테이너 폭 기준 폰트 크기 */
const fs = (px2x) => ({ fontSize: `${(px2x / W) * 100}cqw` });

function splitTitle(title = '') {
  const at = title.lastIndexOf(',');
  if (at === -1) return { headline: null, storeName: title.trim() };
  return { headline: title.slice(0, at).trim(), storeName: title.slice(at + 1).trim() };
}

/** 원본 도장 자리에 얹는 동적 SINCE 도장 (founded_year 반영) */
function SinceStamp({ year }) {
  if (!year) return null;
  return (
    <svg className="wob__stamp" style={box(SLOTS.stamp)} viewBox="0 0 100 100"
         role="img" aria-label={`${year}년부터`}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3.4" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text x="50" y="42" textAnchor="middle" fontSize="13" letterSpacing="4" fontWeight="600">SINCE</text>
      <text x="50" y="66" textAnchor="middle" fontSize="21" letterSpacing="2" fontWeight="700">{year}</text>
      <text x="22" y="30" fontSize="9">★</text><text x="72" y="30" fontSize="9">★</text>
    </svg>
  );
}

export default function WarmOldPage({ store }) {
  const { headline, storeName } = splitTitle(store.title);
  const info = store.basic_info ?? {};
  const closed = info.hours
    ? (info.hours.closed_days?.length ? `(매주 ${info.hours.closed_days.join('·')} 휴무)` : '(연중무휴)')
    : null;
  const [faved, setFaved] = useState(false);

  // 수집 사진 4장(간판·메뉴판·가게 안·대표 메뉴): 간판(첫 장)은 대표 자리에,
  // 하단 갤러리에는 4장 전부 노출 (Figma 시안의 4칸 갤러리)
  const photos = [...store.photos].sort((a, b) => a.sort_order - b.sort_order);
  const hero = photos[0];
  const gallery = photos.slice(0, 4);
  const debug = typeof window !== 'undefined' && window.location.search.includes('debug');

  const mapHref = `https://map.naver.com/p/search/${encodeURIComponent(storeName)}`; // TODO: 지도 기능 협의
  const goBack = () => (window.history.length > 1 ? window.history.back() : window.location.assign('/'));

  return (
    <div className="wob-page">
      <div className={`wob${debug ? ' wob--debug' : ''}`}>
        <img className="wob__bg" src={bg} alt="" draggable="false" />

        <button type="button" className="wob__iconbtn" style={box(SLOTS.back)}
                onClick={goBack} aria-label="뒤로 가기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className={`wob__iconbtn${faved ? ' is-on' : ''}`} style={box(SLOTS.fav)}
                onClick={() => setFaved(v => !v)} aria-label="즐겨찾기" aria-pressed={faved}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8-5.1-2.9-5.1 2.9 1.1-5.8-4.3-4 5.8-.7z"
                  fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"
                  strokeLinejoin="round" />
          </svg>
        </button>

        {hero && (
          <img className="wob__hero" style={box(SLOTS.hero)}
               src={mediaUrl(hero.url)} alt={`${storeName} 대표 사진`} />
        )}

        <h1 className="wob__name" style={{ ...box(SLOTS.name), ...fs(72) }}>{storeName}</h1>
        {info.main_menu && (
          <p className="wob__category" style={{ ...box(SLOTS.category), ...fs(28) }}>
            {info.main_menu} 전문
          </p>
        )}
        {store.contact && (
          <p className="wob__line" style={{ ...box(SLOTS.contact), ...fs(32) }}>{store.contact}</p>
        )}
        {store.address && (
          <p className="wob__line" style={{ ...box(SLOTS.address), ...fs(28) }}>{store.address}</p>
        )}

        <SinceStamp year={info.founded_year} />

        <section className="wob__note" style={{ ...box(SLOTS.note), ...fs(20) }} aria-label="가게 이야기">
          {store.story_lines.map((line, i) => <p key={i}>{line}</p>)}
        </section>

        {headline && (
          <p className="wob__headline" style={{ ...box(SLOTS.headline), ...fs(46) }}>{headline}</p>
        )}

        {info.main_menu && (
          <strong className="wob__value" style={{ ...box(SLOTS.vMenu), ...fs(30) }}>{info.main_menu}</strong>
        )}
        {info.price != null && (
          <strong className="wob__value" style={{ ...box(SLOTS.vPrice), ...fs(30) }}>
            {info.price.toLocaleString()}원
          </strong>
        )}
        {info.hours && (
          <strong className="wob__value" style={{ ...box(SLOTS.vTime), ...fs(27) }}>
            {info.hours.open}~{info.hours.close}
          </strong>
        )}
        {closed && (
          <span className="wob__value wob__value--sub" style={{ ...box(SLOTS.vClosed), ...fs(19) }}>
            {closed}
          </span>
        )}

        {store.hashtags.slice(0, 3).map((t, i) => (
          <span key={t} className="wob__tag" style={{ ...box(SLOTS.tags[i]), ...fs(26) }}>{t}</span>
        ))}

        {gallery.map((p, i) => (
          <img key={p.url} className="wob__photo" style={box(SLOTS.gallery[i])}
               src={mediaUrl(p.url)} alt="" loading="lazy" />
        ))}

        <a className="wob__cta" style={box(SLOTS.cta)} href={mapHref}
           target="_blank" rel="noreferrer" aria-label="지도에서 보기" />
      </div>
    </div>
  );
}
