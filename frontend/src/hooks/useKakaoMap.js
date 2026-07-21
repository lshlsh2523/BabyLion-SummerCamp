import { useEffect, useState } from 'react';

let loadPromise = null;

/**
 * 카카오맵 SDK 스크립트를 앱 전체에서 1회만 주입 (autoload=false → maps.load 콜백에서 완료 확정)
 * libraries=services → kakao.maps.services.Places(장소 검색) 사용을 위해 필요
 */
function loadKakaoSdk(appKey) {
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('카카오맵 SDK 로드 시간 초과 (네트워크/광고 차단 확장 프로그램 확인)')),
      8000,
    );
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      try {
        // 키/도메인이 잘못됐거나 "카카오맵" 제품 설정이 꺼져 있으면 스크립트는 200으로
        // 응답하지만 kakao.maps가 제대로 안 채워지는 경우가 있어 명시적으로 확인한다.
        if (!window.kakao?.maps) throw new Error('kakao.maps 초기화 실패 (앱 키/도메인/제품 설정 확인)');
        window.kakao.maps.load(() => resolve(window.kakao));
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => { clearTimeout(timeout); reject(new Error('카카오맵 SDK 로드 실패')); };
    document.head.appendChild(script);
  });
  loadPromise.catch(() => { loadPromise = null; });   // 실패 시 다음 마운트에서 재시도 가능하게
  return loadPromise;
}

/**
 * VITE_KAKAO_MAP_KEY 환경변수만 채우면 동작.
 * - hasKey: 키가 설정돼 있는지 (없으면 지도 대신 mock 플레이스홀더 사용)
 * - kakao: SDK 로드 완료 후의 window.kakao (Map/Marker 생성에 사용)
 */
export function useKakaoMap() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  const [kakao, setKakao] = useState(window.kakao?.maps ? window.kakao : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appKey || kakao) return;
    let cancelled = false;
    loadKakaoSdk(appKey)
      .then((k) => { if (!cancelled) setKakao(k); })
      .catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [appKey, kakao]);

  return { kakao, hasKey: !!appKey, error };
}
