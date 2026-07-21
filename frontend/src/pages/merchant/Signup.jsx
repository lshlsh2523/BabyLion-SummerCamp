import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { createStore, saveBasicInfo } from '../../api/client';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import BackButton from '../../components/BackButton';
import './Signup.css';

/**
 * SIGNUP · 가게 사장님 회원가입 (시연용).
 * 이름/비밀번호는 시연상 저장하지 않지만, 가게 이름은 실서버 store 를 만들어 저장한다.
 * (store 생성을 여기서 하므로 이후 주소 음성 입력·사진·정보가 같은 store 에 쌓인다.)
 */
export default function Signup({ speak, speaking }) {
  const { goTo, setStore, setBasicInfo } = useFlow();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [gpsAgree, setGpsAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() && password.trim() && storeName.trim() && gpsAgree;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await createStore();                       // POST /stores
      setStore(res);
      const trimmed = storeName.trim();
      await saveBasicInfo(res.store_id, { store_name: trimmed });   // 가게명 저장
      setBasicInfo({ store_name: trimmed });
      speak(MESSAGES.ADDRESS.tts);
      goTo('ADDRESS');
    } catch (e) {
      console.error('[signup] 가입 처리 실패:', e);
      alert('가입 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      title={MESSAGES.SIGNUP.title}
      speaking={speaking}
      hideWave
      actions={
        <>
          <BackButton onClick={() => goTo('ROLE')} />
          <BigButton onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? '가입 중…' : MESSAGES.SIGNUP.submitBtn}
          </BigButton>
        </>
      }
    >
      <div className="signup-form">
        <label className="signup-field">
          <span className="signup-field__label">{MESSAGES.SIGNUP.nameLabel}</span>
          <input
            type="text"
            className="signup-field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={MESSAGES.SIGNUP.namePlaceholder}
            autoComplete="name"
          />
        </label>

        <label className="signup-field">
          <span className="signup-field__label">{MESSAGES.SIGNUP.passwordLabel}</span>
          <input
            type="password"
            className="signup-field__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={MESSAGES.SIGNUP.passwordPlaceholder}
            autoComplete="new-password"
          />
        </label>

        <label className="signup-field">
          <span className="signup-field__label">{MESSAGES.SIGNUP.storeNameLabel}</span>
          <input
            type="text"
            className="signup-field__input"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder={MESSAGES.SIGNUP.storeNamePlaceholder}
            autoComplete="off"
          />
        </label>

        <label className="signup-gps">
          <input
            type="checkbox"
            className="signup-gps__checkbox"
            checked={gpsAgree}
            onChange={(e) => setGpsAgree(e.target.checked)}
          />
          <span className="signup-gps__text">{MESSAGES.SIGNUP.gpsAgree}</span>
        </label>
      </div>
    </ScreenLayout>
  );
}
