/**
 * ★ 서버 호출이 모이는 유일한 파일 ★
 *
 * createStore()는 request() 를 통해 실서버(POST /api/v1/stores)를 호출한다.
 * 나머지 함수는 아직 mock.js 를 호출한다 — 다음 단계에서 하나씩 request() 로 교체.
 * 페이지·컴포넌트 코드는 한 줄도 바꾸지 않는 것이 목표.
 */
import { mockApi } from './mock';
import { CONFIG } from '../constants/config';

const BASE = `${import.meta.env.VITE_API_HOST}/api/v1`;

/** FlowContext가 sessionStorage에 동기화해 둔 상태에서 editToken을 읽는다 (새 저장소 추가 금지). */
const getEditToken = () => {
  try {
    const raw = sessionStorage.getItem(CONFIG.SESSION_KEY);
    return raw ? JSON.parse(raw).editToken : null;
  } catch {
    return null;
  }
};

/**
 * 공통 fetch 헬퍼.
 * - auth !== false 인 모든 호출에 X-Edit-Token 자동 주입 (createStore만 auth:false로 호출)
 * - 2xx: JSON 파싱해 반환 (204는 null)
 * - non-2xx: body.error 를 꺼내 mock.js가 throw하는 것과 동일한 모양 { status, code, ... } 으로 throw
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getEditToken();
    if (token) headers['X-Edit-Token'] = token;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = data?.error ?? {};
    throw { status: res.status, ...error };
  }

  return data;
}

export const createStore    = ()                        => request('/stores', { method: 'POST', auth: false });
export const getStore       = (storeId)                 => mockApi.getStore(storeId);
export const uploadPhoto    = (storeId, file)           => mockApi.uploadPhoto(storeId, file);
export const deletePhoto    = (storeId, photoId)        => mockApi.deletePhoto(storeId, photoId);
export const saveBasicInfo  = (storeId, partial)        => mockApi.saveBasicInfo(storeId, partial);
export const uploadAnswer   = (storeId, questionNo, b)  => mockApi.uploadAnswer(storeId, questionNo, b);
export const generate       = (storeId, opts)           => mockApi.generate(storeId, opts);
export const getJob         = (jobId)                   => mockApi.getJob(jobId);
export const publish        = (storeId)                 => mockApi.publish(storeId);
export const getPublicStore = (storeId)                 => mockApi.getPublicStore(storeId);

/** 미디어 상대경로 → 절대 URL (mock 단계에선 blob: URL이라 그대로 반환) */
export const mediaUrl = (path) =>
  path?.startsWith('blob:') || path?.startsWith('data:') || path?.startsWith('http')
    ? path
    : `${import.meta.env.VITE_API_HOST ?? ''}${path ?? ''}`;