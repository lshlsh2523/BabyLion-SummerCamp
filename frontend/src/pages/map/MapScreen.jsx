import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconSearch,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconPhoto,
  IconExternalLink,
} from '@tabler/icons-react';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { getPublicStores } from '../../api/client';
import './MapScreen.css';

/** 지도 초기 중심 (대전 중앙시장 인근) */
const DEFAULT_CENTER = { lat: 36.3283, lng: 127.4293 };

/**
 * 시연용 노포 가게 데이터. 지도에 핀으로 표시하고, 이름/카테고리로 필터한다.
 * 좌표는 대전 중앙시장 부근 임의값. `pageName` 이 발행된 가게명과 일치하면
 * 해당 가게의 실제 웹페이지(/s/{store_id}) 링크가 붙는다.
 */
const DEMO_STORES = [
  { id: 'jungang', name: '중앙다방',   category: '카페', price: '1만원 이하', distance: '근처',
    menu: '수국차',    address: '대전 동구 중동 93-7', lat: 36.3290, lng: 127.4262, pageName: '중앙다방' },
  { id: 'yetnal',  name: '옛날다방',   category: '카페', price: '1만원 이하', distance: '근처',
    menu: '쌍화차',    address: '대전 동구 중동',      lat: 36.3284, lng: 127.4278 },
  { id: 'golmok',  name: '골목커피',   category: '카페', price: '5천원 이하', distance: '근처',
    menu: '드립커피',  address: '대전 동구 대전로',    lat: 36.3297, lng: 127.4249 },
  { id: 'hanbat',  name: '한밭국수',   category: '한식', price: '5천원 이하', distance: '시장 주변',
    menu: '잔치국수',  address: '대전 동구 중앙시장길', lat: 36.3275, lng: 127.4305 },
  { id: 'wonjo',   name: '원조분식',   category: '분식', price: '5천원 이하', distance: '근처',
    menu: '떡볶이',    address: '대전 동구 대전로',    lat: 36.3299, lng: 127.4284 },
  { id: 'junghwa', name: '중화각',     category: '중식', price: '1만원 이하', distance: '역 주변',
    menu: '짜장면',    address: '대전 동구 정동',      lat: 36.3261, lng: 127.4321 },
];

const FILTERS = [
  { key: 'category', options: ['카페', '한식', '중식', '일식', '분식'] },
  { key: 'price', options: ['5천원 이하', '1만원 이하', '2만원 이하', '상관없음'] },
  { key: 'distance', options: ['근처', '역 주변', '시장 주변', '거리순'] },
];

const DEFAULT_FILTER_VALUES = { category: '한식', price: '1만원 이하', distance: '근처' };
const DEFAULT_FILTER_SELECTED = { category: false, price: false, distance: false };

