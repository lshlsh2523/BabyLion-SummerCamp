import { useRef, useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { uploadPhoto, deletePhoto, mediaUrl } from '../../api/client';
import { CONFIG } from '../../constants/config';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import ProgressBar from '../../components/ProgressBar';
import BigButton from '../../components/BigButton';
import BackButton from '../../components/BackButton';
import './P1Photo.css';

/** P1 · 사진 촬영: 간판 → 대표 메뉴 → 내부 순 가이드, 최소 3장 */
export default function P1Photo({ speak, speaking }) {
  const { storeId, photos, setPhotos, goTo } = useFlow();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const stepIdx = Math.min(photos.length, MESSAGES.P1.steps.length - 1);
  const step = MESSAGES.P1.steps[stepIdx];
  const lastPhoto = photos[photos.length - 1];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || busy) return;
    setBusy(true);
    try {
      const photo = await uploadPhoto(storeId, file);  // POST /photos
      const next = [...photos, photo];
      setPhotos(next);
      const nextStep = MESSAGES.P1.steps[next.length];
      if (nextStep) speak(nextStep.tts);
    } catch (err) {
      if (err.code === 'LIMIT_EXCEEDED') speak(MESSAGES.ERROR.photoTooMany);
    } finally {
      setBusy(false);
    }
  };

  const handleRetake = async () => {
    if (!lastPhoto || busy) return;
    setBusy(true);
    try {
      await deletePhoto(storeId, lastPhoto.photo_id);  // DELETE /photos/{id}
      setPhotos(photos.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  const canNext = photos.length >= CONFIG.PHOTO_MIN;

  return (
    <ScreenLayout
      title={step.title}
      progress={<ProgressBar total={CONFIG.PHOTO_MIN} current={Math.min(photos.length + 1, CONFIG.PHOTO_MIN)} />}
      speaking={speaking}
      actions={
        <>
          <BackButton onClick={() => goTo('P0')} />
          {canNext ? (
            <BigButton onClick={() => { speak(MESSAGES.P2.steps[0].tts); goTo('P2'); }}>
              {MESSAGES.P1.nextBtn}
            </BigButton>
          ) : (
            <BigButton onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? '올리는 중…' : MESSAGES.P1.shootBtn}
            </BigButton>
          )}
        </>
      }
    >
      <input ref={inputRef} type="file" accept="image/*" capture="environment"
             onChange={handleFile} hidden />

      <div className="photo-frame">
        {lastPhoto ? (
          <img className="photo-frame__img" src={mediaUrl(lastPhoto.url)} alt={`찍은 사진 ${photos.length}장째`} />
        ) : (
          <p className="photo-frame__hint">아래 버튼을 누르면{'\n'}카메라가 열려요</p>
        )}
        <span className="photo-frame__corner photo-frame__corner--tl" aria-hidden="true" />
        <span className="photo-frame__corner photo-frame__corner--tr" aria-hidden="true" />
        <span className="photo-frame__corner photo-frame__corner--bl" aria-hidden="true" />
        <span className="photo-frame__corner photo-frame__corner--br" aria-hidden="true" />
      </div>

      {lastPhoto && (
        <div className="photo-sub-actions">
          <button className="photo-retake" onClick={handleRetake} disabled={busy}>
            {MESSAGES.P1.retakeBtn}
          </button>
          {canNext && photos.length < CONFIG.PHOTO_MAX && (
            <button className="photo-retake" onClick={() => inputRef.current?.click()} disabled={busy}>
              한 장 더 찍기
            </button>
          )}
        </div>
      )}
    </ScreenLayout>
  );
}
