/** 플로우 전역 상수 — 명세서·API 명세 기준의 매직넘버는 전부 여기서만 관리 */
export const CONFIG = {
  PHOTO_MIN: 4,
  PHOTO_MAX: 5,
  PHOTO_MAX_MB: 10,

  RECORD_MAX_SEC: 90,          // 답변당 최대 90초 자동 정지
  ANSWER_COUNT: 3,

  POLL_INTERVAL_MS: 2000,      // GET /jobs/{id} 폴링 간격
  POLL_TIMEOUT_MS: 90000,      // 90초 초과 시 failed 동일 처리
  REGENERATE_MAX: 5,           // 재생성 최대 5회

  FOUNDED_YEAR_MIN: 1900,
  PRICE_MIN: 100,
  PRICE_MAX: 10_000_000,

  SESSION_KEY: 'nopo_flow_v1', // sessionStorage 키
};
