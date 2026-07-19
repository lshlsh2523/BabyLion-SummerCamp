/**
 * API 명세서 v1의 mock 구현 (주말용).
 * 실제 서버와 동일한 응답 형태·지연·상태 전이를 재현한다.
 * 월요일: 이 파일은 그대로 두고 client.js의 import만 실제 fetch로 교체.
 */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const uuid = () => crypto.randomUUID();

// 인메모리 DB (새로고침 시 초기화 — 진행 상태는 FlowContext가 sessionStorage로 복구)
const db = { stores: new Map(), jobs: new Map() };

const SAMPLE_STORY = {
  title: '40년 가마솥이 끓는 집, 순자네국밥',
  story_lines: [
    '어머니에게 물려받은 자리에서 40년, 국물은 아직도 가마솥에서 끓는다.',
    '새벽 네 시, 하루도 거르지 않고 불을 지피는 것이 이 집의 비결.',
    '"국물은 새벽 네 시부터 고아야 혀" — 사장님의 원칙은 42년째 그대로다.',
  ],
  hashtags: ['#40년전통', '#가마솥국밥', '#중앙시장'],
  theme_id: 'warm_old',
  quoted_sentence: '국물은 새벽 네 시부터 고아야 혀',
};

// 재생성 시 다른 결과가 오는 것을 시뮬레이션
const SAMPLE_STORY_ALT = {
  ...SAMPLE_STORY,
  title: '새벽 네 시의 가마솥, 순자네국밥',
  story_lines: [
    '중앙시장 한 자리에서 42년, 어머니의 가마솥이 그대로 끓는다.',
    '뽀얀 국물의 비결은 새벽 네 시부터 고아내는 정성 하나.',
    '"우리 집 국물은 거짓말을 못 혀" — 사장님의 자부심이다.',
  ],
  quoted_sentence: '우리 집 국물은 거짓말을 못 혀',
};

export const mockApi = {
  async createStore() {
    await delay(300);
    const store = {
      store_id: uuid(),
      edit_token: uuid(),
      published: false,
      basic_info: null,
      photos: [],
      answers: [],
      story: null,
      public_url: null,
      regen_count: 0,
    };
    db.stores.set(store.store_id, store);
    return { store_id: store.store_id, edit_token: store.edit_token };
  },

  async getStore(storeId) {
    await delay(200);
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };
    const { edit_token, regen_count, ...rest } = s;
    return rest;
  },

  async uploadPhoto(storeId, file) {
    await delay(600);
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };
    if (s.photos.length >= 5) throw { status: 409, code: 'LIMIT_EXCEEDED' };
    const photo = {
      photo_id: uuid(),
      url: URL.createObjectURL(file), // mock: 로컬 미리보기 URL
      sort_order: s.photos.length + 1,
    };
    s.photos.push(photo);
    return photo;
  },

  async deletePhoto(storeId, photoId) {
    await delay(200);
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };
    s.photos = s.photos.filter((p) => p.photo_id !== photoId);
    return null; // 204
  },

  async saveBasicInfo(storeId, partial) {
    await delay(200);
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };
    s.basic_info = { ...(s.basic_info ?? {}), ...partial };
    return s.basic_info;
  },

  async uploadAnswer(storeId, questionNo, _blob) {
    await delay(1500); // 실제는 STT 포함 5~15초 — 로딩 UI 확인용으로 단축
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };
    const transcript = [
      '사십 년째 같은 자리서 어머니한테 물려받아서 하고 있어유',
      '국물은 새벽 네 시부터 고아야 혀, 가마솥에서 끓여야 그 맛이 나',
      '우리 집 국물은 거짓말을 못 혀, 그게 제일 자랑이지',
    ][questionNo - 1];
    const answer = { answer_id: uuid(), question_no: questionNo, transcript };
    s.answers = [...s.answers.filter((a) => a.question_no !== questionNo), answer]; // 재업로드 = 덮어쓰기
    return answer;
  },

  async generate(storeId, { retry = false } = {}) {
    await delay(300);
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };

    // 사전 조건 검사 (명세서 5.1)
    const missing = [];
    if (s.photos.length < 3) missing.push(`photos(${s.photos.length}/3)`);
    for (const no of [1, 2, 3])
      if (!s.answers.some((a) => a.question_no === no)) missing.push(`answers(q${no})`);
    if (!s.basic_info?.main_menu) missing.push('basic_info.main_menu');
    if (!s.basic_info?.price) missing.push('basic_info.price');
    if (missing.length) throw { status: 400, code: 'PRECONDITION_FAILED', missing };

    if (retry && s.regen_count >= 5) throw { status: 409, code: 'LIMIT_EXCEEDED' };
    if (retry) s.regen_count += 1;

    const job_id = uuid();
    db.jobs.set(job_id, { status: 'processing', storeId, retry });
    setTimeout(() => {
      db.jobs.get(job_id).status = 'done';
      s.story = retry ? SAMPLE_STORY_ALT : SAMPLE_STORY; // 3초 뒤 완료 (명세서 백1 임시 버전과 동일)
    }, 3000);
    return { job_id };
  },

  async getJob(jobId) {
    await delay(100);
    const j = db.jobs.get(jobId);
    if (!j) throw { status: 404, code: 'JOB_NOT_FOUND' };
    return { job_id: jobId, status: j.status, error: null };
  },

  async publish(storeId) {
    await delay(300);
    const s = db.stores.get(storeId);
    if (!s) throw { status: 404, code: 'STORE_NOT_FOUND' };
    if (!s.story) throw { status: 400, code: 'PRECONDITION_FAILED' };
    s.published = true;
    s.public_url = `/s/${storeId}`;
    return { public_url: s.public_url };
  },

  async getPublicStore(storeId) {
    await delay(200);
    const s = db.stores.get(storeId);
    if (!s || !s.published) throw { status: 404, code: 'STORE_NOT_FOUND' };
    return {
      store_id: s.store_id,
      title: s.story.title,
      theme_id: s.story.theme_id,
      basic_info: s.basic_info,
      story_lines: s.story.story_lines,
      hashtags: s.story.hashtags,
      photos: s.photos.map(({ url, sort_order }) => ({ url, sort_order })),
    };
  },
};
