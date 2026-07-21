<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from 'react';
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> origin/main
import {
  IconSearch,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconPhoto,
<<<<<<< HEAD
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
=======
} from '@tabler/icons-react';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import './MapScreen.css';

/** 지도 초기 중심 좌표 (대전 중앙시장 인근) — 검색 결과가 없을 때의 기본 위치/검색 기준점 */
const DEFAULT_CENTER = { lat: 36.3283, lng: 127.4293 };

/**
 * 특정 검색어는 동명이인(동명 상호) 결과가 여러 개 뜰 수 있어, 데모에서 보여주고 싶은
 * 정확한 한 곳만 남기기 위한 주소 허용 목록. 카카오 주소 표기(시/도 생략 가능)에 맞춰
 * "구 동 번지" 정도의 부분 문자열로 매칭한다.
 */
const EXACT_ADDRESS_FILTERS = {
  '중앙다방': '동구 중동 93-7',
};

const FILTERS = [
  { key: 'category', options: ['한식', '중식', '일식', '양식', '분식'] },
>>>>>>> origin/main
  { key: 'price', options: ['5천원 이하', '1만원 이하', '2만원 이하', '상관없음'] },
  { key: 'distance', options: ['근처', '역 주변', '시장 주변', '거리순'] },
];

const DEFAULT_FILTER_VALUES = { category: '한식', price: '1만원 이하', distance: '근처' };
const DEFAULT_FILTER_SELECTED = { category: false, price: false, distance: false };

<<<<<<< HEAD
=======
/** 이만큼 아래로 끌어내리면 접힘으로 판정 */
>>>>>>> origin/main
const DRAG_CLOSE_THRESHOLD = 40;

export default function MapScreen() {
  const [search, setSearch] = useState('');
<<<<<<< HEAD
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
=======
  const [filterValues, setFilterValues] = useState(DEFAULT_FILTER_VALUES);
  const [filterSelected, setFilterSelected] = useState(DEFAULT_FILTER_SELECTED);   // 옵션을 한 번이라도 골랐는지
  const [openFilter, setOpenFilter] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragRef = useRef({ startY: 0, dragging: false });
  const screenRef = useRef(null);
  const [searchResults, setSearchResults] = useState(null);   // null = 검색 전(마커 없음), 배열 = 실제 검색 결과
  const { kakao, hasKey, error: kakaoError } = useKakaoMap();
  const kakaoMapElRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const placesRef = useRef(null);
  const markersRef = useRef([]);

  /**
   * 칩 목록 줄(.map-filters)은 가로 스크롤을 위해 overflow-x:auto가 걸려 있는데,
   * CSS 규칙상 overflow-x가 visible이 아니면 overflow-y도 auto로 계산돼 버려
   * 그 안에 있는 드롭다운(칩 아래로 삐져나오는 절대위치 요소)이 그대로 잘려서
   * 안 보이게 된다(=지도 영역이 덮어 가리는 것처럼 보임).
   * 그래서 드롭다운은 스크롤 줄 밖(.map-screen 바로 아래)에 별도로 그리고,
   * 클릭 시점에 칩 위치를 측정해서 좌표만 넘겨준다.
   */
  const handleChipClick = (e, key) => {
    if (openFilter === key) {
      setOpenFilter(null);
      return;
    }
    const chipRect = e.currentTarget.getBoundingClientRect();
    const screenRect = screenRef.current.getBoundingClientRect();
    setDropdownPos({
      top: chipRect.bottom - screenRect.top + 6,
      left: chipRect.left - screenRect.left,
    });
>>>>>>> origin/main
    setOpenFilter(key);
  };

  const selectFilterOption = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setFilterSelected((prev) => ({ ...prev, [key]: true }));
    setOpenFilter(null);
<<<<<<< HEAD
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
=======
  };

  const handlePinClick = (id) => {
    setSelectedStoreId(id);
    setSheetOpen(true);
  };

  /** 기존 마커를 지우고 검색 결과(items)로 다시 그린다 */
  const renderMarkers = (items) => {
    if (!kakao || !kakaoMapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = items.map((it) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(it.lat, it.lng),
        map: kakaoMapRef.current,
      });
      kakao.maps.event.addListener(marker, 'click', () => handlePinClick(it.id));
      return marker;
    });
  };

  /** 지도 중심을 items가 모두 보이도록 맞춘다 */
  const fitBoundsTo = (items) => {
    if (!kakao || !kakaoMapRef.current || !items.length) return;
    const bounds = new kakao.maps.LatLngBounds();
    items.forEach((it) => bounds.extend(new kakao.maps.LatLng(it.lat, it.lng)));
    kakaoMapRef.current.setBounds(bounds);
  };

  // 카카오맵 SDK 준비되면 1회 초기화 (키 없으면 kakao가 계속 null → 아래 CSS 플레이스홀더 유지)
  useEffect(() => {
    if (!kakao || !kakaoMapElRef.current || kakaoMapRef.current) return;
    const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    const map = new kakao.maps.Map(kakaoMapElRef.current, { center, level: 4 });
    kakaoMapRef.current = map;
    placesRef.current = new kakao.maps.services.Places();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakao]);

  /** 검색창 제출(Enter/돋보기 클릭) → 카카오 키워드 장소 검색으로 실제 지도에 반영 */
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const keyword = search.trim();
    if (!kakao || !placesRef.current || !keyword) return;

    placesRef.current.keywordSearch(
      keyword,
      (data, status) => {
        if (status !== kakao.maps.services.Status.OK) {
          setSelectedStoreId(null);
          setSearchResults([]);
          renderMarkers([]);
          setSheetOpen(true);
          return;
        }
        const addressHint = EXACT_ADDRESS_FILTERS[keyword];
        const matched = addressHint
          ? data.filter((d) => d.address_name?.includes(addressHint) || d.road_address_name?.includes(addressHint))
          : data;

        const results = matched.map((d) => ({
          id: d.id,
          name: d.place_name,
          tags: [d.category_name?.split(' > ').pop()].filter(Boolean),
          reason: d.address_name,
          lat: Number(d.y),
          lng: Number(d.x),
        }));
        setSelectedStoreId(null);
        setSearchResults(results);
        renderMarkers(results);
        fitBoundsTo(results);
        setSheetOpen(true);
      },
      { location: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng), radius: 20000 },
    );
  };

  /** 검색어 지우기 = 검색 결과와 마커를 모두 비운다 */
  const handleClearSearch = () => {
    setSearch('');
    setSearchResults(null);
    setSelectedStoreId(null);
    renderMarkers([]);
  };

  const displayStores = searchResults ?? [];
