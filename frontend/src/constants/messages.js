/**
 * 전 화면 안내 문구 통합 파일.
 * - 화면 표시 텍스트와 TTS(useSpeak) 입력을 겸한다 (수행일지 결정 #1)
 * - title: 화면 상단 큰 글씨 (강조어는 *별표*로 감싸면 <em> 처리)
 * - tts: 음성으로 읽어줄 문장 (없으면 title에서 별표 제거 후 사용)
 */
export const MESSAGES = {
  SPLASH: {
    title: '휴대폰 소리를\n켜 주세요',
    sub: '화면을 누르면 시작돼요',
  },
  P0: {
    title: '우리 가게 이야기,\n널리 알려 볼까요?',
    tts: '우리 가게 이야기, 널리 알려 볼까요? 아래 초록 버튼을 눌러서 시작해 주세요.',
    startBtn: '눌러서 시작하기',
  },
  P1: {
    steps: [
      { key: 'signboard', title: '가게 *간판*을\n찍어주세요',   tts: '가게 간판을 찍어주세요.' },
      { key: 'menu',      title: '*대표 메뉴*를\n찍어주세요',   tts: '이제 대표 메뉴를 찍어주세요.' },
      { key: 'inside',    title: '가게 *안 모습*을\n찍어주세요', tts: '마지막으로 가게 안 모습을 찍어주세요.' },
    ],
    shootBtn: '사진 찍기',
    retakeBtn: '다시 찍기',
    nextBtn: '다음',
    prevBtn: '이전',
  },
  P2: {
    steps: [
      {
        key: 'foundedYear',
        title: '*언제부터* 장사를\n하셨나요?',
        tts: '언제부터 장사를 하셨나요? 아래에서 골라 주세요.',
        options: [
          { label: '10년 넘게', value: 10 },
          { label: '20년 넘게', value: 20 },
          { label: '30년 넘게', value: 30 },
          { label: '40년 넘게', value: 40 },
        ],
      },
      {
        key: 'mainMenu',
        title: '*대표 메뉴*가\n무엇인가요?',
        tts: '우리 가게 대표 메뉴가 무엇인가요? 마이크를 누르고 말씀해 주세요.',
      },
      {
        key: 'price',
        title: '*가격*은\n얼마인가요?',
        tts: '대표 메뉴 가격은 얼마인가요? 숫자를 눌러 주세요.',
      },
      {
        key: 'hours',
        title: '*언제* 문을\n여시나요?',
        tts: '가게 문을 여는 시간과 쉬는 요일을 골라 주세요.',
      },
    ],
    nextBtn: '다음',
    prevBtn: '이전',
  },
  P3: {
    questions: [
      { no: 1, title: '우리 가게, *어떻게*\n시작하셨나요?',      tts: '우리 가게, 어떻게 시작하셨나요? 초록 버튼을 누르고 편하게 말씀해 주세요.' },
      { no: 2, title: '*대표 메뉴*의 비결이\n무엇인가요?',        tts: '대표 메뉴의 비결이 무엇인가요? 버튼을 누르고 말씀해 주세요.' },
      { no: 3, title: '우리 가게에서 *가장*\n*자랑*하고 싶은 건요?', tts: '우리 가게에서 가장 자랑하고 싶은 것은 무엇인가요?' },
    ],
    recordBtn: '눌러서 말하기',
    stopBtn: '눌러서 끝내기',
    reRecordBtn: '다시 말하기',
    nextBtn: '다음',
  },
  P4: {
    title: '우리 가게 소개를\n*만들고 있어요*',
    tts: '우리 가게 소개를 만들고 있어요. 잠시만 기다려 주세요.',
  },
  P5: {
    title: '이렇게 만들었어요.\n*맞나요?*',
    tts: '가게 소개를 이렇게 만들었어요. 화면을 읽어 드릴게요.',
    yesBtn: '네, 맞아요',
    noBtn: '아니오, 다시 만들어 주세요',
  },
  P6: {
    title: '완성됐어요!\n*우리 가게가 생겼어요*',
    tts: '완성됐어요! 우리 가게 소개 페이지가 생겼어요.',
    viewBtn: '내 페이지 보기',
    copied: '주소가 복사됐어요',
  },
  ERROR: {
    // 안내형 에러 문구 (비난형 금지 — 수행일지 결정 #6)
    generateFailed: '소개 만들기가 잠시 멈췄어요.\n아래 버튼을 눌러 다시 해 주세요.',
    retryBtn: '다시 하기',
    photoTooMany: '사진은 다섯 장까지 올릴 수 있어요.',
    recordTooLong: '이야기가 90초를 넘어 자동으로 멈췄어요.\n이대로 쓰거나 다시 말할 수 있어요.',
  },
};

/** title의 *강조* 표기를 제거한 평문 (TTS 기본값 용) */
export const plain = (s) => s.replaceAll('*', '').replaceAll('\n', ' ');
