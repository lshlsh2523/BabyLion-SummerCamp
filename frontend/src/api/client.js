/**
 * ★ 서버 호출이 모이는 유일한 파일 ★
 *
 * [주말] 아래 함수들은 mock.js 를 호출한다.
 * [월요일 교체 방법] 각 함수 내부를 실제 fetch 로 바꾸면 끝.
 *   - BASE = `${import.meta.env.VITE_API_HOST}/api/v1`
 *   - 쓰기 요청 헤더: 'X-Edit-Token': editToken (POST /stores 제외)
 *   - 미디어 URL: 응답의 상대경로에 VITE_API_HOST 를 붙여 사용
 * 페이지·컴포넌트 코드는 한 줄도 바꾸지 않는 것이 목표.
 */
import { mockApi } from './mock';

// 월요일: const BASE = `${import.meta.env.VITE_API_HOST}/api/v1`;

export const createStore    = ()                        => mockApi.createStore();
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