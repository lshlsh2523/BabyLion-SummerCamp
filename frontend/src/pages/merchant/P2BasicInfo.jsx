import { useEffect, useRef, useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { saveBasicInfo } from '../../api/client';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import ProgressBar from '../../components/ProgressBar';
import BigButton from '../../components/BigButton';
import BackButton from '../../components/BackButton';
import './P2BasicInfo.css';

/**
 * P2 · 핵심 정보 — 한 화면 = 한 질문, 4단계.
 * ① 창업연도(연도 슬라이더 — 수행일지 확정)
 * ② 대표 메뉴(음성 → mock 단계에선 예시 텍스트로 저장)
 * ③ 가격(숫자 키패드) ④ 영업시간(시간대·휴무 버튼)
 */
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;
const DEFAULT_YEARS_AGO = 30;
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const OPEN_OPTIONS = ['07:00', '09:00', '11:00'];
const CLOSE_OPTIONS = ['18:00', '20:00', '22:00'];

const clampYear = (y) => Math.min(CURRENT_YEAR, Math.max(MIN_YEAR, y));

export default function P2BasicInfo({ speak, speaking }) {
  const { storeId, basicInfo, setBasicInfo, goTo } = useFlow();
  const [stepIdx, setStepIdx] = useState(0);
  const [priceInput, setPriceInput] = useState('');
  const sliderSaveTimer = useRef(null);
  const step = MESSAGES.P2.steps[stepIdx];
  const year = basicInfo.founded_year ?? CURRENT_YEAR - DEFAULT_YEARS_AGO;

  const save = async (partial) => {
    setBasicInfo(partial);
    await saveBasicInfo(storeId, partial);  // PUT /basic-info (부분 갱신)
  };

  // 창업연도 기본값(현재-30년) 확정 — 사용자가 슬라이더를 안 만져도 "다음"에 값이 저장돼 있도록.
  useEffect(() => {
    if (basicInfo.founded_year == null) save({ founded_year: year });
    return () => clearTimeout(sliderSaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 클램프 후 로컬 반영 + 저장 + TTS. −/+ 버튼과 슬라이더 release(손 뗀 시점)에서만 호출. */
  const commitYear = (y) => {
    clearTimeout(sliderSaveTimer.current);
    const clamped = clampYear(y);
    save({ founded_year: clamped });
    speak(`${clamped}년`);   // useSpeak이 매 호출 전 cancel() 하므로 연타해도 마지막 값만 낭독
  };

  /** 드래그 중(input) — 화면은 즉시, 네트워크 저장만 250ms 디바운스. TTS는 여기서 하지 않음
   *  (드래그 중 잠깐 멈출 때마다 읽으면 산만해지므로 release 시점의 commitYear에서만 낭독). */
  const handleSliderInput = (e) => {
    const y = clampYear(Number(e.target.value));
    setBasicInfo({ founded_year: y });
    clearTimeout(sliderSaveTimer.current);
    sliderSaveTimer.current = setTimeout(() => {
      saveBasicInfo(storeId, { founded_year: y });
    }, 250);
  };

  const handleSliderChange = (e) => commitYear(Number(e.target.value));

  const adjustYear = (delta) => {
    navigator.vibrate?.(15);
    commitYear(year + delta);
  };

  const goNextStep = () => {
    const next = stepIdx + 1;
    if (next < MESSAGES.P2.steps.length) {
      setStepIdx(next);
      speak(MESSAGES.P2.steps[next].tts);
    } else {
      speak(MESSAGES.P3.questions[0].tts);
      goTo('P3');
    }
  };
  const goPrevStep = () => (stepIdx === 0 ? goTo('P1') : setStepIdx(stepIdx - 1));

  /* ---- 단계별 본문 ---- */
  const body = {
    foundedYear: (
      <div className="p2-year">
        <p className="p2-year__display" aria-live="polite">{year}년</p>

        <div className="p2-year__slider-row">
          <button type="button" className="p2-year__step" aria-label="1년 전으로"
                  disabled={year <= MIN_YEAR} onClick={() => adjustYear(-1)}>−</button>

          <input
            type="range"
            className="p2-year__slider"
            min={MIN_YEAR}
            max={CURRENT_YEAR}
            step={1}
            value={year}
            onInput={handleSliderInput}
            onChange={handleSliderChange}
            aria-label="창업 연도"
            aria-valuetext={`${year}년`}
            style={{
              background: `linear-gradient(to right, var(--green-600) ${((year - MIN_YEAR) / (CURRENT_YEAR - MIN_YEAR)) * 100}%, var(--bg-track) ${((year - MIN_YEAR) / (CURRENT_YEAR - MIN_YEAR)) * 100}%)`,
            }}
          />

          <button type="button" className="p2-year__step" aria-label="1년 후로"
                  disabled={year >= CURRENT_YEAR} onClick={() => adjustYear(1)}>+</button>
        </div>
      </div>
    ),

    mainMenu: (
      <div className="p2-menu">
        {basicInfo.main_menu ? (
          <p className="p2-menu__value">"{basicInfo.main_menu}"</p>
        ) : (
          <p className="p2-menu__hint">마이크를 누르고{'\n'}대표 메뉴를 말씀해 주세요</p>
        )}
        {/* mock 단계: 탭 시 예시 STT 결과 저장. 월요일에 useRecorder + STT 연동 */}
        <button className="p2-mic" aria-label="대표 메뉴 말하기"
                onClick={() => { navigator.vibrate?.(15); save({ main_menu: '가마솥 국밥' }); }}>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" />
          </svg>
          <span>눌러서 말하기</span>
        </button>
      </div>
    ),

    price: (
      <div className="p2-price">
        <p className="p2-price__display">
          {priceInput ? `${Number(priceInput).toLocaleString()}원` : '얼마인가요?'}
        </p>
        <div className="p2-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '지움', 0, '000'].map((k) => (
            <button key={k} className="p2-key"
                    onClick={() => {
                      navigator.vibrate?.(10);
                      setPriceInput((p) => {
                        const next = k === '지움' ? p.slice(0, -1) : (p + k).slice(0, 8);
                        if (next) save({ price: Number(next) });
                        return next;
                      });
                    }}>
              {k}
            </button>
          ))}
        </div>
      </div>
    ),

    hours: (
      <div className="p2-hours">
        <div className="p2-hours__row" role="group" aria-label="문 여는 시간">
          <span className="p2-hours__label">여는 시간</span>
          {OPEN_OPTIONS.map((t) => (
            <button key={t}
                    className={`p2-chip${basicInfo.hours?.open === t ? ' p2-chip--on' : ''}`}
                    onClick={() => save({ hours: { close: '20:00', closed_days: [], ...basicInfo.hours, open: t } })}>
              {t}
            </button>
          ))}
        </div>
        <div className="p2-hours__row" role="group" aria-label="문 닫는 시간">
          <span className="p2-hours__label">닫는 시간</span>
          {CLOSE_OPTIONS.map((t) => (
            <button key={t}
                    className={`p2-chip${basicInfo.hours?.close === t ? ' p2-chip--on' : ''}`}
                    onClick={() => save({ hours: { open: '09:00', closed_days: [], ...basicInfo.hours, close: t } })}>
              {t}
            </button>
          ))}
        </div>
        <div className="p2-hours__row p2-hours__row--days" role="group" aria-label="쉬는 요일">
          <span className="p2-hours__label">쉬는 날</span>
          <div className="p2-days-grid">
            {DAYS.map((d) => {
              const days = basicInfo.hours?.closed_days ?? [];
              const on = days.includes(d);
              return (
                <button key={d} className={`p2-chip p2-chip--day${on ? ' p2-chip--on' : ''}`}
                        onClick={() => save({
                          hours: { open: '09:00', close: '20:00', ...basicInfo.hours,
                                   closed_days: on ? days.filter((x) => x !== d) : [...days, d] },
                        })}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    ),
  }[step.key];

  const stepDone = {
    foundedYear: true,   // 기본값(현재-30년)이 항상 있으므로 상시 활성
    mainMenu: !!basicInfo.main_menu,
    price: !!basicInfo.price,
    hours: !!basicInfo.hours?.open,
  }[step.key];

  return (
    <ScreenLayout
      title={step.title}
      progress={<ProgressBar total={MESSAGES.P2.steps.length} current={stepIdx + 1} />}
      speaking={speaking}
      actions={
        <>
          <BackButton onClick={goPrevStep} />
          <BigButton onClick={goNextStep} disabled={!stepDone}>{MESSAGES.P2.nextBtn}</BigButton>
        </>
      }
    >
      {body}
    </ScreenLayout>
  );
}
