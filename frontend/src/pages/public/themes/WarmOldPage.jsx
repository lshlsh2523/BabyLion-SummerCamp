import { mediaUrl } from '../../../api/client';
import bg from '../../../assets/themes/warm_old/warm-old-bg.jpg';
import './WarmOldPage.css';

/**
 * PUB · warm_old — 디자이너 export 배경(Figma Frame 108, 텍스트·사진 제거본) 위에
 * 데이터 텍스트/사진을 절대좌표로 얹는 오버레이 방식.
 *
 * 좌표계: export 원본 804×1748(2x) 픽셀 기준. SLOTS의 [x, y, w, h]를
 * %와 cqw로 환산해 어떤 화면 폭에서도 배경과 같은 비율로 스케일된다.
 * 위치가 어긋나면 SLOTS 숫자만 조정하면 됨. `?debug` 쿼리로 슬롯 외곽선 표시.
 *
 * [스키마 매핑 — 팀 협의 전 임시]
 * - title "헤드카피, 가게명"을 마지막 쉼표로 분리 (splitTitle)
 * - contact/address: 스키마에 없어 비면 괘선이 빈 줄로 노출됨 → 수집 여부 팀 논의
 */
const W = 804, H = 1748;

const SLOTS = {
  hero:     [206, 192, 548, 386],
  name:     [30, 595, 430, 105],
  category: [30, 722, 430, 58],
  contact:  [30, 800, 430, 62],
  address:  [30, 886, 440, 56],
  note:     [500, 700, 272, 320],
  stamp:    [118, 902, 194, 194],
  headline: [40, 1072, 724, 72],
  vMenu:    [60, 1248, 172, 62],
  vPrice:   [290, 1248, 172, 62],
  vTime:    [518, 1240, 252, 58],
  vClosed:  [518, 1296, 252, 40],
  tags:     [[95, 1352, 172, 58], [305, 1352, 166, 58], [515, 1352, 192, 58]],
  gallery:  [[30, 1444, 186, 206], [224, 1444, 186, 206], [418, 1444, 186, 206], [612, 1444, 186, 206]],
  cta:      [30, 1660, 745, 70],
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

  const photos = [...store.photos].sort((a, b) => a.sort_order - b.sort_order);
  const [hero, ...gallery] = photos;
  const debug = typeof window !== 'undefined' && window.location.search.includes('debug');

  const mapHref = `https://map.naver.com/p/search/${encodeURIComponent(storeName)}`; // TODO: 지도 기능 협의

  return (
    <div className={`wob${debug ? ' wob--debug' : ''}`}>
      <img className="wob__bg" src={bg} alt="" draggable="false" />

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

      <section className="wob__note" style={{ ...box(SLOTS.note), ...fs(24) }} aria-label="가게 이야기">
        {store.story_lines.map((line, i) => <p key={i}>{line}</p>)}
      </section>

      {headline && (
        <p className="wob__headline" style={{ ...box(SLOTS.headline), ...fs(46) }}>{headline}</p>
      )}

      {info.main_menu && (
        <strong className="wob__value" style={{ ...box(SLOTS.vMenu), ...fs(36) }}>{info.main_menu}</strong>
      )}
      {info.price != null && (
        <strong className="wob__value" style={{ ...box(SLOTS.vPrice), ...fs(36) }}>
          {info.price.toLocaleString()}원
        </strong>
      )}
      {info.hours && (
        <strong className="wob__value" style={{ ...box(SLOTS.vTime), ...fs(34) }}>
          {info.hours.open}~{info.hours.close}
        </strong>
      )}
      {closed && (
        <span className="wob__value wob__value--sub" style={{ ...box(SLOTS.vClosed), ...fs(24) }}>
          {closed}
        </span>
      )}

      {store.hashtags.slice(0, 3).map((t, i) => (
        <span key={t} className="wob__tag" style={{ ...box(SLOTS.tags[i]), ...fs(30) }}>{t}</span>
      ))}

      {gallery.slice(0, 4).map((p, i) => (
        <img key={p.url} className="wob__photo" style={box(SLOTS.gallery[i])}
             src={mediaUrl(p.url)} alt="" loading="lazy" />
      ))}

      <a className="wob__cta" style={box(SLOTS.cta)} href={mapHref}
         target="_blank" rel="noreferrer" aria-label="지도에서 보기" />
    </div>
  );
}