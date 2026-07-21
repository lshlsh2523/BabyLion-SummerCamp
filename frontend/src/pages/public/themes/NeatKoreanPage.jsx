import { mediaUrl } from '../../../api/client';
import bg from '../../../assets/themes/neat_korean/nk-bg.jpg';
import './NeatKoreanPage.css';

/**
 * PUB · neat_korean — "사람과 사연이 담긴 가게" (Figma 6-2, 개발전달가이드 v2)
 * warm_old와 동일한 배경-오버레이 방식. 좌표계는 배경 이미지 804×1748(2x) 기준.
 * `?debug` 쿼리로 슬롯 외곽선 표시.
 *
 * [neat_korean 고유 슬롯]
 * - headline: 초록 강조 단어를 포함한 헤드카피. API story 스키마에 없음 →
 *   store.headline 슬롯만 두고, 값이 없으면 렌더 생략 (백엔드 필드 추가 대기).
 *   추가되면 "**강조**" 마크다운 별표로 강조 구간을 감싸 전달하기로 협의 예정.
 * - note: 사장님 한마디 = quoted_sentence 한 문장만 크게 (원본 5줄 → 1문장 채택).
 *   quoted_sentence는 상인 실제 발화 원문이라 이 테마 컨셉(사연)과 맞음.
 * - category / 정보값 / 해시태그 / 갤러리: warm_old와 동일 소스.
 */
const W = 804, H = 1748;

const SLOTS = {
  back:     [28, 78, 84, 84],
  fav:      [692, 88, 76, 80],
  category: [44, 258, 190, 48],
  name:     [36, 285, 350, 96],
  address:  [40, 392, 350, 40],   // 주소 (가게명과 헤드카피 사이 여백; ?debug로 미세조정)
  headline: [40, 452, 345, 300],   // 가게 서사 3문장 스토리 영역 (주소 아래로 붙여 위로 올림)
  hero:     [398, 285, 350, 475],
  note_title: [140, 805, 510, 45],  // 쪽지 상단 "사장님의 한마디" (왼쪽으로 옮겨 가운데 정렬)
  note:     [140, 865, 510, 240],   // 쪽지 안쪽 인용문 영역 (왼쪽으로 옮겨 가운데 정렬)
  vMenu:    [110, 1188, 178, 70],
  vPrice:   [300, 1188, 178, 70],
  vTime:    [490, 1188, 210, 44],
  vClosed:  [490, 1230, 210, 34],
  tags:     [150, 1305, 560, 62],
  gallery:  [[25, 1455, 175, 150], [218, 1455, 180, 150], [410, 1455, 180, 150], [603, 1455, 177, 150]],
  cta:      [30, 1650, 745, 74],
};

