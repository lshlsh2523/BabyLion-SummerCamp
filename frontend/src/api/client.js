/**
 * ★ 서버 호출이 모이는 유일한 파일 ★
 *
 * 모든 함수가 request() 를 통해 실서버(FastAPI)를 호출한다.
 * - 쓰기 요청에는 X-Edit-Token 자동 주입 (createStore·공개조회 제외)
 * - 파일 업로드(사진·음성)는 FormData 로 전송
 * - getPublicStore 는 백엔드의 중첩 story 를 평면으로 펴서 페이지 계약을 맞춘다
 * DEV 전용 /s/preview(테마 작업용)만 mock 을 유지한다.
 * 페이지·컴포넌트 코드는 한 줄도 바꾸지 않는 것이 목표.
 */
import { mockApi } from './mock';
import { CONFIG } from '../constants/config';

const BASE = `${import.meta.env.VITE_API_HOST}/api/v1`;

// createStore 로 갓 발급된 토큰을 메모리에 즉시 보관한다.
// (FlowContext 의 sessionStorage 동기화는 리렌더 후 useEffect 에서 일어나, 같은 함수 안에서
//  createStore 직후 이어지는 쓰기 요청은 sessionStorage 에 아직 토큰이 없어 403 이 난다.)
let authToken = null;

/** 메모리 토큰을 우선 사용하고, 없으면 sessionStorage(새로고침 복구용)에서 읽는다. */
const getEditToken = () => {
  if (authToken) return authToken;
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
  const isForm = body instanceof FormData;   // 파일 업로드는 브라우저가 boundary 를 직접 붙이도록 둔다
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getEditToken();
    if (token) headers['X-Edit-Token'] = token;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : (isForm ? body : JSON.stringify(body)),
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = data?.error ?? {};
    throw { status: res.status, ...error };
  }

  return data;
}

export const createStore = async () => {
  const res = await request('/stores', { method: 'POST', auth: false });
  if (res?.edit_token) authToken = res.edit_token;   // 이후 쓰기 요청이 즉시 이 토큰을 쓰도록
  return res;
};
export const getStore       = (storeId)          => request(`/stores/${storeId}`);
export const saveBasicInfo  = (storeId, partial) => request(`/stores/${storeId}/basic-info`, { method: 'PUT', body: partial });

export const uploadPhoto = (storeId, file) => {
  const fd = new FormData();
  fd.append('file', file, file.name);
  return request(`/stores/${storeId}/photos`, { method: 'POST', body: fd });
};

export const deletePhoto = (storeId, photoId) =>
  request(`/stores/${storeId}/photos/${photoId}`, { method: 'DELETE' });

export const uploadAnswer = (storeId, questionNo, blob) => {
  const ext = (blob.type?.split('/')[1] || 'webm').split(';')[0];
  const fd = new FormData();
  fd.append('file', blob, `q${questionNo}.${ext}`);
  fd.append('question_no', String(questionNo));
  return request(`/stores/${storeId}/answers`, { method: 'POST', body: fd });
};

// 저장 없이 음성만 텍스트로 변환 (대표 메뉴 등 basic_info 음성 입력용)
export const transcribeAudio = (storeId, blob) => {
  const ext = (blob.type?.split('/')[1] || 'webm').split(';')[0];
  const fd = new FormData();
  fd.append('file', blob, `menu.${ext}`);
  return request(`/stores/${storeId}/transcribe`, { method: 'POST', body: fd });
};

export const generate = (storeId, { retry = false } = {}) =>
  request(`/stores/${storeId}/generate${retry ? '?retry=true' : ''}`, { method: 'POST' });

export const getJob  = (jobId)   => request(`/jobs/${jobId}`);
export const publish = (storeId) => request(`/stores/${storeId}/publish`, { method: 'POST' });

// 발행된 가게 목록 (노포 지도용)
export const getPublicStores = () => request('/public/stores', { auth: false });

export const getPublicStore = async (storeId) => {
  // DEV 전용 테마 프리뷰(/s/preview)는 백엔드 없이 mock 으로 유지
  if (import.meta.env.DEV && storeId === 'preview') return mockApi.getPublicStore('preview');
  const data = await request(`/public/stores/${storeId}`, { auth: false });
  const { story, ...rest } = data;          // 백엔드 중첩 story → 평면화 (StoryPage 계약)
  return {
    ...rest,
    ...(story ?? {}),
    // 가게명·주소를 최상위로도 노출 (테마 페이지가 store.store_name / store.address 로 접근)
    store_name: rest.basic_info?.store_name ?? null,
    address: rest.basic_info?.address ?? null,
  };
};

/** 미디어 상대경로 → 절대 URL (mock 단계에선 blob: URL이라 그대로 반환) */
export const mediaUrl = (path) =>
  path?.startsWith('blob:') || path?.startsWith('data:') || path?.startsWith('http')
    ? path
    : `${import.meta.env.VITE_API_HOST ?? ''}${path ?? ''}`;