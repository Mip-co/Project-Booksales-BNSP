import { useCallback, useEffect, useRef, useState } from 'react';

/** Notifikasi singkat yang hilang sendiri. Pemakaian: const [notice, flash] = useNotice(); */
export function useNotice(duration = 3000) {
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }
  const timer = useRef(null);

  const flash = useCallback(
    (type, text) => {
      clearTimeout(timer.current);
      setNotice({ type, text });
      timer.current = setTimeout(() => setNotice(null), duration);
    },
    [duration]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [notice, flash];
}
