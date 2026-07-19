import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import GrandmaCheer from '../../components/illustrations/GrandmaCheer';
import './P6Done.css';

/** P6 · 발행 완료: 링크 박스 탭 = 복사 (별도 복사 버튼 대신 — 수행일지 #5) */
export default function P6Done({ speak, speaking }) {
  const { publicUrl } = useFlow();
  const [copied, setCopied] = useState(false);
  const fullUrl = `${window.location.origin}${publicUrl}`;

  const handleCopy = async () => {
    navigator.vibrate?.(15);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      speak(MESSAGES.P6.copied);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* http 환경 등 클립보드 미지원 시 무시 */ }
  };

  return (
    <ScreenLayout
      title={MESSAGES.P6.title}
      speaking={speaking}
      hideWave
      actions={
        <BigButton onClick={() => window.open(fullUrl, '_blank')}>
          {MESSAGES.P6.viewBtn}
        </BigButton>
      }
    >
      <GrandmaCheer />
      <button className="p6-link" onClick={handleCopy} aria-label="주소 복사하기">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--green-icon)"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
        </svg>
        <span>{copied ? MESSAGES.P6.copied : fullUrl.replace(/^https?:\/\//, '')}</span>
      </button>
    </ScreenLayout>
  );
}
