import { useCallback, useState } from 'react';

export type SubmitStatus = 'idle' | 'saving' | 'saved' | 'failed';

/** Tracks one form's save: in progress, done, or failed (e.g. storage blocked). */
export function useSubmitStatus() {
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const run = useCallback(async (save: () => Promise<void>) => {
    setStatus('saving');
    try {
      await save();
      setStatus('saved');
    } catch {
      setStatus('failed');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  return { status, run, reset };
}
