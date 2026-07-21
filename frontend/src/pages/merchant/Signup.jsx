import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import BackButton from '../../components/BackButton';
import './Signup.css';

/**
 * SIGNUP · 가게 사장님 회원가입 (시연용).
 * 서버 저장 없이 이름/비밀번호/가게 이름 + GPS 수집 동의만 채우면 다음 단계로 진행.
 */
export default function Signup({ speak, speaking }) {
  const { goTo } = useFlow();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [gpsAgree, setGpsAgree] = useState(false);

  const canSubmit = name.trim() && password.trim() && storeName.trim() && gpsAgree;

  const handleSubmit = () => {
    if (!canSubmit) return;
    speak(MESSAGES.P0.tts);
    goTo('P0');
  };

  return (
    <ScreenLayout
      title={MESSAGES.SIGNUP.title}
      speaking={speaking}
      hideWave
      actions={
        <>
          <BackButton onClick={() => goTo('ROLE')} />
          <BigButton onClick={handleSubmit} disabled={!canSubmit}>
            {MESSAGES.SIGNUP.submitBtn}
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