const box = ([x, y, w, h]) => ({
  left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`, height: `${(h / H) * 100}%`,
});
const fs = (px2x) => ({ fontSize: `${(px2x / W) * 100}cqw` });

/** headline의 **별표** 구간을 초록 강조 span으로 변환 */
function renderHeadline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? <em key={i} className="nk__hl-em">{seg.slice(2, -2)}</em>
      : <span key={i}>{seg}</span>,
  );
}

export default function NeatKoreanPage({ store }) {
  const info = store.basic_info ?? {};
  const closed = info.hours
    ? (info.hours.closed_days?.length ? `(매주 ${info.hours.closed_days.join('·')} 휴무)` : '(연중무휴)')
    : null;

  const photos = [...store.photos].sort((a, b) => a.sort_order - b.sort_order);
  // P1 촬영 순서(간판→대표메뉴→가게내부→메뉴판) = sort_order 1~4 고정.
  // hero(우측 폴라로이드)=간판(1). 하단 갤러리는 대표메뉴(2)·가게내부(3)·간판 재사용·
  // 메뉴판(4) 순으로 채워 마지막(4번째) 칸에 항상 메뉴판이 오도록 한다.
  const bySortOrder = (n) => photos.find((p) => p.sort_order === n);
  const hero = bySortOrder(1) ?? photos[0];
  const gallery = [bySortOrder(2), bySortOrder(3), hero, bySortOrder(4)].filter(Boolean);

  const debug = typeof window !== 'undefined' && window.location.search.includes('debug');
  const storeName = store.store_name
    || (store.title?.includes(',') ? store.title.slice(store.title.lastIndexOf(',') + 1).trim() : store.title);
  const mapHref = `https://map.kakao.com/?q=${encodeURIComponent(store.address || storeName)}`; // 주소 우선, 없으면 가게명

  return (
    <div className="nk-page">
      <div className={`nk${debug ? ' nk--debug' : ''}`}>
        <img className="nk__bg" src={bg} alt="" draggable="false" />

      {info.main_menu && (
        <p className="nk__category" style={{ ...box(SLOTS.category), ...fs(26) }}>
          {info.main_menu} 전문
        </p>
      )}

      <h1 className="nk__name" style={{ ...box(SLOTS.name), ...fs(72) }}>{storeName}</h1>

      {store.address && (
        <p className="nk__category" style={{ ...box(SLOTS.address), ...fs(24) }}>{store.address}</p>
      )}

      {/* 가게 서사 — 3문장 스토리 (headline 필드가 있으면 그걸, 없으면 story_lines 사용) */}
      {store.headline ? (
        <p className="nk__headline" style={{ ...box(SLOTS.headline), ...fs(38) }}>
          {renderHeadline(store.headline)}
        </p>
      ) : store.story_lines?.length > 0 && (
        <div className="nk__headline nk__story" style={{ ...box(SLOTS.headline), ...fs(26) }}>
          {store.story_lines.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      )}

      {hero && (
        <img className="nk__hero" style={box(SLOTS.hero)}
             src={mediaUrl(hero.url)} alt={`${storeName} 대표 사진`} />
      )}

      {/* 사장님 한마디 — 제목 + quoted_sentence 한 문장 */}
      {store.quoted_sentence && (
        <>
          <p className="nk__note-title" style={{ ...box(SLOTS.note_title), ...fs(30) }}>
            사장님의 한마디
          </p>
          <blockquote className="nk__note" style={{ ...box(SLOTS.note), ...fs(30) }}>
            “{store.quoted_sentence}”
          </blockquote>
        </>
      )}

      {info.main_menu && (
        <strong className="nk__value" style={{ ...box(SLOTS.vMenu), ...fs(30) }}>{info.main_menu}</strong>
      )}
      {info.price != null && (
        <strong className="nk__value" style={{ ...box(SLOTS.vPrice), ...fs(32) }}>
          {info.price.toLocaleString()}원
        </strong>
      )}
      {info.hours && (
        <strong className="nk__value" style={{ ...box(SLOTS.vTime), ...fs(30) }}>
          {info.hours.open}~{info.hours.close}
        </strong>
      )}
      {closed && (
        <span className="nk__value nk__value--sub" style={{ ...box(SLOTS.vClosed), ...fs(22) }}>{closed}</span>
      )}

      {/* 해시태그 — 새끼줄 배너 안 한 줄 정렬 (최대 4개) */}
      <div className="nk__tags" style={{ ...box(SLOTS.tags), ...fs(30) }}>
        {store.hashtags.slice(0, 4).map((t) => <span key={t}>{t}</span>)}
      </div>

      {gallery.slice(0, 4).map((p, i) => (
        <img key={p.url} className="nk__photo" style={box(SLOTS.gallery[i])}
             src={mediaUrl(p.url)} alt="" loading="lazy" />
      ))}

      <a className="nk__cta" style={box(SLOTS.cta)} href={mapHref}
         target="_blank" rel="noreferrer" aria-label="지도에서 보기" />
      </div>
    </div>
  );
}