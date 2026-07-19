import { useEffect, useRef, useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { uploadPhoto, deletePhoto, mediaUrl } from '../../api/client';
import { CONFIG } from '../../constants/config';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import ProgressBar from '../../components/ProgressBar';
import BigButton from '../../components/BigButton';
import BackButton from '../../components/BackButton';
import GrandmaShooting from '../../components/illustrations/GrandmaShooting';
import './P1Photo.css';

const STEP_VARIANTS = ['sign', 'menuboard', 'menu', 'interior'];

/** P1 · 사진 촬영: 간판 → 메뉴판 → 대표 메뉴 → 내부 순 가이드, 최소 4장 */
export default function P1Photo({ speak, speaking }) {
  const { storeId, photos, setPhotos, goTo } = useFlow();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const spokenDoneRef = useRef(false);

  const stepIdx = Math.min(photos.length, MESSAGES.P1.steps.length - 1);
  const step = MESSAGES.P1.steps[stepIdx];
  const variant = STEP_VARIANTS[stepIdx];
  const lastPhoto = photos[photos.length - 1];
  const isDone = photos.length >= CONFIG.PHOTO_MIN;

  useEffect(() => {
    if (isDone) {
      if (!spokenDoneRef.current) {
        spokenDoneRef.current = true;
        speak(MESSAGES.P1.doneTts);
      }
    } else {
      spokenDoneRef.current = false;
    }
  }, [isDone, speak]);

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

  const handleBack = async () => {
    if (busy) return;
    if (!lastPhoto) {
      goTo('P0');
      return;
    }
    setBusy(true);
    try {
      await deletePhoto(storeId, lastPhoto.photo_id);  // DELETE /photos/{id}
      const next = photos.slice(0, -1);
      setPhotos(next);
      const prevStepIdx = Math.min(next.length, MESSAGES.P1.steps.length - 1);
      speak(MESSAGES.P1.steps[prevStepIdx].tts);
    } finally {
      setBusy(false);
    }
  };

  if (isDone) {
    const doneLabels = MESSAGES.P1.doneLabels;
    return (
      <ScreenLayout
        speaking={speaking}
        hideWave
        actions={
          <>
            <BackButton onClick={handleBack} disabled={busy} />
            <BigButton onClick={() => { speak(MESSAGES.P2.steps[0].tts); goTo('P2'); }}>
              {MESSAGES.P1.nextBtn}
            </BigButton>
          </>
        }
      >
        <div className="p1-done">
          <div className="p1-done__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff"
                 strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="p1-done__title">{MESSAGES.P1.doneTitle}</p>
          <div className="p1-done__grid">
            {photos.slice(0, CONFIG.PHOTO_MIN).map((photo, i) => (
              <div key={photo.photo_id} className="p1-done__item">
                <img className="p1-done__img" src={mediaUrl(photo.url)} alt={`${doneLabels[i]} 사진`} />
                <span className="p1-done__label">{doneLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title={step.title}
      progress={<ProgressBar total={CONFIG.PHOTO_MIN} current={Math.min(photos.length + 1, CONFIG.PHOTO_MIN)} />}
      speaking={speaking}
      actions={
        <>
          <BackButton onClick={handleBack} disabled={busy} />
          <BigButton onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? '올리는 중…' : MESSAGES.P1.shootBtn}
          </BigButton>
        </>
      }
    >
      <input ref={inputRef} type="file" accept="image/*" capture="environment"
             onChange={handleFile} hidden />

      <div className="photo-frame">
        <GrandmaShooting variant={variant} />
        <span className="photo-frame__corner photo-frame__corner--tl" aria-hidden="true" />
        <span className="photo-frame__corner photo-frame__corner--tr" aria-hidden="true" />
        <span className="photo-frame__corner photo-frame__corner--bl" aria-hidden="true" />
        <span className="photo-frame__corner photo-frame__corner--br" aria-hidden="true" />
      </div>

      {photos.length > 0 && (
        <div className="photo-thumbs">
          {photos.map((photo, i) => {
            const isLast = i === photos.length - 1;
            return (
              <div key={photo.photo_id} className={`photo-thumb${isLast ? ' photo-thumb--last' : ''}`}>
                <img className="photo-thumb__img" src={mediaUrl(photo.url)} alt={`찍은 사진 ${i + 1}장째`} />
              </div>
            );
          })}
        </div>
      )}
    </ScreenLayout>
  );
}
