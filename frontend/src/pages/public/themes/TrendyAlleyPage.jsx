import { mediaUrl } from '../../../api/client';
import bg from '../../../assets/themes/trendy_alley/ta-bg.jpg';
import './TrendyAlleyPage.css';

/**
 * PUB · trendy_alley — "개성과 맛이 특별한 가게" (Figma 40:978, 개발전달가이드 v2)
 * warm_old·neat_korean과 동일한 배경-오버레이 방식. 좌표계 804×1748(2x) 기준.
 * `?debug` 쿼리로 슬롯 외곽선 표시.
 *
 * [trendy_alley 고유 슬롯]
 * - name: 가게명. 시안은 그래픽 로고지만 가게마다 이름이 달라 텍스트로 재현
 *   (BM HANNA 계열 폰트 + 흰색). 크라운 장식은 배경(ta-bg)에 이미 있음.
 * - headline: 형광 강조 헤드카피. **강조** 별표 구간을 형광 컬러로 (neat_korean과 동일 규칙).
 * - body: 본문 소개글. 특정 단어(김치=핑크, 돼지고기=라임 등)를 색 강조.
 *   API에 강조 정보가 없으므로 **핑크** / __라임__ 마크업으로 구분해 받기로 협의 예정.
 * - menu_photo: 본문 우측 대표메뉴 사진. (구 '김치찌개 국밥' 자리 → 대표메뉴 사진으로)
 * - 정보카드/해시태그(4색 배지)/갤러리: 공통 소스.
 *
 * [사진 배분 — 이 테마 특이점]
 * - hero(좌상단 폴라로이드) = 간판(photos[0])
 * - menu_photo(본문 우측) = 대표메뉴 사진 (촬영 순서상 2번째로 가정: photos[1])
 * - 갤러리 4장 = 대표메뉴·가게내부·메뉴판 + 간판(hero 재사용). 4번째 칸에 간판이 오도록 정렬.
 *   ※ 백엔드가 photo에 kind(간판/대표메뉴/메뉴판) 라벨을 안 주므로 sort_order 가정.
 *     kind 필드 추가 협의 권장.
 */
const W = 804, H = 1748;

const SLOTS = {
  hero:      [70, 236, 244, 278],   // 좌상단 폴라로이드 프레임 안쪽(픽셀 실측, rotate(-2deg) 기준)
  name:      [395, 290, 370, 110],
  category:  [415, 375, 330, 55],   // 가게명과 겹치지 않는 선에서 위로
  address:   [415, 432, 350, 40],   // 주소 (카테고리 아래 여백; ?debug로 미세조정)
  headline:  [30, 560, 400, 90],    // (백엔드 headline 미사용 시 비어 있음)
  body:      [30, 560, 430, 470],   // 스토리를 폴라로이드 아래 빈 공간(위쪽)으로 이동 + 여유 높이
  menuPhoto: [480, 830, 290, 250],
  // 아이콘 오른쪽 "값" 영역 — 라벨/아이콘은 배경에 그려져 있고, 여긴 값만 얹음.
  // 각 카드의 아이콘 우측 끝 실측치 기준으로 x 시작점을 잡음.
  vMenu:     [95, 1178, 145, 68],
  vPrice:    [326, 1178, 155, 68],
  vTime:     [561, 1178, 221, 68],
  // 해시태그 — 형광펜 배지(폭이 서로 다름) 실측 좌표에 맞춤. 4번째(맨 오른쪽) 배지는
  // 배경 이미지에서 지워서 3개만 남김.
  tags:      [[6, 1319, 153, 41], [186, 1318, 149, 47], [362, 1315, 207, 51]],
  gallery:   [[30, 1425, 165, 150], [205, 1425, 185, 150], [400, 1425, 185, 150], [595, 1425, 185, 150]],
  cta:       [29, 1650, 747, 74],
};

