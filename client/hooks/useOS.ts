import { useEffect, useState } from 'react';

export function useOS() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;
      const android = /Android/i.test(ua);
      const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
      setIsMobile(android || ios || window.innerWidth < 768);
      setIsIOS(ios);
      setIsAndroid(android);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isStandalone, isMobile, isIOS, isAndroid };
}

export default useOS;
