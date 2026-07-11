import { useCallback, useEffect, useState, type RefObject } from 'react';

export function useFullscreen(ref?: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const enter = useCallback(() => {
    const el = ref?.current || document.documentElement;
    return el.requestFullscreen?.().catch(() => {});
  }, [ref]);

  const exit = useCallback(() => {
    if (document.fullscreenElement) {
      return document.exitFullscreen().catch(() => {});
    }
    return Promise.resolve();
  }, []);

  const toggle = useCallback(() => {
    return document.fullscreenElement ? exit() : enter();
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