const DRAG_CLOSE_THRESHOLD = 40;

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');   // 제출된 검색어
  const [filterValues, setFilterValues] = useState(DEFAULT_FILTER_VALUES);
  const [filterSelected, setFilterSelected] = useState(DEFAULT_FILTER_SELECTED);
  const [openFilter, setOpenFilter] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [pubByName, setPubByName] = useState({});            // 발행 가게명 -> 실제 정보(id·메뉴·주소)
  const dragRef = useRef({ startY: 0, dragging: false });
  const screenRef = useRef(null);
  const { kakao, hasKey, error: kakaoError } = useKakaoMap();
  const kakaoMapElRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);

  // 발행된 가게 목록을 받아 이름->실제정보 매핑 (실시간 메뉴/주소/링크 반영용)
  useEffect(() => {
    getPublicStores()
      .then((list) => {
        const map = {};
        (list ?? []).forEach((s) => { if (s.store_name) map[s.store_name] = s; });
        setPubByName(map);
      })
      .catch(() => setPubByName({}));
  }, []);

  // 데모 가게에 실제 발행 데이터(대표메뉴·주소·링크)를 덮어씌운다.
  const resolvedStores = useMemo(() =>
    DEMO_STORES.map((s) => {
      const pub = s.pageName ? pubByName[s.pageName] : null;
      return {
        ...s,
        menu: pub?.main_menu || s.menu,
        address: pub?.address || s.address,
        pageId: pub?.store_id || null,
      };
    }), [pubByName]);

  // 검색어/필터에 따라 보여줄 가게 계산
  const visibleStores = useMemo(() => {
    const q = appliedSearch.trim();
    if (q) return resolvedStores.filter((s) => s.name.includes(q));
    const anySelected = filterSelected.category || filterSelected.price || filterSelected.distance;
    if (!anySelected) return resolvedStores;
    return resolvedStores.filter((s) =>
      (!filterSelected.category || s.category === filterValues.category) &&
      (!filterSelected.price || s.price === filterValues.price) &&
      (!filterSelected.distance || s.distance === filterValues.distance),
    );
  }, [resolvedStores, appliedSearch, filterValues, filterSelected]);

  const selectedStore = visibleStores.find((s) => s.id === selectedId) || null;
  const pageId = selectedStore?.pageId || null;

  // 카카오맵 초기화
  useEffect(() => {
    if (!kakao || !kakaoMapElRef.current || kakaoMapRef.current) return;
    const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    kakaoMapRef.current = new kakao.maps.Map(kakaoMapElRef.current, { center, level: 5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakao]);

  // 보여줄 가게가 바뀔 때마다 마커 다시 그리기 + 화면 맞춤
  useEffect(() => {
    if (!kakao || !kakaoMapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = visibleStores.map((s) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(s.lat, s.lng),
        map: kakaoMapRef.current,
      });
      kakao.maps.event.addListener(marker, 'click', () => { setSelectedId(s.id); setSheetOpen(true); });
      return marker;
    });
    if (visibleStores.length) {
      const bounds = new kakao.maps.LatLngBounds();
      visibleStores.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)));
      kakaoMapRef.current.setBounds(bounds);
    }
  }, [kakao, visibleStores]);

  const handleChipClick = (e, key) => {
    if (openFilter === key) { setOpenFilter(null); return; }
    const chipRect = e.currentTarget.getBoundingClientRect();
    const screenRect = screenRef.current.getBoundingClientRect();
    setDropdownPos({ top: chipRect.bottom - screenRect.top + 6, left: chipRect.left - screenRect.left });
    setOpenFilter(key);
  };

  const selectFilterOption = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setFilterSelected((prev) => ({ ...prev, [key]: true }));
    setOpenFilter(null);
    setSelectedId(null);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setAppliedSearch(search);
    setSelectedId(null);
    setSheetOpen(true);
  };

  const handleClearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedId(null);
  };

  const handleSelect = (id) => { setSelectedId(id); setSheetOpen(true); };

  const handleHandlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, dragging: true };
  };
  const handleHandlePointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    setDragY(Math.max(0, e.clientY - dragRef.current.startY));
  };
  const handleHandlePointerUp = (e) => {
    if (!dragRef.current.dragging) return;
    const delta = e.clientY - dragRef.current.startY;
    dragRef.current.dragging = false;
    setDragY(0);
    if (Math.abs(delta) < 6) setSheetOpen((v) => !v);
    else if (delta > DRAG_CLOSE_THRESHOLD) setSheetOpen(false);
  };

  const openFilterDef = FILTERS.find((f) => f.key === openFilter);

  return (
    <div className="map-screen" ref={screenRef}>
      <div className="map-blob map-blob--tr" aria-hidden="true" />
      <div className="map-blob map-blob--bl" aria-hidden="true" />

      {openFilter && <div className="map-screen__scrim" onClick={() => setOpenFilter(null)} />}

      <header className="map-header">
        <h1 className="map-header__title">노포 지도</h1>
      </header>

      <form className="map-search" onSubmit={handleSearchSubmit}>
        <button type="submit" className="map-search__icon" aria-label="검색">
          <IconSearch size={20} stroke={2} />
        </button>
        <input
          className="map-search__input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="가게 이름을 검색하세요"
          aria-label="가게 검색"
        />
        {search && (
          <button type="button" className="map-search__clear" aria-label="검색어 지우기" onClick={handleClearSearch}>
            <IconX size={18} stroke={2} />
          </button>
        )}
      </form>

      <div className="map-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`map-filter__chip${filterSelected[f.key] ? ' map-filter__chip--selected' : ''}${openFilter === f.key ? ' map-filter__chip--open' : ''}`}
            onClick={(e) => handleChipClick(e, f.key)}
          >
            <span>{filterValues[f.key]}</span>
            <IconChevronDown size={16} stroke={2.5} />
          </button>
        ))}
      </div>

      {openFilterDef && dropdownPos && (
        <ul className="map-filter__dropdown" style={{ top: dropdownPos.top, left: dropdownPos.left }}>
          {openFilterDef.options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`map-filter__option${filterValues[openFilterDef.key] === opt ? ' map-filter__option--active' : ''}`}
                onClick={() => selectFilterOption(openFilterDef.key, opt)}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="map-area">
        {hasKey ? (
          <div ref={kakaoMapElRef} className="map-area__kakao" />
        ) : (
          <span className="map-area__label">지도 영역 (VITE_KAKAO_MAP_KEY 필요)</span>
        )}
        {kakaoError && <span className="map-area__error">카카오맵을 불러오지 못했어요</span>}
      </div>

      <div
        className={`map-sheet${sheetOpen ? ' map-sheet--open' : ''}`}
        style={sheetOpen && dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <div
          className="map-sheet__handle"
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          role="button" tabIndex={0}
          aria-label={sheetOpen ? '목록 접기' : '목록 펼치기'}
        >
          <span className="map-sheet__handle-bar" aria-hidden="true" />
        </div>

        {selectedStore ? (
          /* 핀 클릭 → 가게 정보 + 웹페이지 링크 */
          <div className="map-detail">
            <p className="map-detail__name">{selectedStore.name}</p>
            <div className="map-store__tags">
              <span className="map-store__tag">{selectedStore.category}</span>
              <span className="map-store__tag">{selectedStore.menu}</span>
              <span className="map-store__tag">{selectedStore.price}</span>
            </div>
            <p className="map-store__reason">{selectedStore.address}</p>
            {pageId ? (
              <a className="map-detail__link" href={`/s/${pageId}`} target="_blank" rel="noreferrer">
                <IconExternalLink size={18} stroke={2} />
                <span>가게 소개 페이지 보기</span>
              </a>
            ) : (
              <p className="map-detail__nopage">아직 소개 페이지가 없는 가게예요</p>
            )}
            <button type="button" className="map-detail__back" onClick={() => setSelectedId(null)}>
              목록으로
            </button>
          </div>
        ) : visibleStores.length === 0 ? (
          <p className="map-sheet__empty">'{appliedSearch}' 검색 결과가 없어요</p>
        ) : (
          <ul className="map-sheet__list">
            {visibleStores.map((s) => (
              <li key={s.id} className="map-store"
                  onClick={() => handleSelect(s.id)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelect(s.id)}>
                <div className="map-store__thumb" aria-hidden="true">
                  <IconPhoto size={22} stroke={1.6} />
                </div>
                <div className="map-store__body">
                  <p className="map-store__name">{s.name}</p>
                  <div className="map-store__tags">
                    <span className="map-store__tag">{s.category}</span>
                    <span className="map-store__tag">{s.menu}</span>
                  </div>
                  <p className="map-store__reason">{s.address}</p>
                </div>
                <IconChevronRight size={20} stroke={2} className="map-store__arrow" aria-hidden="true" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
