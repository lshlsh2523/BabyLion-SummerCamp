import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicStore, mediaUrl } from '../../api/client';
import WarmOldPage from './themes/WarmOldPage';
import './themes/themes.css';
import './StoryPage.css';

/* 테마별 전용 레이아웃 (Figma 시안 반영분). 등록되지 않은 테마는
   아래 공통 레이아웃으로 렌더 — neat_korean·trendy_alley도 순차 이식 예정. */
const THEME_PAGES = { warm_old: WarmOldPage };

/**
 * PUB · 소비자용 공개 스토리 페이지 (/s/:storeId, 인증 불필요)
 * 렌더링 순서 고정: 대표 사진+타이틀 → 실용 정보 → 3줄 스토리 → 해시태그 → 갤러리
 * (가설 12: 실용 정보가 스토리보다 위)
 */
export default function StoryPage() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPublicStore(storeId).then(setStore).catch(() => setNotFound(true));
  }, [storeId]);

  if (notFound) return <div className="pub pub--empty">아직 공개되지 않은 가게예요.</div>;
  if (!store) return <div className="pub pub--empty">불러오는 중…</div>;

  const ThemePage = THEME_PAGES[store.theme_id];
  if (ThemePage) return <ThemePage store={store} />;

  const [hero, ...rest] = [...store.photos].sort((a, b) => a.sort_order - b.sort_order);
  const { basic_info: info } = store;

  return (
    <div className={`pub pub-theme-${store.theme_id}`}>
      {/* ① 대표 사진 + 타이틀 */}
      <header className="pub__hero">
        {hero && <img src={mediaUrl(hero.url)} alt="" className="pub__hero-img" />}
        <h1 className="pub__title">{store.title}</h1>
      </header>

      {/* ② 실용 정보 (스토리보다 위) */}
      <section className="pub__info" aria-label="가게 정보">
        <dl>
          <div><dt>대표 메뉴</dt><dd>{info.main_menu}</dd></div>
          <div><dt>가격</dt><dd>{info.price?.toLocaleString()}원</dd></div>
          <div>
            <dt>영업시간</dt>
            <dd>
              {info.hours?.open}–{info.hours?.close}
              {info.hours?.closed_days?.length
                ? ` · ${info.hours.closed_days.join('·')}요일 쉼`
                : ' · 연중무휴'}
            </dd>
          </div>
          {info.founded_year && <div><dt>시작</dt><dd>{info.founded_year}년부터</dd></div>}
        </dl>
      </section>

      {/* ③ 3줄 스토리 */}
      <section className="pub__story" aria-label="가게 이야기">
        {store.story_lines.map((line, i) => <p key={i}>{line}</p>)}
      </section>

      {/* ④ 해시태그 */}
      <div className="pub__tags">
        {store.hashtags.map((t) => <span key={t}>{t}</span>)}
      </div>

      {/* ⑤ 사진 갤러리 */}
      {rest.length > 0 && (
        <div className="pub__gallery">
          {rest.map((p) => <img key={p.url} src={mediaUrl(p.url)} alt="" />)}
        </div>
      )}
    </div>
  );
}