>>>>>>> origin/main

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
<<<<<<< HEAD
    if (Math.abs(delta) < 6) setSheetOpen((v) => !v);
    else if (delta > DRAG_CLOSE_THRESHOLD) setSheetOpen(false);
=======
    if (Math.abs(delta) < 6) {
      setSheetOpen((v) => !v);           // 살짝 누른 정도 = 탭으로 간주해 토글
    } else if (delta > DRAG_CLOSE_THRESHOLD) {
      setSheetOpen(false);               // 충분히 아래로 끌면 접힘
    }
>>>>>>> origin/main
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
<<<<<<< HEAD
          placeholder="가게 이름을 검색하세요"
          aria-label="가게 검색"
        />
        {search && (
          <button type="button" className="map-search__clear" aria-label="검색어 지우기" onClick={handleClearSearch}>
=======
          placeholder="검색어를 입력하세요"
          aria-label="가게 검색"
        />
        {search && (
          <button type="button" className="map-search__clear" aria-label="검색어 지우기"
                  onClick={handleClearSearch}>
>>>>>>> origin/main
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
<<<<<<< HEAD
          <span className="map-area__label">지도 영역 (VITE_KAKAO_MAP_KEY 필요)</span>
=======
          <span className="map-area__label">지도 영역</span>
>>>>>>> origin/main
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
<<<<<<< HEAD
          role="button" tabIndex={0}
          aria-label={sheetOpen ? '목록 접기' : '목록 펼치기'}
=======
          role="button"
          tabIndex={0}
          aria-label={sheetOpen ? '가게 목록 접기' : '가게 목록 펼치기'}
>>>>>>> origin/main
        >
          <span className="map-sheet__handle-bar" aria-hidden="true" />
        </div>

<<<<<<< HEAD
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
=======
        {searchResults?.length === 0 ? (
          <p className="map-sheet__empty">'{search}' 검색 결과가 없어요</p>
        ) : (
          <ul className="map-sheet__list">
            {displayStores.map((s) => (
              <li key={s.id} className={`map-store${selectedStoreId === s.id ? ' map-store--active' : ''}`}
                  onClick={() => handlePinClick(s.id)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinClick(s.id)}>
>>>>>>> origin/main
                <div className="map-store__thumb" aria-hidden="true">
                  <IconPhoto size={22} stroke={1.6} />
                </div>
                <div className="map-store__body">
                  <p className="map-store__name">{s.name}</p>
<<<<<<< HEAD
                  <div className="map-store__tags">
                    <span className="map-store__tag">{s.category}</span>
                    <span className="map-store__tag">{s.menu}</span>
                  </div>
                  <p className="map-store__reason">{s.address}</p>
=======
                  {s.tags.length > 0 && (
                    <div className="map-store__tags">
                      {s.tags.map((t) => <span key={t} className="map-store__tag">{t}</span>)}
                    </div>
                  )}
                  <p className="map-store__reason">{s.reason}</p>
>>>>>>> origin/main
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
