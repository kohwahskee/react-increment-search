import { useEffect } from 'react';

export default function useOptionShortcut(
  isShown: boolean,
  setFn: (value: boolean) => void
) {
  // Update generated queries when options change
  useEffect(() => {
    if (isShown) {
      document.addEventListener('keydown', keyDownHandler);
    }

    function keyDownHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setFn(false);
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [isShown, setFn]);
}
