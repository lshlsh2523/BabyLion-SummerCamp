import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../constants/config';

/**
 * 상인 플로우 전역 상태.
 * - 단일 라우트('/') 안에서 step 으로 화면 전환 (브라우저 뒤로가기 비의존 원칙)
 * - 전체 상태를 sessionStorage 에 동기화 → 새로고침 복구 (명세서 4.2)
 *
 * step: 'SPLASH' | 'ROLE' | 'SIGNUP' | 'MAP' | 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
 */
const initialState = {
  step: 'SPLASH',
  storeId: null,
  editToken: null,
  photos: [],            // [{ photo_id, url, sort_order }]
  basicInfo: {},         // { founded_year, main_menu, price, hours }
  answersDone: [],       // 완료된 question_no 배열 [1,2,3]
  story: null,
  publicUrl: null,
};

const load = () => {
  try {
    const raw = sessionStorage.getItem(CONFIG.SESSION_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
};

const FlowContext = createContext(null);

export function FlowProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => ({
    ...state,
    goTo: (step) => setState((s) => ({ ...s, step })),
    setStore: ({ store_id, edit_token }) =>
      setState((s) => ({ ...s, storeId: store_id, editToken: edit_token })),
    setPhotos: (photos) => setState((s) => ({ ...s, photos })),
    setBasicInfo: (partial) =>
      setState((s) => ({ ...s, basicInfo: { ...s.basicInfo, ...partial } })),
    markAnswerDone: (no) =>
      setState((s) => ({ ...s, answersDone: [...new Set([...s.answersDone, no])] })),
    setStory: (story) => setState((s) => ({ ...s, story })),
    setPublicUrl: (publicUrl) => setState((s) => ({ ...s, publicUrl })),
    reset: () => {
      sessionStorage.removeItem(CONFIG.SESSION_KEY);
      setState(initialState);
    },
  }), [state]);

  return <FlowContext.Provider value={api}>{children}</FlowContext.Provider>;
}

export const useFlow = () => {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used within <FlowProvider>');
  return ctx;
};
