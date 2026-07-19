import { useCallback, useRef } from 'react';
import { getJob } from '../api/client';
import { CONFIG } from '../constants/config';

/**
 * 생성 job 폴링 (명세서 5.2).
 * pollJob(jobId) → 'done' 또는 'failed' 를 resolve.
 * 2초 간격, 90초 타임아웃(타임아웃 = failed 동일 처리).
 */
export function usePolling() {
  const stopped = useRef(false);

  const pollJob = useCallback(async (jobId) => {
    stopped.current = false;
    const deadline = Date.now() + CONFIG.POLL_TIMEOUT_MS;

    while (!stopped.current && Date.now() < deadline) {
      try {
        const { status } = await getJob(jobId);
        if (status === 'done' || status === 'failed') return status;
      } catch {
        return 'failed';
      }
      await new Promise((r) => setTimeout(r, CONFIG.POLL_INTERVAL_MS));
    }
    return 'failed';
  }, []);

  const cancel = useCallback(() => { stopped.current = true; }, []);

  return { pollJob, cancel };
}