const box = ([x, y, w, h]) => ({
  left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`, height: `${(h / H) * 100}%`,
});
const fs = (px2x) => ({ fontSize: `${(px2x / W) * 100}cqw` });

/** **핑크** / __라임__ 강조 + 개행(\n) 처리 */
function renderRich(text) {
  return text.split('\n').map((line, li) => (
    <span key={li} style={{ display: 'block' }}>
      {line.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((seg, i) => {
        if (seg.startsWith('**') && seg.endsWith('**'))
          return <em key={i} className="ta__em ta__em--pink">{seg.slice(2, -2)}</em>;
        if (seg.startsWith('__') && seg.endsWith('__'))
          return <em key={i} className="ta__em ta__em--lime">{seg.slice(2, -2)}</em>;
        return <span key={i}>{seg}</span>;
      })}
    </span>
  ));
}

export default function TrendyAlleyPage({ store }) {
  const info = store.basic_info ?? {};
  const closed = info.hours
    ? (info.hours.closed_days?.length ? `(매주 ${info.hours.closed_days.join('·')} 휴무)` : '(연중무휴)')
    : null;

  const photos = [...store.photos].sort((a, b) => a.sort_order - b.sort_order);
  const hero = photos[0];           // 간판
  const menuPhoto = photos[1];      // 대표메뉴 (본문 우측)
  // 갤러리 4칸 = 대표메뉴·가게내부·메뉴판 + 간판(hero) 재사용. 4번째 칸에 간판이 오도록.
  const gallery = [photos[1], photos[2], photos[3], photos[0]].filter(Boolean);

  const debug = typeof window !== 'undefined' && window.location.search.includes('debug');
  const storeName = store.store_name
    || (store.title?.includes(',') ? store.title.slice(store.title.lastIndexOf(',') + 1).trim() : store.title);
  const mapHref = `https://map.kakao.com/?q=${encodeURIComponent(store.address || storeName)}`; // 주소 우선, 없으면 가게명

  return (
    <div className="ta-page">
      <div className={`ta${debug ? ' ta--debug' : ''}`}>
        <img className="ta__bg" src={bg} alt="" draggable="false" />

        {hero && (
          <img className="ta__hero" style={box(SLOTS.hero)}
               src={mediaUrl(hero.url)} alt={`${storeName} 대표 사진`} />
        )}

        <h1 className="ta__name" style={{ ...box(SLOTS.name), ...fs(64) }}>{storeName}</h1>
        {store.address && (
          <p className="ta__category" style={{ ...box(SLOTS.address), ...fs(22) }}>{store.address}</p>
        )}
        {info.main_menu && (
          <p className="ta__category" style={{ ...box(SLOTS.category), ...fs(30) }}>
            {info.main_menu} 전문
          </p>
        )}

        {store.headline && (
          <p className="ta__headline" style={{ ...box(SLOTS.headline), ...fs(40) }}>
            {renderRich(store.headline)}
          </p>
        )}

        <div className="ta__body" style={{ ...box(SLOTS.body), ...fs(30) }}>
          {store.story_lines.map((line, i) => <p key={i}>{renderRich(line)}</p>)}
        </div>

        {menuPhoto && (
          <img className="ta__menu-photo" style={box(SLOTS.menuPhoto)}
               src={mediaUrl(menuPhoto.url)} alt="대표메뉴" loading="lazy" />
        )}

        {info.main_menu && (
          <strong className="ta__value" style={{ ...box(SLOTS.vMenu), ...fs(26) }}>{info.main_menu}</strong>
        )}
        {info.price != null && (
          <strong className="ta__value" style={{ ...box(SLOTS.vPrice), ...fs(26) }}>
            {info.price.toLocaleString()}원
          </strong>
        )}
        {info.hours && (
          <div className="ta__value ta__value--time" style={{ ...box(SLOTS.vTime), ...fs(24) }}>
            <strong>{info.hours.open}~{info.hours.close}</strong>
            {closed && <span className="ta__value-sub">{closed}</span>}
          </div>
        )}

        {store.hashtags.slice(0, 3).map((t, i) => (
          <span key={t} className="ta__tag" style={{ ...box(SLOTS.tags[i]), ...fs(28) }}>{t}</span>
        ))}

        {gallery.slice(0, 4).map((p, i) => (
          <img key={p.url} className="ta__photo" style={box(SLOTS.gallery[i])}
               src={mediaUrl(p.url)} alt="" loading="lazy" />
        ))}

        <a className="ta__cta" style={box(SLOTS.cta)} href={mapHref}
           target="_blank" rel="noreferrer" aria-label="지도에서 보기" />
      </div>
    </div>
  );
}